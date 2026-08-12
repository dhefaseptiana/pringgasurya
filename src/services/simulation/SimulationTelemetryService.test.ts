import { describe, expect, it } from "vitest";
import { defaultSimulationInputs } from "../../contexts/SystemContext";
import { createSimulationSnapshot } from "./SimulationTelemetryService";

const fixedTime = new Date("2026-08-11T12:00:00+08:00");

describe("SimulationTelemetryService", () => {
  it("labels every generated snapshot as simulation", () => {
    const snapshot = createSimulationSnapshot("normal", defaultSimulationInputs, fixedTime);
    expect(snapshot.source).toBe("SIMULATION");
    expect(snapshot.siteId).toBe("pringgarata-pilot");
    expect(snapshot.unitId).toBe("Pilot Unit 01");
    expect(snapshot.history).toHaveLength(13);
  });

  it("keeps the low-tank scenario internally consistent", () => {
    const snapshot = createSimulationSnapshot("low-tank", defaultSimulationInputs, fixedTime);
    expect(snapshot.water.tankLevelPercent).toBe(19);
    expect(snapshot.water.tankVolumeM3).toBeCloseTo(4.2, 1);
    expect(snapshot.systemStatus).toBe("warning");
    expect(snapshot.alerts.some((alert) => alert.id === "tank-low")).toBe(true);
  });

  it("uses PLN assistance when PV production is reduced", () => {
    const snapshot = createSimulationSnapshot("reduced-pv", defaultSimulationInputs, fixedTime);
    expect(snapshot.energy.gridPowerKw).toBeGreaterThan(0);
    expect(snapshot.energy.solarFractionPercent).toBeLessThan(100);
    expect(snapshot.systemMode).toBe("SOLAR_FIRST_GRID_ASSISTED");
  });

  it("propagates field size and hydraulic head into pump load and cost", () => {
    const baseline = createSimulationSnapshot("normal", defaultSimulationInputs, fixedTime);
    const expanded = createSimulationSnapshot("normal", {
      ...defaultSimulationInputs,
      landAreaHa: 5,
      totalHeadM: 45,
      pvCapacityKw: 12,
      tankCapacityM3: 90,
    }, fixedTime);
    expect(expanded.energy.pumpPowerKw).toBeGreaterThan(baseline.energy.pumpPowerKw);
    expect(expanded.economics.hybridCapexIdr).toBeGreaterThan(baseline.economics.hybridCapexIdr);
    expect(expanded.environment.dieselEmissionKgYear).toBeGreaterThan(baseline.environment.dieselEmissionKgYear);
  });

  it("stops grid assistance when PLN is unavailable", () => {
    const baseline = createSimulationSnapshot("normal", defaultSimulationInputs, fixedTime);
    const snapshot = createSimulationSnapshot("reduced-pv", { ...defaultSimulationInputs, gridAvailable: false }, fixedTime);
    expect(snapshot.energy.gridPowerKw).toBe(0);
    expect(snapshot.water.flowLps).toBe(0);
    expect(snapshot.water.tankLevelPercent).toBeLessThan(baseline.water.tankLevelPercent);
    expect(snapshot.alerts.some((alert) => alert.id === "grid-unavailable")).toBe(true);
  });
});
