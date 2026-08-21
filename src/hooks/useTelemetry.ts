import { useMemo } from "react";
import { useSystem } from "../contexts/SystemContext";
import { createSimulationSnapshot } from "../services/simulation/SimulationTelemetryService";

export function useTelemetry() {
  const { scenario, inputs } = useSystem();
  const result = useMemo(() => ({
    data: createSimulationSnapshot(scenario, inputs),
    dataUpdatedAt: Date.now(),
  }), [scenario, inputs]);
  return { ...result, isLoading: false, isFetching: false };
}
