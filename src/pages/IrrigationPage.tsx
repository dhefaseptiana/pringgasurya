import { CheckCircle2, Clock3, Droplets, ShieldAlert, Sprout, X } from "lucide-react";
import { useState } from "react";
import { DataBadge } from "../components/common/DataBadge";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { useSystem } from "../contexts/SystemContext";
import type { CropProfile } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";

const profiles: Record<CropProfile, { primary: string; reading: string; target: string; rule: string; irrigation: string }> = {
  Padi: { primary: "Muka air petak", reading: "4,6 cm", target: "Target 3–5 cm", rule: "Irigasi berdasarkan level air dan skenario AWD", irrigation: "Saluran/pintu air" },
  Hortikultura: { primary: "Kelembapan zona akar", reading: "31% VWC", target: "Ambang awal DATA_REQUIRED", rule: "Irigasi saat VWC melewati ambang bawah terkalibrasi", irrigation: "Tetes / sprinkler" },
  Palawija: { primary: "Kelembapan zona akar", reading: "31% VWC", target: "Ambang awal DATA_REQUIRED", rule: "Gabungkan VWC, fase tumbuh, hujan, dan ET", irrigation: "Tetes / alur" },
};

export function IrrigationPage() {
  const { crop, setCrop } = useSystem();
  const { data, isLoading } = useTelemetry();
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [commandLog, setCommandLog] = useState<Array<{ time: string; command: string }>>([]);
  if (isLoading || !data) return <div className="page-loading">Menyiapkan logika irigasi simulasi…</div>;
  const profile = profiles[crop];

  const confirmCommand = () => {
    if (!pendingCommand) return;
    setCommandLog((current) => [{ time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), command: pendingCommand }, ...current]);
    setPendingCommand(null);
  };

  return (
    <>
      <PageHeader eyebrow="OPERATE · SMART IRRIGATION" title="Aturan berbeda untuk kebutuhan tanaman yang berbeda" description="Padi menggunakan muka air petak sebagai parameter utama. Hortikultura dan palawija menggunakan kelembapan tanah yang dikalibrasi terhadap jenis tanah dan zona akar." />
      <section className="control-warning"><ShieldAlert /><div><b>SIMULATION-ONLY CONTROL</b><p>Tombol di halaman ini hanya menulis command log lokal. Tidak ada perintah yang dikirim ke pompa, katup, MQTT, atau backend.</p></div><DataBadge source="SIMULATION" /></section>
      <section className="crop-profile-tabs" aria-label="Pilih profil tanaman">{(["Padi", "Hortikultura", "Palawija"] as CropProfile[]).map((item) => <button key={item} className={crop === item ? "active" : ""} onClick={() => setCrop(item)}><Sprout /><span>{item}<small>{item === "Padi" ? "Level air + AWD" : "Soil moisture + ET"}</small></span></button>)}</section>
      <section className="irrigation-layout">
        <article className="panel-block irrigation-logic"><SectionHeading kicker="ACTIVE PROFILE" title={crop} description={profile.rule} /><div className="logic-metrics"><div><span>{profile.primary}</span><b>{crop === "Padi" ? `${data.water.fieldWaterLevelCm} cm` : `${data.water.soilMoisturePercent}% VWC`}</b><small>{profile.target}</small></div><div><span>Persediaan tandon</span><b>{data.water.tankLevelPercent}%</b><small>Batas operasi minimum 25%</small></div><div><span>Metode distribusi</span><b>{profile.irrigation}</b><small>Konfigurasi skenario awal</small></div></div><div className="logic-expression"><span>IF</span><p>{crop === "Padi" ? "muka air ≤ ambang AWD" : "VWC ≤ ambang terkalibrasi"}</p><span>AND</span><p>tandon ≥ batas minimum</p><span>THEN</span><p>buka zona + validasi debit</p></div></article>
        <aside className="panel-block command-panel"><SectionHeading kicker="PROTOTYPE COMMAND" title="Uji alur konfirmasi" /><button className="command-button" onClick={() => setPendingCommand("Buka katup Zona 02 selama 15 menit")}><Droplets /><span><b>Buka Zona 02</b><small>Durasi simulasi 15 menit</small></span></button><button className="command-button command-button--stop" onClick={() => setPendingCommand("Hentikan seluruh irigasi simulasi")}><X /><span><b>Hentikan irigasi</b><small>Tutup semua katup simulasi</small></span></button><p className="command-safety">Pada sistem nyata: autentikasi → otorisasi → konfirmasi → kirim → tunggu device acknowledgment → log.</p></aside>
      </section>
      <section className="panel-block"><SectionHeading kicker="IRRIGATION ZONES" title="Permintaan dan status zona" /><div className="zone-list">{data.zones.map((zone) => <article key={zone.id} className={zone.valveOpen ? "zone-active" : ""}><div><span>{zone.id}</span><b>{zone.crop}</b></div><div className="demand-meter"><i style={{ width: `${zone.demandPercent}%` }} /></div><p>{zone.demandPercent}% demand</p><strong>{zone.valveOpen ? "VALVE OPEN" : zone.status.toUpperCase()}</strong></article>)}</div></section>
      <section className="panel-block"><SectionHeading kicker="LOCAL COMMAND LOG" title="Jejak perintah sesi ini" description="Log hilang ketika halaman dimuat ulang karena belum menggunakan backend." />{commandLog.length === 0 ? <div className="empty-log"><Clock3 /><p>Belum ada perintah simulasi pada sesi ini.</p></div> : <div className="command-log">{commandLog.map((entry, index) => <div key={`${entry.time}-${index}`}><CheckCircle2 /><time>{entry.time}</time><p>{entry.command}</p><DataBadge source="SIMULATION" compact /></div>)}</div>}</section>
      {pendingCommand && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingCommand(null)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}><DataBadge source="SIMULATION" /><h2 id="confirm-title">Konfirmasi perintah prototipe</h2><p>{pendingCommand}</p><div className="modal-note"><ShieldAlert /><span>Perintah ini hanya disimpan pada browser dan tidak mengendalikan perangkat.</span></div><div className="button-row"><button className="button button--primary" onClick={confirmCommand}>Konfirmasi simulasi</button><button className="button button--secondary" onClick={() => setPendingCommand(null)}>Batal</button></div></div></div>}
    </>
  );
}
