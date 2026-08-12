import { describe, expect, it } from "vitest";
import { defaultSimulationInputs } from "../contexts/SystemContext";
import { calculateAgrivoltaic, daylightIrradiance } from "./calculations";

describe("interactive model calculations", () => {
  it("produces no solar irradiance at night", () => {
    expect(daylightIrradiance(2, "clear", 100)).toBe(0);
  });

  it("shows the crop-light trade-off when partial shade rises", () => {
    const low = calculateAgrivoltaic({ ...defaultSimulationInputs, agrivoltaicLayout: "partial-shade", shadePercent: 10 });
    const high = calculateAgrivoltaic({ ...defaultSimulationInputs, agrivoltaicLayout: "partial-shade", shadePercent: 35 });
    expect(high.evaporationReductionPercent).toBeGreaterThan(low.evaporationReductionPercent);
    expect(high.cropLightPercent).toBeLessThan(low.cropLightPercent);
  });
});
