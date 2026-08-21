import {
  Activity,
  BarChart3,
  Home,
  Network,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  shortLabel?: string;
  to: string;
  icon: LucideIcon;
  description?: string;
  primary?: boolean;
}

export const primaryNavigation: NavigationItem[] = [
  { label: "Beranda", to: "/", icon: Home, description: "Gambaran proyek" },
  { label: "Monitoring", shortLabel: "Monitor", to: "/operate/live", icon: Activity, description: "Kondisi sistem" },
  { label: "Kontrol Irigasi", shortLabel: "Kontrol", to: "/operate/irrigation", icon: SlidersHorizontal, description: "Operasikan zona", primary: true },
  { label: "Analisis", to: "/analyze/analytics", icon: BarChart3, description: "Kinerja dan dampak" },
  { label: "Tentang Sistem", shortLabel: "Sistem", to: "/system-overview", icon: Network, description: "Desain dan implementasi" },
];

export const settingsItem: NavigationItem = {
  label: "Pengaturan",
  to: "/settings",
  icon: Settings,
};

export const mobileNavigation = primaryNavigation;
