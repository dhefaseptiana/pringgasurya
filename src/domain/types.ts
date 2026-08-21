export type DataSource = "SIMULATION" | "LIVE" | "HISTORICAL" | "RESEARCH" | "PROJECTED";

export type ScenarioId =
  | "normal"
  | "low-tank"
  | "reduced-pv"
  | "grid-assist"
  | "sensor-offline"
  | "abnormal-flow"
  | "irrigation-demand"
  | "pump-fault";

export type CropProfile = "Padi" | "Hortikultura" | "Palawija";
export type ControlMode = "automatic" | "manual" | "off";
export type HealthStatus = "normal" | "warning" | "critical" | "offline";
export type WeatherPreset = "clear" | "cloudy" | "rain" | "variable";
export type AgrivoltaicLayout = "open-field" | "reservoir" | "canal" | "partial-shade";

export interface SimulationInputs {
  clockHour: number;
  simulationStep: number;
  startDate: string;
  randomSeed: number;
  weather: WeatherPreset;
  irradianceScalePercent: number;
  gridAvailable: boolean;
  tankStartPercent: number;
  landAreaHa: number;
  totalHeadM: number;
  irrigationDemandPercent: number;
  pvCapacityKw: number;
  tankCapacityM3: number;
  shadePercent: number;
  agrivoltaicLayout: AgrivoltaicLayout;
  dieselPriceIdrL: number;
  gridTariffIdrKwh: number;
  activeZoneIds: string[];
}

export interface ScenarioRecord {
  id: string;
  name: string;
  createdAt: string;
  inputs: SimulationInputs;
  outputs: {
    solarFractionPercent: number;
    tankLevelPercent: number;
    annualCostIdr: number;
    annualEmissionsKg: number;
  };
}

export interface HistoryPoint {
  time: string;
  timestamp?: string;
  pvKw: number;
  pumpKw: number;
  gridKw: number;
  tankPercent: number;
  flowLps: number;
  soilMoisturePercent?: number;
  irrigationDemandPercent?: number;
}

export interface SimulationDatasetRow {
  step: number;
  timestamp: string;
  scenario: ScenarioId;
  weather: WeatherPreset;
  irradianceWm2: number;
  ambientTemperatureC: number;
  humidityPercent: number;
  rainMm: number;
  evapotranspirationMm: number;
  pvPowerKw: number;
  pumpPowerKw: number;
  gridPowerKw: number;
  solarFractionPercent: number;
  tankLevelPercent: number;
  tankVolumeM3: number;
  flowLps: number;
  pressureBar: number;
  ph: number;
  ecMsCm: number;
  turbidityNtu: number;
  zone01Moisture: number;
  zone02Moisture: number;
  zone03Moisture: number;
  zone01Demand: number;
  zone02Demand: number;
  zone03Demand: number;
  activeZones: string;
  systemStatus: HealthStatus;
}

export interface IrrigationCommand {
  id: string;
  timestamp: string;
  action: "start" | "stop" | "stop-all" | "mode";
  zoneId?: string;
  description: string;
}

export interface TelemetrySnapshot {
  schemaVersion: "1.0";
  source: "SIMULATION";
  siteId: "pringgarata-pilot";
  unitId: "Pilot Unit 01";
  timestamp: string;
  receivedAt: string;
  quality: "VALID" | "DEGRADED";
  scenario: ScenarioId;
  systemMode: "SOLAR_FIRST_GRID_ASSISTED";
  systemStatus: HealthStatus;
  energy: {
    pvPowerKw: number;
    pumpPowerKw: number;
    gridPowerKw: number;
    solarFractionPercent: number;
    solarEnergyTodayKwh: number;
    gridEnergyTodayKwh: number;
  };
  water: {
    tankLevelPercent: number;
    tankVolumeM3: number;
    flowLps: number;
    pressureBar: number;
    fieldWaterLevelCm: number;
    soilMoisturePercent: number;
  };
  waterQuality: {
    ph: number;
    ecMsCm: number;
    turbidityNtu: number;
    temperatureC: number;
  };
  weather: {
    irradianceWm2: number;
    ambientTemperatureC: number;
    underPanelTemperatureC: number;
    rainTodayMm: number;
    humidityPercent: number;
    evapotranspirationMm: number;
  };
  economics: {
    hybridCapexIdr: number;
    dieselAnnualCostIdr: number;
    gridAnnualCostIdr: number;
    batteryAnnualizedCostIdr: number;
    hybridAnnualCostIdr: number;
    waterCostIdrM3: number;
    simplePaybackYears: number;
  };
  environment: {
    dieselEmissionKgYear: number;
    gridEmissionKgYear: number;
    hybridEmissionKgYear: number;
    avoidedEmissionKgYear: number;
    evaporationReductionPercent: number;
    microclimateCoolingC: number;
    landEquivalentRatio: number;
  };
  zones: Array<{
    id: string;
    crop: CropProfile;
    status: "irrigating" | "ready" | "resting";
    valveOpen: boolean;
    demandPercent: number;
    soilMoisturePercent: number;
    fieldWaterLevelCm: number;
  }>;
  devices: Array<{
    code: string;
    name: string;
    status: HealthStatus;
    lastReading: string;
  }>;
  alerts: Array<{
    id: string;
    level: "warning" | "critical";
    title: string;
    detail: string;
  }>;
  history: HistoryPoint[];
  model: {
    name: "PRINGGASURYA Physical Rules v1";
    timeStepMinutes: 15;
    randomSeed: number;
    simulationStep: number;
    assumptions: string[];
  };
}

export interface SensorDefinition {
  code: string;
  measurement: string;
  recommendedType: string;
  signal: string;
  placement: string;
  role: string;
  priority: "Esensial" | "Disarankan" | "Opsional" | "Aktuator";
}
