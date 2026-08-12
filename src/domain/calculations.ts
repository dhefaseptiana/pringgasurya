import type { AgrivoltaicLayout, SimulationInputs } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const round = (value: number, digits = 1) => Number(value.toFixed(digits));

const layoutFactor: Record<AgrivoltaicLayout, { cooling: number; evaporation: number; ler: number; cropLight: number }> = {
  "open-field": { cooling: 0, evaporation: 0, ler: 1, cropLight: 100 },
  reservoir: { cooling: 0.35, evaporation: 1.35, ler: 1.08, cropLight: 100 },
  canal: { cooling: 0.5, evaporation: 1.15, ler: 1.12, cropLight: 97 },
  "partial-shade": { cooling: 1, evaporation: 1, ler: 1.22, cropLight: 100 },
};

export function daylightIrradiance(hour: number, weather: SimulationInputs["weather"], scalePercent: number) {
  const sun = clamp(Math.sin(((hour - 6) / 12) * Math.PI), 0, 1);
  const weatherFactor = weather === "clear" ? 1 : weather === "cloudy" ? 0.58 : weather === "rain" ? 0.2 : 0.72 + 0.18 * Math.sin(hour * 3.1);
  return round(930 * sun * weatherFactor * scalePercent / 100);
}

export function calculateAgrivoltaic(inputs: SimulationInputs) {
  const layout = layoutFactor[inputs.agrivoltaicLayout];
  const effectiveShade = inputs.agrivoltaicLayout === "partial-shade" ? inputs.shadePercent : inputs.agrivoltaicLayout === "open-field" ? 0 : 12;
  const coolingC = round(layout.cooling * effectiveShade * 0.075, 1);
  const evaporationReductionPercent = round(clamp(layout.evaporation * effectiveShade * 0.72, 0, 35));
  const cropLightPercent = round(clamp(layout.cropLight - effectiveShade * (inputs.agrivoltaicLayout === "partial-shade" ? 0.78 : 0.18), 58, 100));
  const landEquivalentRatio = round(layout.ler + effectiveShade * 0.003, 2);
  return { coolingC, evaporationReductionPercent, cropLightPercent, landEquivalentRatio, effectiveShade };
}

export function calculateEconomics(inputs: SimulationInputs, solarFractionPercent: number) {
  const annualWaterM3 = inputs.landAreaHa * 8_500;
  const pumpKwhYear = inputs.landAreaHa * (1_250 + inputs.totalHeadM * 28) * (inputs.irrigationDemandPercent / 72);
  const dieselLitres = pumpKwhYear * 0.31;
  const dieselAnnualCostIdr = dieselLitres * inputs.dieselPriceIdrL + inputs.landAreaHa * 3_200_000;
  const gridAnnualCostIdr = pumpKwhYear * inputs.gridTariffIdrKwh + inputs.landAreaHa * 850_000;
  const batteryCapex = inputs.landAreaHa * 86_000_000 + inputs.pvCapacityKw * 12_500_000;
  const batteryAnnualizedCostIdr = batteryCapex / 9 + pumpKwhYear * 180;
  const hybridCapexIdr = inputs.pvCapacityKw * 13_500_000 + inputs.tankCapacityM3 * 1_850_000 + inputs.landAreaHa * 18_000_000;
  const gridShare = (100 - solarFractionPercent) / 100;
  const hybridAnnualCostIdr = pumpKwhYear * gridShare * inputs.gridTariffIdrKwh + hybridCapexIdr * 0.025;
  const saving = Math.max(1, dieselAnnualCostIdr - hybridAnnualCostIdr);
  return {
    annualWaterM3: round(annualWaterM3),
    pumpKwhYear: round(pumpKwhYear),
    hybridCapexIdr: round(hybridCapexIdr),
    dieselAnnualCostIdr: round(dieselAnnualCostIdr),
    gridAnnualCostIdr: round(gridAnnualCostIdr),
    batteryAnnualizedCostIdr: round(batteryAnnualizedCostIdr),
    hybridAnnualCostIdr: round(hybridAnnualCostIdr),
    waterCostIdrM3: round(hybridAnnualCostIdr / annualWaterM3),
    simplePaybackYears: round(hybridCapexIdr / saving, 1),
  };
}

export function calculateEnvironment(inputs: SimulationInputs, solarFractionPercent: number) {
  const economics = calculateEconomics(inputs, solarFractionPercent);
  const dieselEmissionKgYear = economics.pumpKwhYear * 0.31 * 2.68;
  const gridEmissionKgYear = economics.pumpKwhYear * 0.76;
  const hybridEmissionKgYear = economics.pumpKwhYear * ((100 - solarFractionPercent) / 100) * 0.76 + inputs.pvCapacityKw * 38;
  const agrivoltaic = calculateAgrivoltaic(inputs);
  return {
    dieselEmissionKgYear: round(dieselEmissionKgYear),
    gridEmissionKgYear: round(gridEmissionKgYear),
    hybridEmissionKgYear: round(hybridEmissionKgYear),
    avoidedEmissionKgYear: round(Math.max(0, dieselEmissionKgYear - hybridEmissionKgYear)),
    evaporationReductionPercent: agrivoltaic.evaporationReductionPercent,
    microclimateCoolingC: agrivoltaic.coolingC,
    landEquivalentRatio: agrivoltaic.landEquivalentRatio,
  };
}
