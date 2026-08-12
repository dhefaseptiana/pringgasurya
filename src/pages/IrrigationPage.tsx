import { CheckCircle2, Clock3, Droplets, ShieldAlert, Sprout, X } from "lucide-react";
import { useState } from "react";
import { DataBadge } from "../components/common/DataBadge";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { InteractiveFieldMap } from "../components/interactive/InteractiveFieldMap";
import { useSystem } from "../contexts/SystemContext";
import type { CropProfile } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";

const profiles: Record<CropProfile, { primary: string; reading: string; target: string; rule: string; irrigation: string }> = {
  Padi: { primary: "Muka air petak", reading: "4,6 cm", target: "Target 3–5 cm", rule: "Irigasi berdasarkan level air dan skenario AWD", irrigation: "Saluran/pintu air" },
  Hortikultura: { primary: "Kelembapan zona akar", reading: "31% VWC", target: "Ambang awal DATA_REQUIRED", rule: "Irigasi saat VWC melewati ambang bawah terkalibrasi", irrigation: "Tetes / sprinkler" },
  Palawija: { primary: "Kelembapan zona akar", reading: "31% VWC", target: "Ambang awal DATA_REQUIRED", rule: "Gabungkan VWC, fase tumbuh, hujan, dan ET", irrigation: "Tetes / alur" },
};

