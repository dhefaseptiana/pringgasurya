import { daylightIrradiance, round } from "../../domain/calculations";
import type { HealthStatus, ScenarioId, SimulationDatasetRow, SimulationInputs } from "../../domain/types";

const STEP_MINUTES = 15;
const STEP_HOURS = STEP_MINUTES / 60;
const STEP_SECONDS = STEP_MINUTES * 60;

interface ModelState {
  tankVolumeM3: number;
  moisture: [number, number, number];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seededNoise(seed: number, step: number, channel: number) {
  const value = Math.sin(seed * 12.9898 + step * 78.233 + channel * 37.719) * 43_758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function timestampAt(inputs: SimulationInputs, step: number) {
  const origin = new Date(inputs.startDate);
  return new Date(origin.getTime() + step * STEP_MINUTES * 60_000);
}

function hourAt(inputs: SimulationInputs, step: number) {
  const date = timestampAt(inputs, step);
  return date.getUTCHours() + date.getUTCMinutes() / 60;
}

function scenarioWeather(inputs: SimulationInputs, scenario: ScenarioId) {
  if (scenario === "reduced-pv") return "cloudy" as const;
  return inputs.weather;
}

function getRainMm(inputs: SimulationInputs, scenario: ScenarioId, step: number, hour: number) {
  const weather = scenarioWeather(inputs, scenario);
  if (weather !== "rain" && weather !== "variable") return 0;
  const rainWindow = hour >= 14 && hour <= 17;
  if (!rainWindow) return 0;
  const base = weather === "rain" ? 1.6 : Math.max(0, seededNoise(inputs.randomSeed, step, 12) * 1.1);
  return round(base, 2);
}

function demandFromMoisture(moisture: number, cropIndex: number, inputDemand: number) {
  const target = cropIndex === 0 ? 78 : cropIndex === 1 ? 64 : 58;
  const deficit = clamp((target - moisture) / target * 100, 0, 100);
  return round(clamp(deficit * 0.68 + inputDemand * 0.32, 0, 100), 1);
}

function createInitialState(inputs: SimulationInputs, scenario: ScenarioId): ModelState {
  const initialTankPercent = scenario === "low-tank" ? 19 : inputs.tankStartPercent;
  return {
    tankVolumeM3: inputs.tankCapacityM3 * initialTankPercent / 100,
    moisture: [72, 57, 51],
  };
}

function simulateStep(state: ModelState, inputs: SimulationInputs, scenario: ScenarioId, step: number): SimulationDatasetRow {
  const timestamp = timestampAt(inputs, step);
  const hour = hourAt(inputs, step);
  const weather = scenarioWeather(inputs, scenario);
  const variability = 1 + seededNoise(inputs.randomSeed, step, 1) * (weather === "variable" ? 0.22 : 0.045);
  const pvScenarioFactor = scenario === "reduced-pv" ? 0.42 : 1;
  const irradianceWm2 = round(clamp(
    daylightIrradiance(hour, weather, inputs.irradianceScalePercent) * variability * pvScenarioFactor,
    0,
    1_150,
  ));
  const rainMm = getRainMm(inputs, scenario, step, hour);
  const humidityPercent = round(clamp(84 - irradianceWm2 * 0.035 + rainMm * 4 + seededNoise(inputs.randomSeed, step, 2) * 3, 42, 96), 1);
  const ambientTemperatureC = round(clamp(24 + irradianceWm2 * 0.009 - rainMm * 0.4 + seededNoise(inputs.randomSeed, step, 3) * 0.5, 22, 35), 1);
  const evapotranspirationMm = round(clamp((0.055 + irradianceWm2 / 9_500) * (1 - humidityPercent / 175), 0.015, 0.17), 3);

  const pvPowerKw = round(inputs.pvCapacityKw * irradianceWm2 / 1_000 * 0.82, 3);
  const demandSetting = scenario === "irrigation-demand" ? Math.max(92, inputs.irrigationDemandPercent) : inputs.irrigationDemandPercent;
  const zoneDemands = state.moisture.map((value, index) => demandFromMoisture(value, index, demandSetting)) as [number, number, number];
  const activeIndexes = ["Zona 01", "Zona 02", "Zona 03"]
    .map((id, index) => inputs.activeZoneIds.includes(id) ? index : -1)
    .filter((index) => index >= 0);
  const activeZones = activeIndexes.map((index) => `Zona 0${index + 1}`);
  const tankPercentBefore = state.tankVolumeM3 / inputs.tankCapacityM3 * 100;
  const urgentIrrigation = activeIndexes.length > 0;
  const shouldFillTank = tankPercentBefore < 82 && irradianceWm2 > 110;
  const shouldRunPump = scenario !== "pump-fault" && (urgentIrrigation || shouldFillTank);
  const pumpRatedKw = clamp(inputs.landAreaHa * 0.72 + inputs.totalHeadM * 0.032, 0.75, 8.5);
  let pumpPowerKw = shouldRunPump ? pumpRatedKw : 0;
  let gridPowerKw = 0;
  if (pumpPowerKw > 0 && pvPowerKw < pumpPowerKw) {
    gridPowerKw = inputs.gridAvailable && (urgentIrrigation || scenario === "grid-assist")
      ? pumpPowerKw - pvPowerKw
      : 0;
    if (pvPowerKw + gridPowerKw < Math.min(0.55, pumpRatedKw * 0.55)) pumpPowerKw = 0;
    else pumpPowerKw = Math.min(pumpPowerKw, pvPowerKw + gridPowerKw);
  }
  if (scenario === "pump-fault") {
    pumpPowerKw = 0;
    gridPowerKw = 0;
  }

  const hydraulicEfficiency = 0.58;
  const sourceFlowLps = pumpPowerKw > 0
    ? clamp(pumpPowerKw * hydraulicEfficiency * 1_000 / (9.81 * Math.max(8, inputs.totalHeadM)), 0, 8.5)
    : 0;
  const measuredFlowLps = scenario === "abnormal-flow" ? sourceFlowLps * 0.18 : sourceFlowLps;
  const pressureBar = pumpPowerKw > 0 ? inputs.totalHeadM / 10.2 * (scenario === "abnormal-flow" ? 1.18 : 1) : 0;

  const availableTankLps = state.tankVolumeM3 * 1_000 / STEP_SECONDS;
  const requestedDistributionLps = activeIndexes.reduce((total, index) => total + 0.42 + zoneDemands[index] * 0.008, 0);
  const distributionLps = Math.min(requestedDistributionLps, availableTankLps + sourceFlowLps);
  const inflowM3 = sourceFlowLps * STEP_SECONDS / 1_000;
  const outflowM3 = distributionLps * STEP_SECONDS / 1_000;
  const abnormalLossM3 = scenario === "abnormal-flow" && pumpPowerKw > 0 ? inflowM3 * 0.12 : 0;
  state.tankVolumeM3 = clamp(state.tankVolumeM3 + inflowM3 - outflowM3 - abnormalLossM3, 0, inputs.tankCapacityM3 * 0.98);
  if (scenario === "low-tank") state.tankVolumeM3 = inputs.tankCapacityM3 * 0.19;

  const zoneAreaM2 = Math.max(1, inputs.landAreaHa * 10_000 / 3);
  const volumePerActiveZoneM3 = activeIndexes.length ? outflowM3 / activeIndexes.length : 0;
  state.moisture = state.moisture.map((moisture, index) => {
    const cropFactor = index === 0 ? 1.12 : index === 1 ? 0.92 : 0.78;
    const rainGain = rainMm * (index === 0 ? 0.7 : 0.46);
    const irrigationDepthMm = activeIndexes.includes(index) ? volumePerActiveZoneM3 / zoneAreaM2 * 1_000 : 0;
    const irrigationGain = irrigationDepthMm * (index === 0 ? 0.44 : 0.82);
    const etLoss = evapotranspirationMm * cropFactor * 1.7;
    return clamp(moisture + rainGain + irrigationGain - etLoss, index === 0 ? 45 : 24, 92);
  }) as [number, number, number];

  const tankLevelPercent = round(state.tankVolumeM3 / inputs.tankCapacityM3 * 100, 1);
  const turbidityNtu = round(clamp(13 + rainMm * 12 + seededNoise(inputs.randomSeed, step, 8) * 1.8, 7, 72), 1);
  const ph = round(6.85 + seededNoise(inputs.randomSeed, step, 9) * 0.08, 2);
  const ecMsCm = round(0.71 + seededNoise(inputs.randomSeed, step, 10) * 0.035, 2);
  let systemStatus: HealthStatus = "normal";
  if (scenario === "pump-fault" || tankLevelPercent < 8) systemStatus = "critical";
  else if (["low-tank", "reduced-pv", "sensor-offline", "abnormal-flow", "irrigation-demand"].includes(scenario) || tankLevelPercent < 25 || turbidityNtu >= 50 || (pumpPowerKw > 0 && measuredFlowLps < sourceFlowLps * 0.5)) systemStatus = "warning";
  const solarFractionPercent = pumpPowerKw > 0 ? clamp(Math.min(pvPowerKw, pumpPowerKw) / pumpPowerKw * 100, 0, 100) : 100;

  return {
    step,
    timestamp: timestamp.toISOString(),
    scenario,
    weather,
    irradianceWm2,
    ambientTemperatureC,
    humidityPercent,
    rainMm,
    evapotranspirationMm,
    pvPowerKw: round(pvPowerKw, 2),
    pumpPowerKw: round(pumpPowerKw, 2),
    gridPowerKw: round(gridPowerKw, 2),
    solarFractionPercent: round(solarFractionPercent, 1),
    tankLevelPercent,
    tankVolumeM3: round(state.tankVolumeM3, 2),
    flowLps: round(measuredFlowLps, 2),
    pressureBar: round(pressureBar, 2),
    ph,
    ecMsCm,
    turbidityNtu,
    zone01Moisture: round(state.moisture[0], 1),
    zone02Moisture: round(state.moisture[1], 1),
    zone03Moisture: round(state.moisture[2], 1),
    zone01Demand: zoneDemands[0],
    zone02Demand: zoneDemands[1],
    zone03Demand: zoneDemands[2],
    activeZones: activeZones.join("|"),
    systemStatus,
  };
}

export function generateSyntheticDataset(
  inputs: SimulationInputs,
  scenario: ScenarioId,
  steps = Math.max(1, inputs.simulationStep + 1),
) {
  const state = createInitialState(inputs, scenario);
  const rows: SimulationDatasetRow[] = [];
  for (let step = 0; step < steps; step += 1) rows.push(simulateStep(state, inputs, scenario, step));
  return rows;
}

export function simulationRowsToCsv(rows: SimulationDatasetRow[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]) as Array<keyof SimulationDatasetRow>;
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    return /[\",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [keys.join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\n");
}

export const simulationModelInfo = {
  name: "PRINGGASURYA Physical Rules v1" as const,
  timeStepMinutes: STEP_MINUTES as 15,
  assumptions: [
    "Neraca air tandon dihitung setiap 15 menit.",
    "Daya pompa mengikuti head total dan efisiensi hidraulik 58%.",
    "PLTS menjadi sumber pertama; PLN hanya menutup kekurangan yang mendesak.",
    "Kelembapan zona berubah karena hujan, irigasi, dan evapotranspirasi.",
  ],
};
