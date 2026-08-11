import type { DataSource } from "../../domain/types";

const labels: Record<DataSource, string> = {
  SIMULATION: "Simulation data",
  LIVE: "Live data",
  HISTORICAL: "Historical data",
  RESEARCH: "Research data",
  PROJECTED: "Projected impact",
};

export function DataBadge({ source, compact = false }: { source: DataSource; compact?: boolean }) {
  return (
    <span className={`data-badge data-badge--${source.toLowerCase()}`}>
      <i aria-hidden="true" />
      {compact ? source : labels[source]}
    </span>
  );
}
