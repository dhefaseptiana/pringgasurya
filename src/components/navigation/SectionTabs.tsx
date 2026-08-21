import { NavLink } from "react-router-dom";

export interface SectionTab {
  label: string;
  to: string;
}

export function SectionTabs({ label, items }: { label: string; items: SectionTab[] }) {
  return (
    <nav className="section-tabs" aria-label={label}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end className={({ isActive }) => isActive ? "active" : ""}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export const monitoringTabs: SectionTab[] = [
  { label: "Ringkasan", to: "/operate/live" },
  { label: "Air & Tandon", to: "/operate/water" },
  { label: "Energi", to: "/operate/energy" },
  { label: "Kualitas Air", to: "/operate/water-quality" },
];

export const analysisTabs: SectionTab[] = [
  { label: "Operasi", to: "/analyze/analytics" },
  { label: "Dampak", to: "/analyze/impact" },
  { label: "Ekonomi", to: "/analyze/economics" },
];

export const systemTabs: SectionTab[] = [
  { label: "Arsitektur", to: "/system-overview" },
  { label: "Skala", to: "/plan/scalability" },
  { label: "Implementasi", to: "/plan/deployment" },
  { label: "Studi", to: "/research/study-area" },
  { label: "Referensi", to: "/research/references" },
];
