import { describe, expect, it } from "vitest";
import { createSimulationSnapshot } from "./SimulationTelemetryService";

const fixedTime = new Date("2026-08-11T12:00:00+08:00");

describe("SimulationTelemetryService", () => {
  it("labels every generated snapshot as simulation", () => {
    const snapshot = createSimulationSnapshot("normal", fixedTime);
    expect(snapshot.source).toBe("SIMULATION");
    expect(snapshot.siteId).toBe("pringgarata-pilot");
    expect(snapshot.unitId).toBe("Pilot Unit 01");
    expect(snapshot.history).toHaveLength(12);
  });

  it("keeps the low-tank scenario internally consistent", () => {
    const snapshot = createSimulationSnapshot("low-tank", fixedTime);
    expect(snapshot.water.tankLevelPercent).toBe(19);
    expect(snapshot.water.tankVolumeM3).toBeCloseTo(4.2, 1);
    expect(snapshot.systemStatus).toBe("warning");
    expect(snapshot.alerts.some((alert) => alert.id === "tank-low")).toBe(true);
  });

  it("uses PLN assistance when PV production is reduced", () => {
    const snapshot = createSimulationSnapshot("reduced-pv", fixedTime);
    expect(snapshot.energy.gridPowerKw).toBeGreaterThan(0);
    expect(snapshot.energy.solarFractionPercent).toBeLessThan(100);
    expect(snapshot.systemMode).toBe("SOLAR_FIRST_GRID_ASSISTED");
  });
});
