import type { ReactNode } from "react";

export function SectionHeading({ kicker, title, description, action }: { kicker?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>{kicker && <span>{kicker}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
      {action}
    </div>
  );
}
