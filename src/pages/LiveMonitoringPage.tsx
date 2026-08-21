import { Activity, ArrowRight, CloudSun, Droplets, Gauge, Pause, Play, RadioTower, ShieldCheck, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { OperationsChart } from "../components/charts/OperationsChart";
import { DataBadge } from "../components/common/DataBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { monitoringTabs, SectionTabs } from "../components/navigation/SectionTabs";
import { SystemFlow } from "../components/SystemFlow";
import { useSystem } from "../contexts/SystemContext";
import { useTelemetry } from "../hooks/useTelemetry";

function displayTime(timestamp: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(timestamp));
}

export function LiveMonitoringPage() {
  const { data, isLoading, dataUpdatedAt } = useTelemetry();
  const { scenario, isPlaying, setIsPlaying } = useSystem();
  if (isLoading || !data) return <div className="page-loading">Menghasilkan telemetri simulasi…</div>;

  const primaryMessage = data.alerts[0]?.detail ?? "Energi, air, dan perangkat berada dalam batas operasi model.";
  return (
    <div className="project-page monitoring-page">
      <SectionTabs label="Navigasi monitoring" items={monitoringTabs} />
      <header className="operation-page-header">
        <div><span>MONITORING · PILOT UNIT 01</span><h1>Kondisi sistem, tanpa kebisingan.</h1><p>Empat sinyal utama menjawab apa yang terjadi sekarang dan tindakan apa yang diperlukan.</p></div>
        <div className="operation-sync"><RadioTower /><span><small>Diterima browser</small><b>{new Date(dataUpdatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</b></span></div>
      </header>

      <section className="monitoring-disclosure"><DataBadge source="SIMULATION" /><p>Data sintetis dari model 15 menit · seed {data.model.randomSeed} · bukan pembacaan sensor lapangan.</p></section>

      <section className="monitoring-focus">
        <article className={`monitoring-verdict monitoring-verdict--${data.systemStatus}`}>
          <div><span>STATUS SEKARANG</span><StatusBadge status={data.systemStatus} /></div>
          <h2>{data.systemStatus === "normal" ? "Sistem berjalan stabil" : data.systemStatus === "critical" ? "Operasi dihentikan" : "Ada kondisi yang perlu diperiksa"}</h2>
          <p>{primaryMessage}</p>
          <dl>
            <div><dt>Waktu model</dt><dd>{displayTime(data.timestamp)}</dd></div>
            <div><dt>Skenario</dt><dd>{scenario.replaceAll("-", " ")}</dd></div>
          </dl>
        </article>

        <div className="monitoring-signals">
          <article><Sun /><span><small>Produksi surya</small><b>{data.energy.pvPowerKw} kW</b><em>{data.energy.solarFractionPercent}% beban aktif</em></span></article>
          <article><Droplets /><span><small>Persediaan air</small><b>{data.water.tankLevelPercent}%</b><em>{data.water.tankVolumeM3} m³ di tandon</em></span></article>
          <article><Gauge /><span><small>Distribusi</small><b>{data.water.flowLps} L/s</b><em>{data.energy.pumpPowerKw > 0 ? `Pompa ${data.energy.pumpPowerKw} kW` : "Pompa siaga"}</em></span></article>
          <article><ShieldCheck /><span><small>Kualitas air</small><b>{data.waterQuality.turbidityNtu < 50 ? "Aman" : "Periksa"}</b><em>pH {data.waterQuality.ph} · {data.waterQuality.turbidityNtu} NTU</em></span></article>
        </div>
      </section>

      <section className="monitoring-runbar">
        <div><CloudSun /><span><small>MODEL BERJALAN</small><b>Setiap detik memajukan {data.model.timeStepMinutes} menit × kecepatan</b></span></div>
        <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause /> : <Play />}{isPlaying ? "Jeda" : "Jalankan"}</button>
        <Link to="/simulation">Buka Simulation Lab <ArrowRight /></Link>
      </section>

      <section className="monitoring-detail-grid">
        <article className="monitoring-flow-panel"><header><span>ALIRAN TERINTEGRASI</span><h2>Dari matahari hingga lahan</h2></header><SystemFlow data={data} /></article>
        <article className="monitoring-zone-panel"><header><span>PRIORITAS IRIGASI</span><h2>Kondisi per zona</h2></header><div>{data.zones.map((zone) => <Link key={zone.id} to="/operate/irrigation"><span><b>{zone.id}</b><small>{zone.crop}</small></span><span><small>Kebutuhan</small><b>{zone.demandPercent}%</b></span><i className={zone.valveOpen ? "active" : ""}>{zone.valveOpen ? "Mengalir" : zone.status === "ready" ? "Perlu air" : "Cukup"}</i></Link>)}</div></article>
      </section>

      <section className="monitoring-trend">
        <header><div><span>12 JAM TERAKHIR</span><h2>Energi dan beban pompa</h2></div><p>Kurva berasal dari model fisik yang sama dengan panel kontrol dan analisis.</p></header>
        <OperationsChart data={data.history} />
      </section>

      <details className="monitoring-devices"><summary><span><Activity />Kesehatan perangkat</span><b>{data.devices.filter((device) => device.status === "normal").length}/{data.devices.length} normal</b></summary><div>{data.devices.map((device) => <article key={device.code}><code>{device.code}</code><span><b>{device.name}</b><small>{device.lastReading}</small></span><StatusBadge status={device.status} /></article>)}</div></details>
    </div>
  );
}
