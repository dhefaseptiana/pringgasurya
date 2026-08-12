import type { ScenarioId, SimulationInputs, TelemetrySnapshot } from "../../domain/types";

export interface TelemetryService {
  getSnapshot(scenario: ScenarioId, inputs: SimulationInputs): Promise<TelemetrySnapshot>;
}
