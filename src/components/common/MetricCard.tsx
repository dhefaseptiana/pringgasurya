import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  unit,
  meta,
  icon: Icon,
  tone = "engineering",
}: {
  label: string;
  value: string | number;
  unit?: string;
  meta: string;
  icon: LucideIcon;
  tone?: "solar" | "water" | "agriculture" | "engineering" | "grid";
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top"><span>{label}</span><Icon size={18} aria-hidden="true" /></div>
      <p className="metric-card__value">{value}{unit && <small>{unit}</small>}</p>
      <p className="metric-card__meta">{meta}</p>
    </article>
  );
}
