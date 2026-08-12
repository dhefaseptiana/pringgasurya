import { Droplets, Gauge, Leaf, PlugZap, RadioTower, Sprout, Sun, X } from "lucide-react";
import { useState } from "react";
import type { TelemetrySnapshot } from "../../domain/types";
import { StatusBadge } from "../common/StatusBadge";

type NodeId = "solar" | "grid" | "controller" | "pump" | "tank" | "field";

const nodeInfo: Record<NodeId, { title: string; sensors: string; logic: string; safety: string }> = {
  solar: { title: "PLTS agrivoltaik", sensors: "PV-01 · register inverter/MPPT", logic: "Menghasilkan daya mengikuti irradiance, kapasitas panel, suhu, dan layout.", safety: "DC isolator, SPD, grounding, dan proteksi inverter." },
  grid: { title: "Cadangan PLN", sensors: "EM-01 · multifunction energy meter", logic: "Menyuplai kekurangan daya hanya jika kebutuhan air tidak dapat ditunda.", safety: "MCB, contactor interlock, anti-backfeed, dan teknisi berwenang." },
  controller: { title: "Panel VFD & RTU", sensors: "RTU-01 · RS485, 4–20 mA, digital I/O", logic: "Memilih sumber, memeriksa permissive, dan menjalankan logika lokal.", safety: "Keputusan trip tetap lokal meskipun dashboard atau internet gagal." },
  pump: { title: "Pompa sumber air", sensors: "FM-01, PT-01, EM-01", logic: "Mengubah energi listrik menjadi debit pada total dynamic head yang dipilih.", safety: "Dry-run, overload, pressure limit, emergency stop, dan feedback kontaktor." },
  tank: { title: "Tandon operasional", sensors: "TL-01 + FS-01 high/low", logic: "Menyimpan air agar waktu produksi surya tidak harus sama dengan waktu irigasi.", safety: "Float switch independen menghentikan pompa pada high-high level." },
  field: { title: "Zona pertanian", sensors: "WL-01 untuk padi · SM-01 untuk lahan kering", logic: "Katup membuka menurut profil tanaman, kebutuhan air, dan batas persediaan.", safety: "Feedback limit switch dan operasi manual tetap tersedia." },
};

export function InteractiveSystemExplorer({ data }: { data: TelemetrySnapshot }) {
  const [selected, setSelected] = useState<NodeId>("solar");
  const running = data.energy.pumpPowerKw > 0;
  const active = nodeInfo[selected];
  const pvWidth = Math.max(2, Math.min(10, data.energy.pvPowerKw * 2.4));
  const gridWidth = Math.max(1, Math.min(8, data.energy.gridPowerKw * 3));
  const waterWidth = Math.max(1, Math.min(10, data.water.flowLps * 1.6));
  return (
    <div className="explorer-layout">
      <div className="interactive-explorer">
        <div className="explorer-source-column">
          <ExplorerNode id="solar" selected={selected} setSelected={setSelected} icon={Sun} label="PLTS" value={`${data.energy.pvPowerKw} kW`} meta="Sumber utama" tone="solar" />
          <ExplorerNode id="grid" selected={selected} setSelected={setSelected} icon={PlugZap} label="PLN" value={`${data.energy.gridPowerKw} kW`} meta={data.energy.gridPowerKw ? "Grid assist" : "Siaga"} tone="grid" />
        </div>
        <div className="animated-connector connector-energy" style={{ "--flow-size": `${pvWidth}px` } as React.CSSProperties}><i /></div>
        <ExplorerNode id="controller" selected={selected} setSelected={setSelected} icon={RadioTower} label="Panel & RTU" value="Solar-first" meta="Kontrol lokal" />
        <div className={`animated-connector connector-energy ${running ? "is-flowing" : "is-stopped"}`} style={{ "--flow-size": `${Math.max(pvWidth, gridWidth)}px` } as React.CSSProperties}><i /></div>
        <ExplorerNode id="pump" selected={selected} setSelected={setSelected} icon={Gauge} label="Pompa" value={running ? "Berjalan" : "Berhenti"} meta={`${data.energy.pumpPowerKw} kW`} tone={running ? "active" : "fault"} />
        <div className={`animated-connector connector-water ${data.water.flowLps ? "is-flowing" : "is-stopped"}`} style={{ "--flow-size": `${waterWidth}px` } as React.CSSProperties}><i /></div>
        <ExplorerNode id="tank" selected={selected} setSelected={setSelected} icon={Droplets} label="Tandon" value={`${data.water.tankLevelPercent}%`} meta={`${data.water.tankVolumeM3} m³`} tone="water" />
        <div className={`animated-connector connector-water ${data.zones.some((zone) => zone.valveOpen) ? "is-flowing" : "is-stopped"}`} style={{ "--flow-size": `${waterWidth}px` } as React.CSSProperties}><i /></div>
        <ExplorerNode id="field" selected={selected} setSelected={setSelected} icon={Sprout} label="Lahan" value={`${data.zones.filter((zone) => zone.valveOpen).length} zona`} meta={`${data.water.flowLps} L/s`} tone="crop" />
      </div>
      <aside className="explorer-detail">
        <div className="explorer-detail__top"><span>COMPONENT INSPECTOR</span><button onClick={() => setSelected("solar")} aria-label="Reset pilihan"><X /></button></div>
        <h3>{active.title}</h3>
        <div className="explorer-detail__status"><StatusBadge status={selected === "pump" && !running ? "critical" : "normal"} /><span>Klik komponen lain untuk memeriksa</span></div>
        <dl><div><dt>Sensor terkait</dt><dd>{active.sensors}</dd></div><div><dt>Logika simulasi</dt><dd>{active.logic}</dd></div><div><dt>Proteksi lapangan</dt><dd>{active.safety}</dd></div></dl>
        <div className="explorer-live-note"><Leaf /><p>Ketebalan dan gerak garis menunjukkan besarnya aliran energi atau air pada skenario aktif.</p></div>
      </aside>
    </div>
  );
}

function ExplorerNode({ id, selected, setSelected, icon: Icon, label, value, meta, tone = "engineering" }: { id: NodeId; selected: NodeId; setSelected: (id: NodeId) => void; icon: typeof Sun; label: string; value: string; meta: string; tone?: string }) {
  return <button className={`explorer-node explorer-node--${tone} ${selected === id ? "is-selected" : ""}`} onClick={() => setSelected(id)} aria-pressed={selected === id}><Icon /><span>{label}</span><b>{value}</b><small>{meta}</small></button>;
}
