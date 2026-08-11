import { Bell, ChevronDown, Menu, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { DataBadge } from "../components/common/DataBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { mobileNavigation, navigationGroups, settingsItem } from "../config/navigation";
import { useSystem } from "../contexts/SystemContext";
import type { ScenarioId } from "../domain/types";
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

export function AppShell() {
  const SettingsIcon = settingsItem.icon;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { scenario, setScenario } = useSystem();
  const { data } = useTelemetry();
  const location = useLocation();

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  return (
    <div className="app-shell">
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi"><Menu /></button>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><Sun size={18} /></div>
          <div><b>PRINGGASURYA</b><span>Water · Energy · Food</span></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Tutup navigasi"><X /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return <NavLink key={item.to} end={item.to === "/"} to={item.to} className={({ isActive }) => isActive ? "active" : ""}><Icon /><span>{item.label}</span></NavLink>;
              })}
            </div>
          ))}
        </nav>
        <NavLink to={settingsItem.to} className={({ isActive }) => `settings-link ${isActive ? "active" : ""}`}><SettingsIcon /><span>{settingsItem.label}</span></NavLink>
        <div className="sidebar-footnote"><span>PRINGGARATA PILOT SYSTEM</span><p>Konsep teknologi untuk lomba esai. Bukan fasilitas operasional.</p></div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <div className="topbar__identity">
            <span>Pilot Unit 01</span>
            <p>Kec. Pringgarata · Lombok Tengah · NTB</p>
          </div>
          <div className="topbar__controls">
            <label className="scenario-select"><span>Skenario</span><select value={scenario} onChange={(event) => setScenario(event.target.value as ScenarioId)}>{scenarios.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown /></label>
            <DataBadge source="SIMULATION" compact />
            {data && <StatusBadge status={data.systemStatus} />}
            <button className="notification-button" aria-label={`${data?.alerts.length ?? 0} peringatan`}><Bell />{Boolean(data?.alerts.length) && <span>{data?.alerts.length}</span>}</button>
          </div>
        </header>
        <div className="simulation-banner"><b>SIMULATION MODE</b><span>Seluruh telemetry dan kontrol pada prototipe ini adalah data simulasi, bukan pembacaan perangkat lapangan.</span></div>
        <main className="page-content"><Outlet /></main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Navigasi seluler">
        {mobileNavigation.map((item) => { const Icon = item.icon; return <NavLink key={item.to} end={item.to === "/"} to={item.to} className={({ isActive }) => isActive ? "active" : ""}><Icon /><span>{item.label}</span></NavLink>; })}
      </nav>
    </div>
  );
}
