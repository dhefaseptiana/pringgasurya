import { describe, expect, it } from "vitest";
import { defaultSimulationInputs } from "../../contexts/SystemContext";
import { generateSyntheticDataset, simulationRowsToCsv } from "./SyntheticSimulationModel";

describe("SyntheticSimulationModel", () => {
  it("is reproducible when inputs and random seed are unchanged", () => {
    const first = generateSyntheticDataset(defaultSimulationInputs, "normal", 96);
    const second = generateSyntheticDataset(defaultSimulationInputs, "normal", 96);
    expect(second).toEqual(first);
  });

  it("preserves physical boundaries", () => {
    const rows = generateSyntheticDataset({ ...defaultSimulationInputs, weather: "variable", simulationStep: 383 }, "normal", 384);
    for (const row of rows) {
      expect(row.tankLevelPercent).toBeGreaterThanOrEqual(0);
      expect(row.tankLevelPercent).toBeLessThanOrEqual(98);
      expect(row.pvPowerKw).toBeGreaterThanOrEqual(0);
      expect(row.gridPowerKw).toBeGreaterThanOrEqual(0);
      expect(row.zone02Moisture).toBeGreaterThanOrEqual(24);
      expect(row.zone02Moisture).toBeLessThanOrEqual(92);
    }
  });

  it("lets irrigation increase the selected zone moisture", () => {
    const dry = generateSyntheticDataset({ ...defaultSimulationInputs, activeZoneIds: [] }, "normal", 48).at(-1)!;
    const irrigated = generateSyntheticDataset({ ...defaultSimulationInputs, activeZoneIds: ["Zona 02"] }, "normal", 48).at(-1)!;
    expect(irrigated.zone02Moisture).toBeGreaterThan(dry.zone02Moisture);
  });

  it("exports a complete CSV row per simulation step", () => {
    const rows = generateSyntheticDataset(defaultSimulationInputs, "normal", 12);
    const csv = simulationRowsToCsv(rows);
    expect(csv.split("\n")).toHaveLength(13);
    expect(csv).toContain("irradianceWm2");
    expect(csv).toContain("zone03Demand");
  });
});
