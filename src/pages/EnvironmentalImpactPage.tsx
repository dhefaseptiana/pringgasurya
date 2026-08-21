import { Droplets, LandPlot, Leaf, PanelTop, ThermometerSun, Trees } from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { MetricCard } from "../components/common/MetricCard";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageContinuation } from "../components/navigation/ProjectJourney";
import { analysisTabs, SectionTabs } from "../components/navigation/SectionTabs";
import { useSystem } from "../contexts/SystemContext";
import { calculateAgrivoltaic } from "../domain/calculations";
import type { AgrivoltaicLayout } from "../domain/types";
import { useTelemetry } from "../hooks/useTelemetry";

const layouts: Array<{ id: AgrivoltaicLayout; label: string; note: string }> = [
  { id: "open-field", label: "Open field", note: "Tanpa panel pada lahan" },
  { id: "reservoir", label: "Panel di tandon", note: "Prioritas permukaan air" },
  { id: "canal", label: "Panel di saluran", note: "Lindungi koridor air" },
  { id: "partial-shade", label: "Naungan parsial", note: "Pangan + energi di lahan" },
];

export function EnvironmentalImpactPage() {
  const { inputs, updateInput } = useSystem();
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menghitung dampak proyeksi…</div>;
  const agri = calculateAgrivoltaic(inputs);
  const maxEmission = Math.max(data.environment.dieselEmissionKgYear, data.environment.gridEmissionKgYear, data.environment.hybridEmissionKgYear);
  return (
    <div className="project-page project-page--impact">
      <SectionTabs label="Navigasi analisis" items={analysisTabs} />
      <PageHeader eyebrow="ANALYZE · ENVIRONMENTAL IMPACT" title="Uji trade-off agrivoltaik secara langsung" description="Pilih lokasi panel dan tingkat naungan untuk membandingkan suhu mikro, evaporasi, cahaya tanaman, pemanfaatan lahan, dan emisi energi." source="PROJECTED" />
      <section className="control-warning"><Leaf /><div><b>PROJECTED IMPACT</b><p>Angka merupakan model skenario untuk eksplorasi. Dampak hasil tanaman dan evaporasi harus divalidasi melalui petak kontrol satu musim.</p></div><DataBadge source="PROJECTED" /></section>
      <section className="agrivoltaic-lab">
        <div className="agrivoltaic-controls"><span>AGRIVOLTAIC COMPARISON LAB</span><h2>Di mana panel ditempatkan?</h2><div className="layout-options">{layouts.map((layout) => <button key={layout.id} className={inputs.agrivoltaicLayout === layout.id ? "active" : ""} onClick={() => updateInput("agrivoltaicLayout", layout.id)}><PanelTop /><span><b>{layout.label}</b><small>{layout.note}</small></span></button>)}</div><label className={`range-control shade-control ${inputs.agrivoltaicLayout !== "partial-shade" ? "is-disabled" : ""}`}><span>Tingkat naungan<b>{inputs.agrivoltaicLayout === "partial-shade" ? inputs.shadePercent : agri.effectiveShade}%</b></span><input aria-label="Tingkat naungan" type="range" min="5" max="40" step="1" value={inputs.shadePercent} disabled={inputs.agrivoltaicLayout !== "partial-shade"} onChange={(event) => updateInput("shadePercent", Number(event.target.value))} /><i style={{ width: `${inputs.shadePercent / 40 * 100}%` }} /></label><p>Untuk padi, naungan tinggi tidak otomatis lebih baik. Model menandai berkurangnya cahaya sebagai trade-off yang harus diuji.</p></div>
        <div className={`agrivoltaic-visual layout-${inputs.agrivoltaicLayout}`}><div className="av-sun"><ThermometerSun /><span>{data.weather.irradianceWm2} W/m²</span></div><div className="av-panels">{Array.from({ length: inputs.agrivoltaicLayout === "open-field" ? 0 : 5 }, (_, index) => <i key={index} />)}</div><div className="av-crops">{Array.from({ length: 11 }, (_, index) => <SproutGlyph key={index} />)}</div><div className="av-soil"><span>Open field reference</span><b>{inputs.agrivoltaicLayout === "partial-shade" ? `${inputs.shadePercent}% partial shade` : layouts.find((item) => item.id === inputs.agrivoltaicLayout)?.label}</b></div><div className="av-temperature"><span>Ambient {data.weather.ambientTemperatureC}°C</span><b>Under panel {data.weather.underPanelTemperatureC}°C</b></div></div>
      </section>
      <section className="metric-grid"><MetricCard icon={ThermometerSun} label="Pendinginan mikro" value={agri.coolingC} unit="°C" meta="Proyeksi terhadap open field" tone="solar" /><MetricCard icon={Droplets} label="Reduksi evaporasi" value={agri.evaporationReductionPercent} unit="%" meta="Model naungan awal" tone="water" /><MetricCard icon={Trees} label="Cahaya ke tanaman" value={agri.cropLightPercent} unit="%" meta="Relatif terhadap open field" tone="agriculture" /><MetricCard icon={LandPlot} label="Land equivalent ratio" value={agri.landEquivalentRatio} meta="Pangan + energi per lahan" /></section>
      <section className="two-column-layout"><article className="panel-block"><SectionHeading kicker="ANNUAL EMISSION MODEL" title="Perbandingan emisi energi" /><div className="emission-bars"><EmissionBar label="Diesel" value={data.environment.dieselEmissionKgYear} max={maxEmission} tone="diesel" /><EmissionBar label="PLN penuh" value={data.environment.gridEmissionKgYear} max={maxEmission} tone="grid" /><EmissionBar label="PRINGGASURYA" value={data.environment.hybridEmissionKgYear} max={maxEmission} tone="hybrid" /></div></article><article className="panel-block impact-result"><SectionHeading kicker="AVOIDED EMISSION" title="Dampak skenario aktif" /><Leaf /><b>{Math.round(data.environment.avoidedEmissionKgYear).toLocaleString("id-ID")} kg CO₂e/tahun</b><p>Dihindari terhadap diesel berdasarkan faktor model. Nilai final menunggu faktor emisi dan jam operasi tervalidasi.</p></article></section>
      <PageContinuation current="impact" />
    </div>
  );
}

function SproutGlyph() { return <span><i /><i /><i /></span>; }
function EmissionBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) { return <div className="emission-bar"><span>{label}</span><div><i className={`bar-${tone}`} style={{ width: `${value / max * 100}%` }} /></div><b>{Math.round(value).toLocaleString("id-ID")} kg</b></div>; }
