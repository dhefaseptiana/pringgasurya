import { Activity, Droplets, Gauge, RadioTower, Sun } from "lucide-react";
import { OperationsChart } from "../components/charts/OperationsChart";
import { MetricCard } from "../components/common/MetricCard";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { StatusBadge } from "../components/common/StatusBadge";
import { ScenarioControlCenter } from "../components/interactive/ScenarioControlCenter";
import { SystemFlow } from "../components/SystemFlow";
import { useTelemetry } from "../hooks/useTelemetry";

export function LiveMonitoringPage() {
  const { data, isLoading, dataUpdatedAt } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menghasilkan telemetry simulasi…</div>;
  return (
    <>
      <PageHeader eyebrow="OPERATE · LIVE MONITORING" title="Kondisi operasi dalam satu pandangan" description="Halaman ini memperagakan ritme pembaruan telemetry. Semua nilai dihasilkan oleh scenario engine, bukan sensor lapangan." actions={<div className="sync-label"><RadioTower />Diperbarui {new Date(dataUpdatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>} />
      <ScenarioControlCenter data={data} />
      {data.alerts.length > 0 && <section className={`alert-strip alert-strip--${data.alerts[0].level}`}><Activity /><div><b>{data.alerts[0].title}</b><p>{data.alerts[0].detail}</p></div><StatusBadge status={data.systemStatus} /></section>}
      <section className="metric-grid"><MetricCard icon={Sun} label="Daya PLTS" value={data.energy.pvPowerKw} unit="kW" meta={`${data.energy.solarFractionPercent}% pasokan aktif`} tone="solar" /><MetricCard icon={Gauge} label="Daya pompa" value={data.energy.pumpPowerKw} unit="kW" meta={data.energy.pumpPowerKw > 0 ? "Pompa berjalan" : "Pompa berhenti"} /><MetricCard icon={Droplets} label="Tandon" value={data.water.tankLevelPercent} unit="%" meta={`${data.water.tankVolumeM3} m³ tersedia`} tone="water" /><MetricCard icon={Activity} label="Debit" value={data.water.flowLps} unit="L/s" meta={`${data.water.pressureBar} bar pada discharge`} tone="agriculture" /></section>
      <section className="panel-block"><SectionHeading kicker="INTEGRATED FLOW" title="Status jalur fisik" /><SystemFlow data={data} /></section>
      <section className="two-column-layout two-column-layout--wide"><article className="panel-block"><SectionHeading kicker="12-HOUR WINDOW" title="Profil energi simulasi" description="Kurva bergerak mengikuti skenario yang dipilih pada topbar." /><OperationsChart data={data.history} /></article><article className="panel-block"><SectionHeading kicker="DEVICE HEALTH" title="Ketersediaan perangkat" /><div className="device-list">{data.devices.map((device) => <div key={device.code}><code>{device.code}</code><span><b>{device.name}</b><small>{device.lastReading}</small></span><StatusBadge status={device.status} /></div>)}</div></article></section>
    </>
  );
}
