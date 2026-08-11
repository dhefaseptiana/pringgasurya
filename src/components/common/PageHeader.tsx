import type { ReactNode } from "react";
import type { DataSource } from "../../domain/types";
import { DataBadge } from "./DataBadge";

export function PageHeader({
  eyebrow,
  title,
  description,
  source = "SIMULATION",
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  source?: DataSource;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <div className="eyebrow-row"><span>{eyebrow}</span><DataBadge source={source} /></div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
