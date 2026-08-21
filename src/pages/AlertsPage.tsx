import { AlertTriangle, CheckCircle2, Clock3, ListChecks, ShieldCheck } from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { useSystem } from "../contexts/SystemContext";
import { useTelemetry } from "../hooks/useTelemetry";

export function AlertsPage() {
  const { data, isLoading } = useTelemetry();
  const { commandHistory } = useSystem();
  if (isLoading || !data) return <div className="page-loading">Menyiapkan pusat peringatan…</div>;
  return (
    <div className="project-page alerts-page">
      <header className="operation-page-header"><div><span>OPERATE · EVENT CENTER</span><h1>Peringatan yang menjelaskan tindakan.</h1><p>Prioritas, penyebab, dan langkah tindak lanjut ditampilkan bersama—bukan sekadar kode alarm.</p></div><DataBadge source="SIMULATION" /></header>
      <section className="alert-summary"><div><ShieldCheck /><span><small>STATUS MODEL</small><b>{data.systemStatus === "normal" ? "Tidak ada gangguan aktif" : `${data.alerts.length} kondisi aktif`}</b></span></div><div><Clock3 /><span><small>WAKTU MODEL</small><b>{new Date(data.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}</b></span></div></section>
      <section className="alert-center-grid"><article className="active-alerts"><header><AlertTriangle /><div><span>ACTIVE EVENTS</span><h2>Kondisi saat ini</h2></div></header>{data.alerts.length ? <div>{data.alerts.map((alert) => <article key={alert.id} className={`event-row event-row--${alert.level}`}><span>{alert.level}</span><div><b>{alert.title}</b><p>{alert.detail}</p></div><i>{alert.level === "critical" ? "Hentikan & inspeksi" : "Tinjau kondisi"}</i></article>)}</div> : <div className="alerts-empty"><CheckCircle2 /><b>Semua pemeriksaan lolos</b><p>Tandon, energi, kualitas air, dan perangkat tidak memicu alarm pada step ini.</p></div>}</article><article className="command-audit"><header><ListChecks /><div><span>SESSION AUDIT</span><h2>Riwayat perintah</h2></div></header>{commandHistory.length ? <div>{commandHistory.map((entry) => <article key={entry.id}><time>{new Date(entry.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</time><span><b>{entry.zoneId ?? "Sistem"}</b><p>{entry.description}</p></span></article>)}</div> : <div className="alerts-empty"><ListChecks /><b>Belum ada perintah</b><p>Perintah dari halaman Kontrol Irigasi akan tercatat di sini selama sesi browser.</p></div>}</article></section>
    </div>
  );
}
