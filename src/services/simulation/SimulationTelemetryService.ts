import { format } from "date-fns";
import type { ScenarioId, TelemetrySnapshot } from "../../domain/types";
import type { TelemetryService } from "../contracts/TelemetryService";

const round = (value: number, digits = 1) => Number(value.toFixed(digits));

export function createSimulationSnapshot(scenario: ScenarioId, now = new Date()): TelemetrySnapshot {
  const pulse = Math.sin(now.getTime() / 18_000);
  let pvPowerKw = 1.66 + pulse * 0.08;
  let pumpPowerKw = 1.48;
  let gridPowerKw = 0;
  let tankLevelPercent = 74 + pulse * 0.7;
  let flowLps = 2.9 + pulse * 0.06;
  let pressureBar = 2.3 + pulse * 0.04;
  let systemStatus: TelemetrySnapshot["systemStatus"] = "normal";
  let quality: TelemetrySnapshot["quality"] = "VALID";
  const alerts: TelemetrySnapshot["alerts"] = [];

  if (scenario === "low-tank") {
    tankLevelPercent = 19;
    systemStatus = "warning";
    alerts.push({ id: "tank-low", level: "warning", title: "Persediaan tandon rendah", detail: "Prioritaskan pengisian saat daya surya tersedia." });
  }
  if (scenario === "reduced-pv") {
    pvPowerKw = 0.54;
    gridPowerKw = 0.94;
    systemStatus = "warning";
    alerts.push({ id: "pv-low", level: "warning", title: "Produksi surya berkurang", detail: "Awan menurunkan daya; PLN membantu beban pompa." });
  }
  if (scenario === "grid-assist") {
    pvPowerKw = 0.98;
    gridPowerKw = 0.5;
  }
  if (scenario === "abnormal-flow") {
    flowLps = 0.42;
    pressureBar = 2.8;
    systemStatus = "warning";
    alerts.push({ id: "flow-low", level: "warning", title: "Debit tidak sesuai daya pompa", detail: "Periksa sumbatan, posisi katup, atau kondisi sumber air." });
  }
  if (scenario === "pump-fault") {
    pumpPowerKw = 0;
    flowLps = 0;
    pressureBar = 0;
    systemStatus = "critical";
    alerts.push({ id: "pump-fault", level: "critical", title: "Pompa utama berhenti", detail: "Interlock simulasi aktif. Inspeksi panel lapangan diperlukan." });
  }
  if (scenario === "sensor-offline") {
    quality = "DEGRADED";
    systemStatus = "warning";
    alerts.push({ id: "sensor-offline", level: "warning", title: "Sensor EC tidak terhubung", detail: "Nilai terakhir tidak digunakan untuk keputusan otomatis." });
  }

  const totalPower = pvPowerKw + gridPowerKw;
  const solarFractionPercent = totalPower > 0 ? (pvPowerKw / totalPower) * 100 : 0;
  const history = Array.from({ length: 12 }, (_, index) => {
    const pointTime = new Date(now.getTime() - (11 - index) * 60 * 60 * 1000);
    const daylight = Math.max(0, Math.sin(((index + 1) / 12) * Math.PI));
    const pumpActive = index > 2 && index < 10;
    return {
      time: format(pointTime, "HH:mm"),
      pvKw: round(daylight * (scenario === "reduced-pv" ? 0.9 : 2.15), 2),
      pumpKw: pumpActive && scenario !== "pump-fault" ? 1.48 : 0,
      gridKw: pumpActive && daylight < 0.55 ? round(1.48 - daylight * 1.48, 2) : 0,
      tankPercent: round(Math.max(14, tankLevelPercent - 7 + index * 0.7), 1),
      flowLps: pumpActive ? round(flowLps, 2) : 0,
    };
  });

  const sensorOffline = scenario === "sensor-offline";
  return {
    schemaVersion: "1.0",
    source: "SIMULATION",
    siteId: "pringgarata-pilot",
    unitId: "Pilot Unit 01",
    timestamp: now.toISOString(),
    receivedAt: now.toISOString(),
    quality,
    scenario,
    systemMode: "SOLAR_FIRST_GRID_ASSISTED",
    systemStatus,
    energy: {
      pvPowerKw: round(pvPowerKw, 2),
      pumpPowerKw: round(pumpPowerKw, 2),
      gridPowerKw: round(gridPowerKw, 2),
      solarFractionPercent: round(solarFractionPercent),
      solarEnergyTodayKwh: round(6.8 + pulse * 0.1),
      gridEnergyTodayKwh: round(gridPowerKw > 0 ? 1.1 : 0),
    },
    water: {
      tankLevelPercent: round(tankLevelPercent),
      tankVolumeM3: round((tankLevelPercent / 100) * 22),
      flowLps: round(flowLps, 2),
      pressureBar: round(pressureBar, 2),
      fieldWaterLevelCm: round(4.6 + pulse * 0.15),
      soilMoisturePercent: round(31 + pulse * 0.5),
    },
    waterQuality: { ph: 6.9, ecMsCm: 0.72, turbidityNtu: 18, temperatureC: 27.4 },
    weather: {
      irradianceWm2: round(Math.max(0, 735 + pulse * 45)),
      ambientTemperatureC: round(31.8 + pulse * 0.3),
      underPanelTemperatureC: round(29.7 + pulse * 0.25),
      rainTodayMm: 0,
    },
    zones: [
      { id: "Zona 01", crop: "Padi", status: scenario === "pump-fault" ? "ready" : "irrigating", valveOpen: scenario !== "pump-fault", demandPercent: 72 },
      { id: "Zona 02", crop: "Hortikultura", status: scenario === "irrigation-demand" ? "ready" : "resting", valveOpen: false, demandPercent: scenario === "irrigation-demand" ? 86 : 38 },
      { id: "Zona 03", crop: "Palawija", status: "resting", valveOpen: false, demandPercent: 44 },
    ],
    devices: [
      { code: "PV-01", name: "Inverter PLTS", status: scenario === "reduced-pv" ? "warning" : "normal", lastReading: "baru saja" },
      { code: "TL-01", name: "Sensor level tandon", status: "normal", lastReading: "12 detik lalu" },
      { code: "FM-01", name: "Flow meter utama", status: scenario === "abnormal-flow" ? "warning" : "normal", lastReading: "8 detik lalu" },
      { code: "EC-01", name: "Sensor konduktivitas", status: sensorOffline ? "offline" : "normal", lastReading: sensorOffline ? "18 menit lalu" : "44 detik lalu" },
      { code: "RTU-01", name: "Kontroler lapangan", status: scenario === "pump-fault" ? "warning" : "normal", lastReading: "4 detik lalu" },
    ],
    alerts,
    history,
  };
}

export class SimulationTelemetryService implements TelemetryService {
  async getSnapshot(scenario: ScenarioId): Promise<TelemetrySnapshot> {
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    return createSimulationSnapshot(scenario);
  }
}
