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
export type HealthStatus = "normal" | "warning" | "critical" | "offline";
export type WeatherPreset = "clear" | "cloudy" | "rain" | "variable";
export type AgrivoltaicLayout = "open-field" | "reservoir" | "canal" | "partial-shade";

export interface SimulationInputs {
  clockHour: number;
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
  pvKw: number;
  pumpKw: number;
  gridKw: number;
  tankPercent: number;
  flowLps: number;
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
