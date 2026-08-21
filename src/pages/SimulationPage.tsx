import {
  AlertTriangle,
  CalendarClock,
  CloudSun,
  Download,
  Droplets,
  FileSpreadsheet,
  Gauge,
  Info,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { useSystem } from "../contexts/SystemContext";
import type { ScenarioId } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";
import { generateSyntheticDataset, simulationRowsToCsv } from "../services/simulation/SyntheticSimulationModel";

const scenarios: Array<{ id: ScenarioId; title: string; description: string; icon: typeof Sun }> = [
  { id: "normal", title: "Operasi normal", description: "Cuaca cerah, perangkat sehat, dan pasokan air memadai.", icon: Sun },
  { id: "reduced-pv", title: "Surya berkurang", description: "Uji respons solar-first saat tutupan awan meningkat.", icon: CloudSun },
  { id: "low-tank", title: "Tandon rendah", description: "Periksa prioritas pengisian dan interlock minimum.", icon: Droplets },
  { id: "irrigation-demand", title: "Permintaan tinggi", description: "Tekanan kebutuhan air meningkat pada seluruh zona.", icon: Leaf },
  { id: "abnormal-flow", title: "Debit abnormal", description: "Simulasikan sumbatan atau kebocoran pada jalur air.", icon: Gauge },
  { id: "pump-fault", title: "Gangguan pompa", description: "Pompa berhenti dan sistem mengaktifkan peringatan kritis.", icon: AlertTriangle },
];

function displaySimulationTime(timestamp: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

export function SimulationPage() {
  const {
    scenario, setScenario, inputs, updateInput, isPlaying, setIsPlaying, speed, setSpeed,
    resetSimulation, commandHistory,
  } = useSystem();
  const { data, isLoading } = useTelemetry();

  if (isLoading || !data) return <div className="page-loading">Menyiapkan model simulasi…</div>;

  const exportDataset = (days: number) => {
    const steps = days * 96;
    const rows = generateSyntheticDataset({ ...inputs, simulationStep: steps - 1 }, scenario, steps);
    const blob = new Blob([simulationRowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pringgasurya-${scenario}-${days}hari-seed${inputs.randomSeed}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="project-page simulation-page">
      <header className="simulation-page__header">
        <div>
          <span>PROTOTYPE · SYNTHETIC DATA</span>
          <h1>Simulation Lab</h1>
          <p>Uji hubungan energi, air, dan kebutuhan tanaman dengan model yang transparan serta dapat diulang.</p>
        </div>
        <DataBadge source="SIMULATION" />
      </header>

      <section className="simulation-disclosure">
        <Info />
        <p><b>Ini bukan pembacaan lapangan.</b> Seluruh nilai dihitung dari aturan fisik dan asumsi yang tercantum di halaman ini. Seed yang sama menghasilkan data yang sama.</p>
      </section>

      <section className="simulation-transport" aria-label="Kontrol waktu simulasi">
        <div className="simulation-clock">
          <CalendarClock />
          <span><small>WAKTU MODEL</small><b>{displaySimulationTime(data.timestamp)}</b></span>
        </div>
        <button className="simulation-play" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause /> : <Play />}<span>{isPlaying ? "Jeda" : "Jalankan"}</span></button>
        <div className="simulation-speed"><span>Kecepatan</span>{([1, 5, 20] as const).map((value) => <button key={value} className={speed === value ? "active" : ""} onClick={() => setSpeed(value)}>{value}×</button>)}</div>
        <button className="simulation-reset" onClick={resetSimulation}><RotateCcw /> Reset model</button>
      </section>

      <section className="simulation-layout">
        <aside className="scenario-list">
          <header><span>01</span><div><h2>Pilih kondisi uji</h2><p>Satu skenario aktif untuk seluruh halaman.</p></div></header>
          <div>
            {scenarios.map(({ id, title, description, icon: Icon }) => (
              <button key={id} className={scenario === id ? "active" : ""} onClick={() => setScenario(id)}>
                <Icon /><span><b>{title}</b><small>{description}</small></span><i />
              </button>
            ))}
          </div>
        </aside>

        <article className="simulation-observation">
          <header><span>02</span><div><h2>Amati respons sistem</h2><p>Empat sinyal utama memperlihatkan hubungan sebab-akibat.</p></div></header>
          <div className="simulation-primary-reading">
            <span>STATUS SISTEM</span>
            <b className={`status-${data.systemStatus}`}>{data.systemStatus === "normal" ? "Operasi stabil" : data.systemStatus === "critical" ? "Interlock aktif" : "Perlu perhatian"}</b>
            <p>{data.alerts[0]?.detail ?? "Kebutuhan air, produksi surya, dan kapasitas tandon berada dalam batas model."}</p>
          </div>
          <div className="simulation-signal-grid">
            <div><Sun /><span><small>PLTS</small><b>{data.energy.pvPowerKw} kW</b><em>{data.weather.irradianceWm2} W/m²</em></span></div>
            <div><Gauge /><span><small>Pompa</small><b>{data.energy.pumpPowerKw} kW</b><em>{data.energy.gridPowerKw > 0 ? `${data.energy.gridPowerKw} kW dari PLN` : "Tanpa bantuan PLN"}</em></span></div>
            <div><Droplets /><span><small>Tandon</small><b>{data.water.tankLevelPercent}%</b><em>{data.water.tankVolumeM3} m³ tersedia</em></span></div>
            <div><Leaf /><span><small>Zona aktif</small><b>{inputs.activeZoneIds.length}</b><em>{inputs.activeZoneIds.join(", ") || "Belum ada irigasi"}</em></span></div>
          </div>
          <div className="zone-response-table">
            {data.zones.map((zone) => <div key={zone.id}><span><b>{zone.id}</b><small>{zone.crop}</small></span><span><small>{zone.crop === "Padi" ? "Muka air" : "Kelembapan"}</small><b>{zone.crop === "Padi" ? `${zone.fieldWaterLevelCm} cm` : `${zone.soilMoisturePercent}%`}</b></span><span><small>Kebutuhan</small><b>{zone.demandPercent}%</b></span></div>)}
          </div>
        </article>
      </section>

      <section className="simulation-parameters">
        <header><span>03</span><div><h2>Atur asumsi model</h2><p>Parameter inti ditampilkan tanpa menyamarkan batasan simulasi.</p></div></header>
        <div className="simulation-parameter-grid">
          <RangeField label="Waktu" value={inputs.clockHour} min={0} max={23.75} step={0.25} unit="jam" onChange={(value) => updateInput("clockHour", value)} />
          <RangeField label="Skala iradiasi" value={inputs.irradianceScalePercent} min={20} max={120} step={5} unit="%" onChange={(value) => updateInput("irradianceScalePercent", value)} />
          <RangeField label="Level awal tandon" value={inputs.tankStartPercent} min={10} max={95} step={1} unit="%" onChange={(value) => updateInput("tankStartPercent", value)} />
          <RangeField label="Kebutuhan irigasi" value={inputs.irrigationDemandPercent} min={20} max={100} step={2} unit="%" onChange={(value) => updateInput("irrigationDemandPercent", value)} />
          <RangeField label="Luas lahan" value={inputs.landAreaHa} min={0.5} max={20} step={0.5} unit="ha" onChange={(value) => updateInput("landAreaHa", value)} />
          <RangeField label="Head total" value={inputs.totalHeadM} min={8} max={60} step={1} unit="m" onChange={(value) => updateInput("totalHeadM", value)} />
          <label className="simulation-seed"><span>Random seed</span><input type="number" value={inputs.randomSeed} onChange={(event) => updateInput("randomSeed", Number(event.target.value) || 1)} /><small>Gunakan seed yang sama agar hasil dapat direplikasi.</small></label>
          <label className="simulation-grid-switch"><input type="checkbox" checked={inputs.gridAvailable} onChange={(event) => updateInput("gridAvailable", event.target.checked)} /><span><b>PLN tersedia</b><small>Izinkan grid assist ketika kebutuhan tidak dapat ditunda.</small></span><i /></label>
        </div>
      </section>

      <section className="simulation-evidence-grid">
        <article className="model-notes">
          <header><ShieldCheck /><div><span>MODEL CARD</span><h2>{data.model.name}</h2></div></header>
          <dl><div><dt>Resolusi waktu</dt><dd>{data.model.timeStepMinutes} menit</dd></div><div><dt>Step aktif</dt><dd>{data.model.simulationStep}</dd></div><div><dt>Seed</dt><dd>{data.model.randomSeed}</dd></div><div><dt>Sumber</dt><dd>Aturan fisik + asumsi</dd></div></dl>
          <ul>{data.model.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        </article>
        <article className="dataset-export">
          <header><FileSpreadsheet /><div><span>DATASET</span><h2>Ekspor data sintetis</h2></div></header>
          <p>Setiap baris mewakili interval 15 menit dan memuat cuaca, energi, air, kualitas air, serta kondisi tiga zona.</p>
          <div>{[7, 30, 90].map((days) => <button key={days} onClick={() => exportDataset(days)}><Download /><span><b>{days} hari</b><small>{days * 96} baris CSV</small></span></button>)}</div>
          <small>Riwayat perintah sesi: {commandHistory.length} · Format UTF-8 CSV</small>
        </article>
      </section>
    </div>
  );
}

function RangeField({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return <label className="simulation-range"><span>{label}<b>{value} {unit}</b></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
