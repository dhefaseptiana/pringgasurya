import { calculateEconomics, calculateEnvironment, round } from "../../domain/calculations";
import type { ScenarioId, SimulationInputs, TelemetrySnapshot } from "../../domain/types";
import type { TelemetryService } from "../contracts/TelemetryService";
import { generateSyntheticDataset, simulationModelInfo } from "./SyntheticSimulationModel";

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(timestamp));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createSimulationSnapshot(scenario: ScenarioId, inputs: SimulationInputs, now = new Date()): TelemetrySnapshot {
  const rows = generateSyntheticDataset(inputs, scenario);
  const current = rows.at(-1)!;
  const historyRows = rows.slice(-49);
  const alerts: TelemetrySnapshot["alerts"] = [];
  let quality: TelemetrySnapshot["quality"] = "VALID";

  if (current.tankLevelPercent < 25) alerts.push({ id: "tank-low", level: "warning", title: "Persediaan tandon rendah", detail: "Prioritaskan pengisian ketika daya surya kembali tersedia." });
  if (!inputs.gridAvailable && current.pumpPowerKw === 0 && inputs.activeZoneIds.length > 0) alerts.push({ id: "grid-unavailable", level: "warning", title: "Energi belum memenuhi beban", detail: "PLN tidak tersedia; pompa menunggu produksi surya yang cukup." });
  if (scenario === "reduced-pv") alerts.push({ id: "pv-low", level: "warning", title: "Produksi surya berkurang", detail: inputs.gridAvailable ? "Tutupan awan menurunkan daya; PLN membantu irigasi aktif." : "Produksi surya rendah dan PLN tidak tersedia." });
  if (scenario === "abnormal-flow") alerts.push({ id: "flow-low", level: "warning", title: "Debit tidak sesuai daya pompa", detail: "Periksa sumbatan, kebocoran, posisi katup, atau kondisi sumber air." });
  if (scenario === "pump-fault") alerts.push({ id: "pump-fault", level: "critical", title: "Pompa utama berhenti", detail: "Interlock simulasi aktif. Pemeriksaan panel lapangan diperlukan." });
  if (scenario === "sensor-offline") {
    quality = "DEGRADED";
    alerts.push({ id: "sensor-offline", level: "warning", title: "Sensor EC tidak terhubung", detail: "Nilai terakhir tidak digunakan untuk keputusan otomatis." });
  }
  if (current.turbidityNtu >= 50) alerts.push({ id: "water-quality", level: "warning", title: "Kekeruhan air meningkat", detail: "Tahan irigasi otomatis sampai pembacaan kembali di bawah 50 NTU." });

  const economics = calculateEconomics(inputs, current.solarFractionPercent);
  const environment = calculateEnvironment(inputs, current.solarFractionPercent);
  const todayKey = current.timestamp.slice(0, 10);
  const todayRows = rows.filter((row) => row.timestamp.startsWith(todayKey));
  const zoneMoistures = [current.zone01Moisture, current.zone02Moisture, current.zone03Moisture];
  const zoneDemands = [current.zone01Demand, current.zone02Demand, current.zone03Demand];
  const crops = ["Padi", "Hortikultura", "Palawija"] as const;
  const sensorOffline = scenario === "sensor-offline";
  const systemStatus = alerts.some((alert) => alert.level === "critical") ? "critical" : alerts.length ? "warning" : current.systemStatus;

  return {
    schemaVersion: "1.0", source: "SIMULATION", siteId: "pringgarata-pilot", unitId: "Pilot Unit 01",
    timestamp: current.timestamp, receivedAt: now.toISOString(), quality, scenario,
    systemMode: "SOLAR_FIRST_GRID_ASSISTED", systemStatus,
    energy: {
      pvPowerKw: current.pvPowerKw, pumpPowerKw: current.pumpPowerKw, gridPowerKw: current.gridPowerKw,
      solarFractionPercent: current.solarFractionPercent,
      solarEnergyTodayKwh: round(todayRows.reduce((sum, row) => sum + row.pvPowerKw * 0.25, 0), 2),
      gridEnergyTodayKwh: round(todayRows.reduce((sum, row) => sum + row.gridPowerKw * 0.25, 0), 2),
    },
    water: {
      tankLevelPercent: current.tankLevelPercent, tankVolumeM3: current.tankVolumeM3,
      flowLps: current.flowLps, pressureBar: current.pressureBar,
      fieldWaterLevelCm: round(clamp((current.zone01Moisture - 55) * 0.16, 0, 7), 1),
      soilMoisturePercent: round((current.zone02Moisture + current.zone03Moisture) / 2, 1),
    },
    waterQuality: { ph: current.ph, ecMsCm: current.ecMsCm, turbidityNtu: current.turbidityNtu, temperatureC: round(current.ambientTemperatureC - 1.1, 1) },
    weather: {
      irradianceWm2: current.irradianceWm2, ambientTemperatureC: current.ambientTemperatureC,
      underPanelTemperatureC: round(current.ambientTemperatureC - environment.microclimateCoolingC, 1),
      rainTodayMm: round(todayRows.reduce((sum, row) => sum + row.rainMm, 0), 1),
      humidityPercent: current.humidityPercent, evapotranspirationMm: current.evapotranspirationMm,
    },
    economics: {
      hybridCapexIdr: economics.hybridCapexIdr, dieselAnnualCostIdr: economics.dieselAnnualCostIdr,
      gridAnnualCostIdr: economics.gridAnnualCostIdr, batteryAnnualizedCostIdr: economics.batteryAnnualizedCostIdr,
      hybridAnnualCostIdr: economics.hybridAnnualCostIdr, waterCostIdrM3: economics.waterCostIdrM3,
      simplePaybackYears: economics.simplePaybackYears,
    },
    environment,
    zones: crops.map((crop, index) => {
      const id = `Zona 0${index + 1}`;
      const valveOpen = inputs.activeZoneIds.includes(id) && scenario !== "pump-fault";
      return {
        id, crop, status: valveOpen ? "irrigating" as const : zoneDemands[index] >= 60 ? "ready" as const : "resting" as const,
        valveOpen, demandPercent: zoneDemands[index], soilMoisturePercent: zoneMoistures[index],
        fieldWaterLevelCm: index === 0 ? round(clamp((zoneMoistures[index] - 55) * 0.16, 0, 7), 1) : 0,
      };
    }),
    devices: [
      { code: "PV-01", name: "Inverter PLTS", status: scenario === "reduced-pv" ? "warning" : "normal", lastReading: "baru saja" },
      { code: "TL-01", name: "Sensor level tandon", status: "normal", lastReading: "12 detik lalu" },
      { code: "FM-01", name: "Flow meter utama", status: scenario === "abnormal-flow" ? "warning" : "normal", lastReading: "8 detik lalu" },
      { code: "EC-01", name: "Sensor konduktivitas", status: sensorOffline ? "offline" : "normal", lastReading: sensorOffline ? "18 menit lalu" : "44 detik lalu" },
      { code: "RTU-01", name: "Kontroler lapangan", status: scenario === "pump-fault" ? "warning" : "normal", lastReading: "4 detik lalu" },
    ],
    alerts,
    history: historyRows.map((row) => ({
      time: formatTime(row.timestamp), timestamp: row.timestamp, pvKw: row.pvPowerKw, pumpKw: row.pumpPowerKw,
      gridKw: row.gridPowerKw, tankPercent: row.tankLevelPercent, flowLps: row.flowLps,
      soilMoisturePercent: round((row.zone02Moisture + row.zone03Moisture) / 2, 1),
      irrigationDemandPercent: round((row.zone01Demand + row.zone02Demand + row.zone03Demand) / 3, 1),
    })),
    model: { ...simulationModelInfo, randomSeed: inputs.randomSeed, simulationStep: inputs.simulationStep },
  };
}

export class SimulationTelemetryService implements TelemetryService {
  async getSnapshot(scenario: ScenarioId, inputs: SimulationInputs): Promise<TelemetrySnapshot> {
    await new Promise((resolve) => window.setTimeout(resolve, 40));
    return createSimulationSnapshot(scenario, inputs);
  }
}
