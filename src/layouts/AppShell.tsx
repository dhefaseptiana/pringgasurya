import {
  Bell,
  ChevronDown,
  FlaskConical,
  Menu,
  RadioTower,
  RotateCcw,
  ShieldCheck,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { DataBadge } from "../components/common/DataBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { mobileNavigation, primaryNavigation, settingsItem } from "../config/navigation";
import { useSystem } from "../contexts/SystemContext";
import type { ControlMode, ScenarioId } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";

const scenarios: Array<{ value: ScenarioId; label: string }> = [
  { value: "normal", label: "Operasi normal" },
  { value: "low-tank", label: "Tandon rendah" },
  { value: "reduced-pv", label: "Surya berkurang" },
  { value: "grid-assist", label: "Bantuan PLN" },
  { value: "sensor-offline", label: "Sensor offline" },
  { value: "abnormal-flow", label: "Debit abnormal" },
  { value: "irrigation-demand", label: "Permintaan irigasi" },
  { value: "pump-fault", label: "Gangguan pompa" },
];

const modeLabels: Record<ControlMode, string> = {
  automatic: "Otomatis",
  manual: "Manual",
  off: "Nonaktif",
};

function isPrimaryActive(pathname: string, target: string) {
  if (target === "/") return pathname === "/";
  if (target === "/operate/live") return pathname.startsWith("/operate/") && pathname !== "/operate/irrigation";
  if (target === "/operate/irrigation") return pathname === "/operate/irrigation";
  if (target === "/analyze/analytics") return pathname.startsWith("/analyze/");
  if (target === "/system-overview") return pathname === "/system-overview" || pathname.startsWith("/plan/") || pathname.startsWith("/research/");
  return pathname === target;
}

export function AppShell() {
  const SettingsIcon = settingsItem.icon;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"alerts" | "simulation" | null>(null);
  const { scenario, setScenario, controlMode, resetSimulation } = useSystem();
  const { data } = useTelemetry();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
    setActivePanel(null);
  }, [location.pathname]);

  const connectedDevices = data?.devices.filter((device) => device.status !== "offline").length ?? 0;
  const totalDevices = data?.devices.length ?? 0;
  const waterSafe = Boolean(
    data
      && data.quality === "VALID"
      && data.waterQuality.ph >= 5.5
      && data.waterQuality.ph <= 8.5
      && data.waterQuality.turbidityNtu < 50,
  );
  const energyLabel = !data
    ? "Memuat"
    : data.energy.gridPowerKw > 0.05
      ? "Surya + PLN"
      : data.energy.pvPowerKw > 0
        ? "Surya aktif"
        : "Menunggu energi";

  return (
    <div className="app-shell app-shell--simplified">
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi"><Menu /></button>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><Sun size={18} /></div>
          <div><b>PRINGGASURYA</b><span>Water · Energy · Food</span></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Tutup navigasi"><X /></button>
        </div>

        <nav className="primary-navigation" aria-label="Navigasi utama">
          <p>Menu utama</p>
          {primaryNavigation.map((item, index) => {
            const Icon = item.icon;
            const active = isPrimaryActive(location.pathname, item.to);
            return (
              <NavLink key={item.to} end={item.to === "/"} to={item.to} className={`${active ? "active" : ""} ${item.primary ? "primary-control-link" : ""}`} aria-current={active ? "page" : undefined}>
                <span className="navigation-index">0{index + 1}</span>
                <Icon />
                <span className="navigation-copy"><b>{item.label}</b><small>{item.description}</small></span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-utilities">
          <button type="button" onClick={() => setActivePanel("simulation")}><FlaskConical /><span>Simulation Lab</span></button>
          <NavLink to={settingsItem.to} className={({ isActive }) => isActive ? "active" : ""}><SettingsIcon /><span>{settingsItem.label}</span></NavLink>
        </div>
        <div className="sidebar-footnote"><span>PRINGGARATA PILOT SYSTEM</span><p>Prototipe teknologi untuk pengujian gagasan. Bukan fasilitas operasional.</p></div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <div className="topbar__identity">
            <span>Pilot Unit 01</span>
            <p>Kec. Pringgarata · Lombok Tengah · NTB</p>
          </div>
          <div className="topbar__controls">
            <span className="device-connection"><RadioTower /><b>{connectedDevices}/{totalDevices}</b><small>perangkat</small></span>
            {data && <StatusBadge status={data.systemStatus} />}
            <button className="notification-button" aria-label={`${data?.alerts.length ?? 0} peringatan`} aria-expanded={activePanel === "alerts"} onClick={() => setActivePanel(activePanel === "alerts" ? null : "alerts")}>
              <Bell />{Boolean(data?.alerts.length) && <span>{data?.alerts.length}</span>}
            </button>
          </div>
        </header>

        <div className="system-rail" aria-label="Status sistem ringkas">
          <div className="system-rail__simulation"><DataBadge source="SIMULATION" compact /><b>SIMULATION MODE</b></div>
          <div><span>Mode kontrol</span><b>{modeLabels[controlMode]}</b></div>
          <div><Zap /><span>Sumber energi</span><b>{energyLabel}</b></div>
          <div><ShieldCheck /><span>Kualitas air</span><b className={waterSafe ? "is-safe" : "is-warning"}>{waterSafe ? "Aman" : "Periksa"}</b></div>
        </div>

        <main className="page-content"><Outlet /></main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Navigasi seluler">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isPrimaryActive(location.pathname, item.to);
          return (
            <NavLink key={item.to} end={item.to === "/"} to={item.to} className={`${active ? "active" : ""} ${item.primary ? "mobile-primary-action" : ""}`} aria-current={active ? "page" : undefined}>
              <Icon /><span>{item.shortLabel ?? item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {activePanel && (
        <div className="utility-layer">
          <button className="utility-backdrop" aria-label="Tutup panel" onClick={() => setActivePanel(null)} />
          <aside className="utility-drawer" aria-label={activePanel === "alerts" ? "Panel peringatan" : "Simulation Lab"}>
            <header><div>{activePanel === "alerts" ? <Bell /> : <FlaskConical />}<span><small>{activePanel === "alerts" ? "SYSTEM" : "PROTOTYPE"}</small><b>{activePanel === "alerts" ? "Peringatan" : "Simulation Lab"}</b></span></div><button onClick={() => setActivePanel(null)} aria-label="Tutup panel"><X /></button></header>
            {activePanel === "alerts" ? (
              <div className="drawer-content">
                {data?.alerts.length ? data.alerts.map((alert) => <article className={`drawer-alert drawer-alert--${alert.level}`} key={alert.id}><span>{alert.level}</span><b>{alert.title}</b><p>{alert.detail}</p></article>) : <div className="drawer-empty"><ShieldCheck /><b>Tidak ada peringatan aktif</b><p>Seluruh pemeriksaan simulasi berada dalam kondisi normal.</p></div>}
                <NavLink className="button button--secondary" to="/operate/alerts">Buka pusat peringatan</NavLink>
              </div>
            ) : (
              <div className="drawer-content simulation-lab">
                <DataBadge source="SIMULATION" />
                <h2>Uji kondisi tanpa memenuhi antarmuka utama.</h2>
                <p>Gunakan skenario ini untuk memperagakan respons sistem. Perubahan hanya memengaruhi data simulasi pada browser.</p>
                <label><span>Skenario aktif</span><div><select value={scenario} onChange={(event) => setScenario(event.target.value as ScenarioId)}>{scenarios.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown /></div></label>
                <NavLink className="button button--primary" to="/simulation"><FlaskConical />Buka lab lengkap</NavLink>
                <button className="button button--secondary" onClick={resetSimulation}><RotateCcw />Reset simulasi</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
