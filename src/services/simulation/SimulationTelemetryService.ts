import { calculateEconomics, calculateEnvironment, daylightIrradiance, round } from "../../domain/calculations";
import type { ScenarioId, SimulationInputs, TelemetrySnapshot } from "../../domain/types";
import type { TelemetryService } from "../contracts/TelemetryService";

export function createSimulationSnapshot(scenario: ScenarioId, inputs: SimulationInputs, now = new Date()): TelemetrySnapshot {
  const pulse = Math.sin(now.getTime() / 18_000);
  const irradiance = daylightIrradiance(inputs.clockHour, inputs.weather, inputs.irradianceScalePercent);
  const shadePowerFactor = inputs.agrivoltaicLayout === "partial-shade" ? 1 : inputs.agrivoltaicLayout === "open-field" ? 0.96 : 0.92;
  let pvPowerKw = inputs.pvCapacityKw * (irradiance / 1_000) * 0.82 * shadePowerFactor;
  const zoneLoadFactor = Math.max(0.35, inputs.activeZoneIds.length || 0);
  const hydraulicLoad = inputs.landAreaHa * (0.72 + inputs.totalHeadM * 0.032) * zoneLoadFactor;
  let pumpPowerKw = inputs.activeZoneIds.length > 0 ? Math.min(8.5, Math.max(0.65, hydraulicLoad)) : 0;
  let gridPowerKw = inputs.gridAvailable ? Math.max(0, pumpPowerKw - pvPowerKw) : 0;
  let energySatisfied = pumpPowerKw === 0 || pvPowerKw + gridPowerKw >= pumpPowerKw * 0.98;
  let flowLps = pumpPowerKw > 0 && energySatisfied ? pumpPowerKw * 1.9 * (22 / Math.max(8, inputs.totalHeadM)) : 0;
  let pressureBar = pumpPowerKw > 0 ? inputs.totalHeadM / 10.2 : 0;
  const fillingRate = pumpPowerKw > 0 ? Math.max(0, flowLps * 0.42 - inputs.activeZoneIds.length * inputs.irrigationDemandPercent / 85) : 0;
  const drawRate = inputs.activeZoneIds.length * inputs.irrigationDemandPercent / 220;
  let tankLevelPercent = inputs.tankStartPercent + (inputs.clockHour - 8) * (fillingRate - drawRate);
  tankLevelPercent = Math.min(98, Math.max(4, tankLevelPercent));
  let systemStatus: TelemetrySnapshot["systemStatus"] = energySatisfied ? "normal" : "warning";
  let quality: TelemetrySnapshot["quality"] = "VALID";
  const alerts: TelemetrySnapshot["alerts"] = [];

  if (scenario === "low-tank") tankLevelPercent = 19;
  if (scenario === "reduced-pv") { pvPowerKw *= 0.34; gridPowerKw = inputs.gridAvailable ? Math.max(0, pumpPowerKw - pvPowerKw) : 0; }
  if (scenario === "grid-assist") gridPowerKw = inputs.gridAvailable ? Math.max(0.5, pumpPowerKw - pvPowerKw) : 0;
  if (scenario === "abnormal-flow") { flowLps *= 0.16; pressureBar *= 1.2; }
  if (scenario === "pump-fault") { pumpPowerKw = 0; flowLps = 0; pressureBar = 0; gridPowerKw = 0; systemStatus = "critical"; }
  if (scenario === "sensor-offline") { quality = "DEGRADED"; systemStatus = "warning"; }

  energySatisfied = pumpPowerKw === 0 || pvPowerKw + gridPowerKw >= pumpPowerKw * 0.98;
  if (!energySatisfied) { flowLps = 0; pressureBar = 0; systemStatus = "warning"; }

  if (tankLevelPercent < 25) { systemStatus = systemStatus === "critical" ? "critical" : "warning"; alerts.push({ id: "tank-low", level: "warning", title: "Persediaan tandon rendah", detail: "Prioritaskan pengisian saat daya surya tersedia." }); }
  if (!inputs.gridAvailable && !energySatisfied) { systemStatus = "warning"; alerts.push({ id: "grid-unavailable", level: "warning", title: "Energi tidak memenuhi beban", detail: "PLN tidak tersedia; pompa menunggu produksi surya atau pengurangan beban." }); }
  if (scenario === "reduced-pv") alerts.push({ id: "pv-low", level: "warning", title: "Produksi surya berkurang", detail: inputs.gridAvailable ? "Awan menurunkan daya; PLN membantu beban pompa." : "Produksi surya rendah dan PLN tidak tersedia." });
  if (scenario === "abnormal-flow") alerts.push({ id: "flow-low", level: "warning", title: "Debit tidak sesuai daya pompa", detail: "Periksa sumbatan, posisi katup, atau kondisi sumber air." });
  if (scenario === "pump-fault") alerts.push({ id: "pump-fault", level: "critical", title: "Pompa utama berhenti", detail: "Interlock simulasi aktif. Inspeksi panel lapangan diperlukan." });
  if (scenario === "sensor-offline") alerts.push({ id: "sensor-offline", level: "warning", title: "Sensor EC tidak terhubung", detail: "Nilai terakhir tidak digunakan untuk keputusan otomatis." });

  const totalPower = pvPowerKw + gridPowerKw;
  const solarFractionPercent = pumpPowerKw > 0 ? Math.min(100, (Math.min(pvPowerKw, pumpPowerKw) / pumpPowerKw) * 100) : 100;
  const economics = calculateEconomics(inputs, solarFractionPercent);
  const environment = calculateEnvironment(inputs, solarFractionPercent);
  const history = Array.from({ length: 13 }, (_, index) => {
    const hour = (inputs.clockHour - 6 + index * 0.5 + 24) % 24;
    const pointIrradiance = daylightIrradiance(hour, inputs.weather, inputs.irradianceScalePercent);
    const pointPv = inputs.pvCapacityKw * pointIrradiance / 1_000 * 0.82;
    const pointPump = hour >= 8 && hour <= 17 && inputs.activeZoneIds.length > 0 && scenario !== "pump-fault" ? pumpPowerKw : 0;
    const pointGrid = inputs.gridAvailable ? Math.max(0, pointPump - pointPv) : 0;
    return {
      time: `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`,
      pvKw: round(pointPv, 2),
      pumpKw: round(pointPump, 2),
      gridKw: round(pointGrid, 2),
      tankPercent: round(Math.max(4, Math.min(98, tankLevelPercent - 3 + index * 0.5)), 1),
      flowLps: pointPump ? round(flowLps, 2) : 0,
    };
  });

  const sensorOffline = scenario === "sensor-offline";
  return {
    schemaVersion: "1.0", source: "SIMULATION", siteId: "pringgarata-pilot", unitId: "Pilot Unit 01",
    timestamp: now.toISOString(), receivedAt: now.toISOString(), quality, scenario,
    systemMode: "SOLAR_FIRST_GRID_ASSISTED", systemStatus,
    energy: {
      pvPowerKw: round(pvPowerKw, 2), pumpPowerKw: round(pumpPowerKw, 2), gridPowerKw: round(gridPowerKw, 2),
      solarFractionPercent: round(solarFractionPercent),
      solarEnergyTodayKwh: round(pvPowerKw * Math.max(0, inputs.clockHour - 6) * 0.62 + pulse * 0.03),
      gridEnergyTodayKwh: round(gridPowerKw * Math.max(0, inputs.clockHour - 7) * 0.48),
    },
    water: {
      tankLevelPercent: round(tankLevelPercent), tankVolumeM3: round(tankLevelPercent / 100 * inputs.tankCapacityM3),
      flowLps: round(flowLps, 2), pressureBar: round(pressureBar, 2),
      fieldWaterLevelCm: round(3.1 + inputs.irrigationDemandPercent / 50 + (inputs.activeZoneIds.includes("Zona 01") ? 0.8 : -0.4), 1),
      soilMoisturePercent: round(22 + inputs.irrigationDemandPercent / 12 + inputs.activeZoneIds.length * 1.6, 1),
    },
    waterQuality: { ph: 6.9, ecMsCm: 0.72, turbidityNtu: inputs.weather === "rain" ? 31 : 18, temperatureC: 27.4 },
    weather: {
      irradianceWm2: irradiance,
      ambientTemperatureC: round(25 + irradiance * 0.009),
      underPanelTemperatureC: round(25 + irradiance * 0.009 - environment.microclimateCoolingC),
      rainTodayMm: inputs.weather === "rain" ? 12.4 : 0,
    },
    economics: {
      hybridCapexIdr: economics.hybridCapexIdr, dieselAnnualCostIdr: economics.dieselAnnualCostIdr,
      gridAnnualCostIdr: economics.gridAnnualCostIdr, batteryAnnualizedCostIdr: economics.batteryAnnualizedCostIdr,
      hybridAnnualCostIdr: economics.hybridAnnualCostIdr, waterCostIdrM3: economics.waterCostIdrM3,
      simplePaybackYears: economics.simplePaybackYears,
    },
    environment,
    zones: [
      { id: "Zona 01", crop: "Padi", status: inputs.activeZoneIds.includes("Zona 01") ? "irrigating" : "ready", valveOpen: inputs.activeZoneIds.includes("Zona 01") && scenario !== "pump-fault", demandPercent: inputs.irrigationDemandPercent },
      { id: "Zona 02", crop: "Hortikultura", status: inputs.activeZoneIds.includes("Zona 02") ? "irrigating" : scenario === "irrigation-demand" ? "ready" : "resting", valveOpen: inputs.activeZoneIds.includes("Zona 02") && scenario !== "pump-fault", demandPercent: scenario === "irrigation-demand" ? 88 : Math.max(32, inputs.irrigationDemandPercent - 13) },
      { id: "Zona 03", crop: "Palawija", status: inputs.activeZoneIds.includes("Zona 03") ? "irrigating" : "resting", valveOpen: inputs.activeZoneIds.includes("Zona 03") && scenario !== "pump-fault", demandPercent: Math.max(28, inputs.irrigationDemandPercent - 22) },
    ],
    devices: [
      { code: "PV-01", name: "Inverter PLTS", status: scenario === "reduced-pv" ? "warning" : "normal", lastReading: "baru saja" },
      { code: "TL-01", name: "Sensor level tandon", status: "normal", lastReading: "12 detik lalu" },
      { code: "FM-01", name: "Flow meter utama", status: scenario === "abnormal-flow" ? "warning" : "normal", lastReading: "8 detik lalu" },
      { code: "EC-01", name: "Sensor konduktivitas", status: sensorOffline ? "offline" : "normal", lastReading: sensorOffline ? "18 menit lalu" : "44 detik lalu" },
      { code: "RTU-01", name: "Kontroler lapangan", status: scenario === "pump-fault" ? "warning" : "normal", lastReading: "4 detik lalu" },
    ],
    alerts, history,
  };
}

export class SimulationTelemetryService implements TelemetryService {
  async getSnapshot(scenario: ScenarioId, inputs: SimulationInputs): Promise<TelemetrySnapshot> {
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    return createSimulationSnapshot(scenario, inputs);
  }
}
