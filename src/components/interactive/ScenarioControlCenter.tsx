import { BookmarkPlus, CloudRain, CloudSun, Pause, Play, RotateCcw, Save, Sun, Zap } from "lucide-react";
import { useSystem } from "../../contexts/SystemContext";
import type { TelemetrySnapshot, WeatherPreset } from "../../domain/types";
import { DataBadge } from "../common/DataBadge";

const weatherOptions: Array<{ id: WeatherPreset; label: string; icon: typeof Sun }> = [
  { id: "clear", label: "Cerah", icon: Sun }, { id: "cloudy", label: "Berawan", icon: CloudSun },
  { id: "rain", label: "Hujan", icon: CloudRain }, { id: "variable", label: "Fluktuatif", icon: Zap },
];

export function ScenarioControlCenter({ data }: { data: TelemetrySnapshot }) {
  const { inputs, updateInput, isPlaying, setIsPlaying, speed, setSpeed, resetSimulation, saveScenario, savedScenarios, clearSavedScenarios } = useSystem();
  const timeLabel = `${String(Math.floor(inputs.clockHour)).padStart(2, "0")}:${inputs.clockHour % 1 >= 0.5 ? "30" : "00"}`;
  const save = () => saveScenario({
    name: `Skenario ${savedScenarios.length + 1} · ${timeLabel}`,
    outputs: {
      solarFractionPercent: data.energy.solarFractionPercent,
      tankLevelPercent: data.water.tankLevelPercent,
      annualCostIdr: data.economics.hybridAnnualCostIdr,
      annualEmissionsKg: data.environment.hybridEmissionKgYear,
    },
  });
  return (
    <section className="control-center">
      <div className="control-center__header"><div><span>INTERACTIVE SIMULATION LAB</span><h2>Scenario Control Center</h2><p>Ubah input, jalankan waktu, dan amati seluruh halaman memperbarui hasil yang sama.</p></div><DataBadge source="SIMULATION" /></div>
      <div className="control-center__body">
        <div className="time-console">
          <div className="clock-readout"><span>SIMULATION TIME</span><b>{timeLabel}</b><small>{inputs.clockHour >= 6 && inputs.clockHour <= 18 ? "Daylight window" : "Night operation"}</small></div>
          <button className="play-button" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause /> : <Play />}<span>{isPlaying ? "Pause" : "Play"}</span></button>
          <div className="speed-control"><span>Kecepatan</span>{([1, 5, 20] as const).map((item) => <button key={item} className={speed === item ? "active" : ""} onClick={() => setSpeed(item)}>{item}×</button>)}</div>
        </div>
        <div className="control-fields">
          <RangeControl label="Waktu" value={inputs.clockHour} min={0} max={23.5} step={0.5} unit="h" onChange={(value) => updateInput("clockHour", value)} />
          <RangeControl label="Intensitas matahari" value={inputs.irradianceScalePercent} min={20} max={120} step={5} unit="%" onChange={(value) => updateInput("irradianceScalePercent", value)} />
          <RangeControl label="Level awal tandon" value={inputs.tankStartPercent} min={10} max={95} step={1} unit="%" onChange={(value) => updateInput("tankStartPercent", value)} />
          <RangeControl label="Kebutuhan irigasi" value={inputs.irrigationDemandPercent} min={20} max={100} step={2} unit="%" onChange={(value) => updateInput("irrigationDemandPercent", value)} />
          <RangeControl label="Luas lahan" value={inputs.landAreaHa} min={0.5} max={20} step={0.5} unit="ha" onChange={(value) => updateInput("landAreaHa", value)} />
          <RangeControl label="Total dynamic head" value={inputs.totalHeadM} min={8} max={60} step={1} unit="m" onChange={(value) => updateInput("totalHeadM", value)} />
        </div>
        <div className="weather-console"><span>PRESET CUACA</span><div>{weatherOptions.map(({ id, label, icon: Icon }) => <button key={id} className={inputs.weather === id ? "active" : ""} onClick={() => updateInput("weather", id)}><Icon /><small>{label}</small></button>)}</div><label className="grid-switch"><input type="checkbox" checked={inputs.gridAvailable} onChange={(event) => updateInput("gridAvailable", event.target.checked)} /><i /><span><b>PLN tersedia</b><small>{inputs.gridAvailable ? "Grid assist diizinkan" : "Mode islanded simulasi"}</small></span></label></div>
      </div>
      <div className="control-center__footer"><div className="live-outcomes"><span><b>{data.weather.irradianceWm2}</b> W/m²</span><span><b>{data.energy.pvPowerKw}</b> kW PLTS</span><span><b>{data.energy.gridPowerKw}</b> kW PLN</span><span><b>{data.water.tankLevelPercent}</b>% tandon</span></div><div className="button-row"><button className="button button--secondary" onClick={resetSimulation}><RotateCcw />Reset</button><button className="button button--primary" onClick={save}><Save />Simpan skenario</button></div></div>
      {savedScenarios.length > 0 && <div className="scenario-comparison"><div className="scenario-comparison__heading"><span><BookmarkPlus />PERBANDINGAN TERSIMPAN</span><button onClick={clearSavedScenarios}>Hapus semua</button></div><div className="scenario-comparison__grid">{savedScenarios.map((record) => <article key={record.id}><b>{record.name}</b><span>{record.inputs.landAreaHa} ha · {record.inputs.weather}</span><dl><div><dt>Solar</dt><dd>{record.outputs.solarFractionPercent}%</dd></div><div><dt>Tandon</dt><dd>{record.outputs.tankLevelPercent}%</dd></div><div><dt>OPEX</dt><dd>Rp{Math.round(record.outputs.annualCostIdr / 1_000_000)} jt</dd></div><div><dt>Emisi</dt><dd>{Math.round(record.outputs.annualEmissionsKg)} kg</dd></div></dl></article>)}</div></div>}
    </section>
  );
}

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return <label className="range-control"><span>{label}<b>{value} {unit}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><i style={{ width: `${(value - min) / (max - min) * 100}%` }} /></label>;
}
