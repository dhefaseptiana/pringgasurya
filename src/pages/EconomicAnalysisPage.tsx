import { Banknote, BatteryCharging, Droplets, Fuel, PlugZap, Sun } from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { PageContinuation } from "../components/navigation/ProjectJourney";
import { useSystem } from "../contexts/SystemContext";
import { useTelemetry } from "../hooks/useTelemetry";

const idr = (value: number) => `Rp${Math.round(value / 1_000_000).toLocaleString("id-ID")} jt`;

export function EconomicAnalysisPage() {
  const { inputs, updateInput } = useSystem();
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menghitung kelayakan ekonomi…</div>;
  const alternatives = [
    { icon: Fuel, label: "Diesel", cost: data.economics.dieselAnnualCostIdr, detail: "Fuel + maintenance", tone: "diesel" },
    { icon: PlugZap, label: "PLN", cost: data.economics.gridAnnualCostIdr, detail: "Grid energy + service", tone: "grid" },
    { icon: BatteryCharging, label: "PLTS + baterai", cost: data.economics.batteryAnnualizedCostIdr, detail: "Annualized battery", tone: "battery" },
    { icon: Sun, label: "PLTS + PLN + tandon", cost: data.economics.hybridAnnualCostIdr, detail: "PRINGGASURYA", tone: "hybrid" },
  ];
  const maxCost = Math.max(...alternatives.map((item) => item.cost));
  return (
    <div className="project-page project-page--feasibility">
      <PageHeader eyebrow="ANALYZE · ECONOMIC ANALYSIS" title="Ubah asumsi dan lihat biaya berpindah" description="Kalkulator membandingkan diesel, PLN, PLTS dengan baterai besar, dan PRINGGASURYA berbasis tandon untuk skenario aktif." source="PROJECTED" />
      <section className="economic-lab">
        <div className="economic-inputs"><div className="economic-inputs__heading"><DataBadge source="PROJECTED" /><h2>Feasibility calculator</h2><p>Geser asumsi desain. Nilai pada seluruh aplikasi akan diperbarui.</p></div><div className="economic-control-grid"><Range label="Luas lahan" value={inputs.landAreaHa} min={0.5} max={20} step={0.5} unit="ha" onChange={(v) => updateInput("landAreaHa", v)} /><Range label="Total head" value={inputs.totalHeadM} min={8} max={60} step={1} unit="m" onChange={(v) => updateInput("totalHeadM", v)} /><Range label="Kapasitas PLTS" value={inputs.pvCapacityKw} min={1} max={45} step={0.5} unit="kWp" onChange={(v) => updateInput("pvCapacityKw", v)} /><Range label="Kapasitas tandon" value={inputs.tankCapacityM3} min={5} max={300} step={5} unit="m³" onChange={(v) => updateInput("tankCapacityM3", v)} /><Range label="Harga diesel" value={inputs.dieselPriceIdrL} min={7000} max={18000} step={500} unit="Rp/L" onChange={(v) => updateInput("dieselPriceIdrL", v)} /><Range label="Tarif PLN" value={inputs.gridTariffIdrKwh} min={1000} max={2500} step={25} unit="Rp/kWh" onChange={(v) => updateInput("gridTariffIdrKwh", v)} /></div></div>
        <div className="economic-outcome"><span>ACTIVE CONFIGURATION</span><h3>{inputs.landAreaHa} ha · {inputs.pvCapacityKw} kWp</h3><div className="economic-key"><Banknote /><div><span>Estimasi CAPEX hibrida</span><b>{idr(data.economics.hybridCapexIdr)}</b></div></div><div className="economic-key"><Droplets /><div><span>Biaya air</span><b>Rp{data.economics.waterCostIdrM3.toLocaleString("id-ID")}/m³</b></div></div><div className="economic-key"><Sun /><div><span>Simple payback vs diesel</span><b>{data.economics.simplePaybackYears} tahun</b></div></div><p>CAPEX dan harga komponen adalah skenario awal. Belum termasuk seluruh detail konstruksi, pajak, pembiayaan, dan kontingensi.</p></div>
      </section>
      <section className="panel-block"><SectionHeading kicker="ANNUAL COST COMPARISON" title="Biaya tahunan ekuivalen" description="Semakin pendek bar, semakin rendah biaya pada asumsi aktif." /><div className="cost-comparison">{alternatives.map(({ icon: Icon, label, cost, detail, tone }) => <article key={label} className={`cost-row cost-row--${tone}`}><Icon /><div><span>{label}<small>{detail}</small></span><div className="cost-track"><i style={{ width: `${cost / maxCost * 100}%` }} /></div></div><b>{idr(cost)}</b></article>)}</div></section>
      <section className="economic-summary"><article><span>Penghematan vs diesel</span><b>{idr(Math.max(0, data.economics.dieselAnnualCostIdr - data.economics.hybridAnnualCostIdr))}/tahun</b></article><article><span>Solar fraction</span><b>{data.energy.solarFractionPercent}%</b></article><article><span>Emisi terhindari</span><b>{Math.round(data.environment.avoidedEmissionKgYear).toLocaleString("id-ID")} kg CO₂e</b></article></section>
      <PageContinuation current="feasibility" />
    </div>
  );
}

function Range({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) { return <label className="range-control"><span>{label}<b>{value.toLocaleString("id-ID")} {unit}</b></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><i style={{ width: `${(value - min) / (max - min) * 100}%` }} /></label>; }
