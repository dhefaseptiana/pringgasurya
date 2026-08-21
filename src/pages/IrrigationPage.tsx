import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Droplets,
  Gauge,
  Leaf,
  Play,
  Power,
  RadioTower,
  ShieldCheck,
  Sun,
  Timer,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataBadge } from "../components/common/DataBadge";
import { InteractiveFieldMap } from "../components/interactive/InteractiveFieldMap";
import { useSystem } from "../contexts/SystemContext";
import type { ControlMode } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";

type TargetType = "condition" | "volume" | "duration";
type PendingCommand = {
  action: "start" | "stop" | "stop-all";
  text: string;
  zoneId?: string;
  nextMode?: ControlMode;
};

const modeOptions: Array<{ value: ControlMode; label: string; description: string }> = [
  { value: "automatic", label: "Otomatis", description: "Sistem mengikuti sensor dan jadwal" },
  { value: "manual", label: "Manual", description: "Operator mengirim perintah langsung" },
  { value: "off", label: "Nonaktif", description: "Semua perintah dihentikan" },
];

function formatElapsed(startedAt: number | null, now: number) {
  if (!startedAt) return "Aktif sebelum sesi";
  const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function IrrigationPage() {
  const { controlMode, setControlMode, inputs, updateInput, recordCommand } = useSystem();
  const { data, isLoading, dataUpdatedAt } = useTelemetry();
  const [selectedId, setSelectedId] = useState("Zona 01");
  const [targetType, setTargetType] = useState<TargetType>("condition");
  const [conditionTarget, setConditionTarget] = useState(4);
  const [volumeTarget, setVolumeTarget] = useState(8);
  const [durationTarget, setDurationTarget] = useState(15);
  const [pendingCommand, setPendingCommand] = useState<PendingCommand | null>(null);
  const [commandLog, setCommandLog] = useState<Array<{ time: string; command: string }>>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const selectedZone = data?.zones.find((zone) => zone.id === selectedId) ?? data?.zones[0];
  const selectedIsRunning = Boolean(selectedZone?.valveOpen);
  const anyZoneRunning = Boolean(data?.zones.some((zone) => zone.valveOpen));

  useEffect(() => {
    if (!selectedIsRunning) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [selectedIsRunning]);

  useEffect(() => {
    if (!selectedZone) return;
    setConditionTarget(selectedZone.crop === "Padi" ? 4 : 65);
  }, [selectedZone?.crop]);

  const readiness = useMemo(() => {
    if (!data) return [];
    const qualityReady = data.quality === "VALID" && data.waterQuality.ph >= 5.5 && data.waterQuality.ph <= 8.5 && data.waterQuality.turbidityNtu < 50;
    const tankReady = data.water.tankLevelPercent >= 25;
    const energyReady = data.energy.pvPowerKw > 0.1 || data.energy.gridPowerKw > 0.1 || inputs.gridAvailable;
    const devicesReady = data.systemStatus !== "critical" && data.devices.every((device) => device.status !== "offline");
    return [
      { icon: ShieldCheck, label: "Kualitas air", value: qualityReady ? "Aman" : "Periksa", ready: qualityReady, detail: `pH ${data.waterQuality.ph} · ${data.waterQuality.turbidityNtu} NTU` },
      { icon: Droplets, label: "Tandon", value: `${data.water.tankLevelPercent}%`, ready: tankReady, detail: `${data.water.tankVolumeM3} m³ tersedia` },
      { icon: Sun, label: "Energi", value: data.energy.gridPowerKw > 0.05 ? "Surya + PLN" : "Surya aktif", ready: energyReady, detail: `${data.energy.pvPowerKw} kW tersedia` },
      { icon: RadioTower, label: "Perangkat", value: devicesReady ? "Terhubung" : "Periksa", ready: devicesReady, detail: `${data.devices.filter((device) => device.status !== "offline").length}/${data.devices.length} perangkat` },
    ];
  }, [data, inputs.gridAvailable]);

  if (isLoading || !data || !selectedZone) return <div className="page-loading">Menyiapkan kontrol irigasi…</div>;

  const systemReady = readiness.every((item) => item.ready) && controlMode !== "off";
  const conditionLabel = selectedZone.crop === "Padi" ? "Muka air" : "Kelembapan";
  const conditionUnit = selectedZone.crop === "Padi" ? "cm" : "%";
  const conditionMin = selectedZone.crop === "Padi" ? 2 : 40;
  const conditionMax = selectedZone.crop === "Padi" ? 8 : 80;
  const targetText = targetType === "condition"
    ? `${conditionLabel.toLowerCase()} ${conditionTarget} ${conditionUnit}`
    : targetType === "volume"
      ? `volume ${volumeTarget} m³`
      : `durasi ${durationTarget} menit`;
  const blockedReason = controlMode === "off"
    ? "Aktifkan mode Otomatis atau Manual terlebih dahulu."
    : readiness.find((item) => !item.ready)?.detail;

  const requestMode = (mode: ControlMode) => {
    if (mode === "off" && anyZoneRunning) {
      setPendingCommand({ action: "stop-all", text: "Hentikan seluruh irigasi dan nonaktifkan kontrol", nextMode: "off" });
      return;
    }
    setControlMode(mode);
    recordCommand({ action: "mode", description: `Mode kontrol diubah menjadi ${modeOptions.find((item) => item.value === mode)?.label ?? mode}` });
  };

  const confirmCommand = () => {
    if (!pendingCommand) return;
    if (pendingCommand.action === "start" && pendingCommand.zoneId) {
      updateInput("activeZoneIds", [pendingCommand.zoneId]);
      setSessionStartedAt(Date.now());
      setNow(Date.now());
    }
    if (pendingCommand.action === "stop" && pendingCommand.zoneId) {
      updateInput("activeZoneIds", inputs.activeZoneIds.filter((id) => id !== pendingCommand.zoneId));
      setSessionStartedAt(null);
    }
    if (pendingCommand.action === "stop-all") {
      updateInput("activeZoneIds", []);
      setSessionStartedAt(null);
    }
    if (pendingCommand.nextMode) setControlMode(pendingCommand.nextMode);
    recordCommand({
      action: pendingCommand.action,
      zoneId: pendingCommand.zoneId,
      description: pendingCommand.text,
    });
    setCommandLog((current) => [{
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      command: pendingCommand.text,
    }, ...current].slice(0, 8));
    setPendingCommand(null);
  };

  const requestStart = () => setPendingCommand({
    action: "start",
    zoneId: selectedZone.id,
    text: `Mulai irigasi ${selectedZone.id} hingga ${targetText}`,
  });

  const requestStop = () => setPendingCommand({
    action: "stop",
    zoneId: selectedZone.id,
    text: `Hentikan irigasi ${selectedZone.id}`,
  });

  return (
    <div className="project-page project-page--irrigation control-page">
      <header className="control-page-header">
        <div><span>OPERATE · IRRIGATION</span><h1>Kontrol Irigasi</h1><p>Pilih zona, tentukan kebutuhan air, lalu jalankan irigasi dari satu tempat.</p></div>
        <div className="control-update"><RadioTower /><span><small>Pembaruan terakhir</small><b>{new Date(dataUpdatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</b></span></div>
      </header>

      <section className="control-disclosure"><DataBadge source="SIMULATION" /><p>Seluruh kontrol pada prototipe ini hanya mengubah simulasi di browser dan tidak mengirim perintah ke perangkat lapangan.</p></section>

      <section className="readiness-section" aria-labelledby="readiness-title">
        <div className="readiness-heading"><div><span>KESIAPAN SISTEM</span><h2 id="readiness-title">Siap untuk mengairi</h2></div><b className={systemReady ? "ready" : "blocked"}>{systemReady ? <CheckCircle2 /> : <AlertTriangle />}{systemReady ? "Semua pemeriksaan lolos" : "Tindakan diperlukan"}</b></div>
        <div className="control-readiness-grid">
          {readiness.map(({ icon: Icon, label, value, ready, detail }) => <article key={label} className={ready ? "is-ready" : "is-blocked"}><Icon /><span><small>{label}</small><b>{value}</b><em>{detail}</em></span><i>{ready ? <CheckCircle2 /> : <AlertTriangle />}</i></article>)}
        </div>
      </section>

      <section className="irrigation-command-layout">
        <div className="zone-workspace">
          <header><div><span>LANGKAH 01</span><h2>Pilih zona lahan</h2></div><p>Zona biru sedang dialiri. Klik petak lain untuk memeriksa dan mengaturnya.</p></header>
          <InteractiveFieldMap data={data} selectedId={selectedZone.id} onSelect={setSelectedId} />
        </div>

        <aside className="operator-console">
          <header><div><span>ZONA TERPILIH</span><h2>{selectedZone.id}</h2><p>{selectedZone.crop} · Pilot Unit 01</p></div><b className={selectedIsRunning ? "running" : "idle"}>{selectedIsRunning ? "Sedang diairi" : "Siap"}</b></header>

          <div className="zone-quick-reading">
            <div><span>{selectedZone.crop === "Padi" ? "Muka air" : "Kelembapan"}</span><b>{selectedZone.crop === "Padi" ? `${selectedZone.fieldWaterLevelCm} cm` : `${selectedZone.soilMoisturePercent}%`}</b></div>
            <div><span>Kebutuhan</span><b>{selectedZone.demandPercent}%</b></div>
          </div>

          <section className="control-mode">
            <div><span>MODE KONTROL</span><small>Pilih cara sistem merespons kebutuhan air.</small></div>
            <div className="mode-selector">{modeOptions.map((mode) => <button key={mode.value} className={controlMode === mode.value ? "active" : ""} onClick={() => requestMode(mode.value)}><Power /><span><b>{mode.label}</b><small>{mode.description}</small></span></button>)}</div>
          </section>

          {selectedIsRunning ? (
            <section className="running-console">
              <div className="running-pulse"><i /><span><small>IRIGASI BERJALAN</small><b>{selectedZone.id} sedang menerima air</b></span></div>
              <div className="running-metrics"><div><Timer /><span><small>Waktu berjalan</small><b>{formatElapsed(sessionStartedAt, now)}</b></span></div><div><Droplets /><span><small>Debit saat ini</small><b>{data.water.flowLps} L/s</b></span></div><div><Gauge /><span><small>Tekanan</small><b>{data.water.pressureBar} bar</b></span></div><div><Zap /><span><small>Daya pompa</small><b>{data.energy.pumpPowerKw} kW</b></span></div></div>
              <button className="stop-irrigation-button" onClick={requestStop}><X />Hentikan Irigasi</button>
            </section>
          ) : (
            <section className="target-console">
              <div className="console-section-heading"><span>LANGKAH 02</span><h3>Tentukan target</h3></div>
              <div className="target-type-selector">
                <button className={targetType === "condition" ? "active" : ""} onClick={() => setTargetType("condition")}><Leaf />{conditionLabel}</button>
                <button className={targetType === "volume" ? "active" : ""} onClick={() => setTargetType("volume")}><Droplets />Volume</button>
                <button className={targetType === "duration" ? "active" : ""} onClick={() => setTargetType("duration")}><Clock3 />Durasi</button>
              </div>

              {targetType === "condition" && <label className="target-slider"><span><small>Target {conditionLabel.toLowerCase()}</small><b>{conditionTarget} {conditionUnit}</b></span><input type="range" min={conditionMin} max={conditionMax} step={selectedZone.crop === "Padi" ? .5 : 1} value={conditionTarget} onChange={(event) => setConditionTarget(Number(event.target.value))} /></label>}
              {targetType === "volume" && <label className="target-slider"><span><small>Volume maksimum</small><b>{volumeTarget} m³</b></span><input type="range" min="1" max="20" step="1" value={volumeTarget} onChange={(event) => setVolumeTarget(Number(event.target.value))} /></label>}
              {targetType === "duration" && <label className="target-slider"><span><small>Durasi maksimum</small><b>{durationTarget} menit</b></span><input type="range" min="5" max="60" step="5" value={durationTarget} onChange={(event) => setDurationTarget(Number(event.target.value))} /></label>}

              <div className="command-summary"><span>RINGKASAN TINDAKAN</span><p><b>{selectedZone.id}</b> akan diairi hingga {targetText}. Air berasal dari tandon dengan strategi energi solar-first.</p></div>
              <button className="start-irrigation-button" disabled={!systemReady} onClick={requestStart}><Play />Mulai Irigasi</button>
              {!systemReady && <p className="control-block-reason"><AlertTriangle />{blockedReason}</p>}
            </section>
          )}
        </aside>
      </section>

      <section className="secondary-control-information">
        <details open><summary><span><Clock3 /><b>Jadwal berikutnya</b></span><em>3 agenda</em></summary><div className="schedule-list"><article><time>07:00</time><span><b>Zona 01</b><small>Padi · pemeriksaan muka air</small></span><i>Besok</i></article><article><time>10:30</time><span><b>Zona 02</b><small>Hortikultura · target kelembapan</small></span><i>Besok</i></article><article><time>15:30</time><span><b>Zona 03</b><small>Palawija · berdasarkan sensor</small></span><i>Besok</i></article></div></details>
        <details><summary><span><CheckCircle2 /><b>Riwayat perintah</b></span><em>{commandLog.length} perintah sesi</em></summary>{commandLog.length === 0 ? <div className="control-empty-state"><p>Belum ada perintah pada sesi ini.</p></div> : <div className="simplified-command-log">{commandLog.map((entry, index) => <article key={`${entry.time}-${index}`}><CheckCircle2 /><time>{entry.time}</time><p>{entry.command}</p></article>)}</div>}</details>
      </section>

      {anyZoneRunning && <button className="emergency-stop" onClick={() => setPendingCommand({ action: "stop-all", text: "Hentikan seluruh zona irigasi" })}><AlertTriangle /><span><b>Berhenti Darurat</b><small>Hentikan seluruh aliran</small></span></button>}

      {pendingCommand && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPendingCommand(null)}><div className="confirm-modal confirm-modal--control" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}><DataBadge source="SIMULATION" /><h2 id="confirm-title">Konfirmasi tindakan</h2><p>{pendingCommand.text}</p><div className="modal-note"><ShieldCheck /><span>Sistem akan memeriksa kondisi air, tandon, energi, dan perangkat sebelum memperbarui simulasi.</span></div><div className="button-row"><button className={`button ${pendingCommand.action === "start" ? "button--primary" : "button--danger"}`} onClick={confirmCommand}>{pendingCommand.action === "start" ? "Konfirmasi dan mulai" : "Konfirmasi berhenti"}</button><button className="button button--secondary" onClick={() => setPendingCommand(null)}>Batal</button></div></div></div>}
    </div>
  );
}
