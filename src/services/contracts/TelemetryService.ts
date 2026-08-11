import type { ScenarioId, TelemetrySnapshot } from "../../domain/types";

export interface TelemetryService {
  getSnapshot(scenario: ScenarioId): Promise<TelemetrySnapshot>;
}
