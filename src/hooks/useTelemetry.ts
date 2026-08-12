import { useQuery } from "@tanstack/react-query";
import { useSystem } from "../contexts/SystemContext";
import { telemetryService } from "../services";

export function useTelemetry() {
  const { scenario, inputs } = useSystem();
  return useQuery({
    queryKey: ["telemetry", scenario, inputs],
    queryFn: () => telemetryService.getSnapshot(scenario, inputs),
    staleTime: 10_000,
  });
}
