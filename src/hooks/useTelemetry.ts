import { useQuery } from "@tanstack/react-query";
import { useSystem } from "../contexts/SystemContext";
import { telemetryService } from "../services";

export function useTelemetry() {
  const { scenario } = useSystem();
  return useQuery({
    queryKey: ["telemetry", scenario],
    queryFn: () => telemetryService.getSnapshot(scenario),
    refetchInterval: 4_000,
    staleTime: 2_000,
  });
}