export function IrrigationPage() {
  const { crop, setCrop, inputs, updateInput, toggleZone } = useSystem();
  const { data, isLoading } = useTelemetry();
  const [pendingCommand, setPendingCommand] = useState<{ text: string; zoneId?: string } | null>(null);
  const [growthStage, setGrowthStage] = useState("Vegetatif");
  const [commandLog, setCommandLog] = useState<Array<{ time: string; command: string }>>([]);
  if (isLoading || !data) return <div className="page-loading">Menyiapkan logika irigasi simulasi…</div>;
  const profile = profiles[crop];

  const confirmCommand = () => {
    if (!pendingCommand) return;
    if (pendingCommand.zoneId) toggleZone(pendingCommand.zoneId);
    setCommandLog((current) => [{ time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), command: pendingCommand.text }, ...current]);
    setPendingCommand(null);
  };

  return (
    <>
      <PageHeader eyebrow="OPERATE · SMART IRRIGATION" title="Aturan berbeda untuk kebutuhan tanaman yang berbeda" description="Padi menggunakan muka air petak sebagai parameter utama. Hortikultura dan palawija menggunakan kelembapan tanah yang dikalibrasi terhadap jenis tanah dan zona akar." />
      <section className="control-warning"><ShieldAlert /><div><b>SIMULATION-ONLY CONTROL</b><p>Tombol di halaman ini hanya menulis command log lokal. Tidak ada perintah yang dikirim ke pompa, katup, MQTT, atau backend.</p></div><DataBadge source="SIMULATION" /></section>
      <section className="crop-lab"><div className="crop-profile-tabs" aria-label="Pilih profil tanaman">{(["Padi", "Hortikultura", "Palawija"] as CropProfile[]).map((item) => <button key={item} className={crop === item ? "active" : ""} onClick={() => setCrop(item)}><Sprout /><span>{item}<small>{item === "Padi" ? "Level air + AWD" : "Soil moisture + ET"}</small></span></button>)}</div><div className="crop-lab__settings"><label><span>Fase tumbuh</span><select value={growthStage} onChange={(event) => setGrowthStage(event.target.value)}><option>Awal</option><option>Vegetatif</option><option>Generatif</option><option>Pematangan</option></select></label><label className="range-control"><span>Kebutuhan air<b>{inputs.irrigationDemandPercent}%</b></span><input aria-label="Kebutuhan air tanaman" type="range" min="20" max="100" step="2" value={inputs.irrigationDemandPercent} onChange={(event) => updateInput("irrigationDemandPercent", Number(event.target.value))} /><i style={{ width: `${inputs.irrigationDemandPercent}%` }} /></label><div><span>Keputusan utama</span><b>{crop === "Padi" ? "Muka air + AWD" : "Soil moisture + ET"}</b><small>{growthStage} · ambang lokal {crop === "Padi" ? "3–5 cm (skenario)" : "DATA_REQUIRED"}</small></div></div></section>
      <section className="panel-block"><SectionHeading kicker="INTERACTIVE FIELD MAP" title="Klik zona, periksa kebutuhan, lalu uji katup" description="Pembukaan zona langsung mengubah beban pompa, debit, level tandon, biaya, dan emisi pada seluruh aplikasi." /><InteractiveFieldMap data={data} onRequestToggle={(zoneId, open) => setPendingCommand({ text: `${open ? "Buka" : "Tutup"} katup ${zoneId}`, zoneId })} /></section>
      <section className="irrigation-layout">
        <article className="panel-block irrigation-logic"><SectionHeading kicker="ACTIVE PROFILE" title={crop} description={profile.rule} /><div className="logic-metrics"><div><span>{profile.primary}</span><b>{crop === "Padi" ? `${data.water.fieldWaterLevelCm} cm` : `${data.water.soilMoisturePercent}% VWC`}</b><small>{profile.target}</small></div><div><span>Persediaan tandon</span><b>{data.water.tankLevelPercent}%</b><small>Batas operasi minimum 25%</small></div><div><span>Metode distribusi</span><b>{profile.irrigation}</b><small>Konfigurasi skenario awal</small></div></div><div className="logic-expression"><span>IF</span><p>{crop === "Padi" ? "muka air ≤ ambang AWD" : "VWC ≤ ambang terkalibrasi"}</p><span>AND</span><p>tandon ≥ batas minimum</p><span>THEN</span><p>buka zona + validasi debit</p></div></article>
        <aside className="panel-block command-panel"><SectionHeading kicker="PROTOTYPE COMMAND" title="Uji alur konfirmasi" /><button className="command-button" onClick={() => setPendingCommand({ text: "Buka katup Zona 02 selama 15 menit", zoneId: "Zona 02" })}><Droplets /><span><b>Toggle Zona 02</b><small>Perbarui aliran simulasi</small></span></button><button className="command-button command-button--stop" onClick={() => setPendingCommand({ text: "Hentikan seluruh irigasi simulasi" })}><X /><span><b>Catat emergency request</b><small>Tidak mengendalikan hardware</small></span></button><p className="command-safety">Pada sistem nyata: autentikasi → otorisasi → konfirmasi → kirim → tunggu device acknowledgment → log.</p></aside>
      </section>
      <section className="panel-block"><SectionHeading kicker="IRRIGATION ZONES" title="Permintaan dan status zona" /><div className="zone-list">{data.zones.map((zone) => <article key={zone.id} className={zone.valveOpen ? "zone-active" : ""}><div><span>{zone.id}</span><b>{zone.crop}</b></div><div className="demand-meter"><i style={{ width: `${zone.demandPercent}%` }} /></div><p>{zone.demandPercent}% demand</p><strong>{zone.valveOpen ? "VALVE OPEN" : zone.status.toUpperCase()}</strong></article>)}</div></section>
      <section className="panel-block"><SectionHeading kicker="LOCAL COMMAND LOG" title="Jejak perintah sesi ini" description="Log hilang ketika halaman dimuat ulang karena belum menggunakan backend." />{commandLog.length === 0 ? <div className="empty-log"><Clock3 /><p>Belum ada perintah simulasi pada sesi ini.</p></div> : <div className="command-log">{commandLog.map((entry, index) => <div key={`${entry.time}-${index}`}><CheckCircle2 /><time>{entry.time}</time><p>{entry.command}</p><DataBadge source="SIMULATION" compact /></div>)}</div>}</section>
      {pendingCommand && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingCommand(null)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}><DataBadge source="SIMULATION" /><h2 id="confirm-title">Konfirmasi perintah prototipe</h2><p>{pendingCommand.text}</p><div className="modal-note"><ShieldAlert /><span>Perintah ini hanya memperbarui simulation engine pada browser dan tidak mengendalikan perangkat.</span></div><div className="button-row"><button className="button button--primary" onClick={confirmCommand}>Konfirmasi simulasi</button><button className="button button--secondary" onClick={() => setPendingCommand(null)}>Batal</button></div></div></div>}
    </>
  );
}
