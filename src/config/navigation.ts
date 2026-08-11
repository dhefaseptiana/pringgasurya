import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calculator,
  Droplets,
  Factory,
  Gauge,
  GitBranch,
  Home,
  Leaf,
  MapPinned,
  Network,
  PanelTop,
  Ruler,
  Settings,
  ShieldCheck,
  Sprout,
  Sun,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Project",
    items: [
      { label: "Home", to: "/", icon: Home },
      { label: "System Overview", to: "/system-overview", icon: Network },
    ],
  },
  {
    label: "Operate",
    items: [
      { label: "Live Monitoring", to: "/operate/live", icon: Activity },
      { label: "Water Management", to: "/operate/water", icon: Droplets },
      { label: "Energy Management", to: "/operate/energy", icon: Sun },
      { label: "Smart Irrigation", to: "/operate/irrigation", icon: Sprout },
      { label: "Water Quality", to: "/operate/water-quality", icon: ShieldCheck },
      { label: "Alerts", to: "/operate/alerts", icon: AlertTriangle },
    ],
  },
  {
    label: "Analyze",
    items: [
      { label: "Analytics", to: "/analyze/analytics", icon: BarChart3 },
      { label: "Environmental Impact", to: "/analyze/impact", icon: Leaf },
      { label: "Economic Analysis", to: "/analyze/economics", icon: TrendingUp },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "System Sizing", to: "/plan/sizing", icon: Ruler },
      { label: "Scalability", to: "/plan/scalability", icon: PanelTop },
      { label: "Deployment", to: "/plan/deployment", icon: GitBranch },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Study Area", to: "/research/study-area", icon: MapPinned },
      { label: "Methodology", to: "/research/methodology", icon: Calculator },
      { label: "References", to: "/research/references", icon: BookOpen },
    ],
  },
];

export const settingsItem: NavigationItem = { label: "Settings", to: "/settings", icon: Settings };

export const mobileNavigation: NavigationItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Monitor", to: "/operate/live", icon: Gauge },
  { label: "Water", to: "/operate/water", icon: Droplets },
  { label: "Analytics", to: "/analyze/analytics", icon: BarChart3 },
  { label: "More", to: "/system-overview", icon: Factory },
];
