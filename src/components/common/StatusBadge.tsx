import type { HealthStatus } from "../../domain/types";

const statusLabels: Record<HealthStatus, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

export function StatusBadge({ status }: { status: HealthStatus }) {
  return <span className={`status-badge status-badge--${status}`}><i />{statusLabels[status]}</span>;
}
