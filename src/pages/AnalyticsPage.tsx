import { Droplets, Gauge, Leaf, Sun } from "lucide-react";
import { OperationsChart } from "../components/charts/OperationsChart";
import { DataBadge } from "../components/common/DataBadge";
import { MetricCard } from "../components/common/MetricCard";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { useTelemetry } from "../hooks/useTelemetry";

export function AnalyticsPage() {
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menyusun analitik simulasi…</div>;
  const totalWater = data.history.reduce((total, point) => total + point.flowLps * 3.6, 0);
  const solarEnergy = data.history.reduce((total, point) => total + point.pvKw, 0);
  return (
    <>
      <PageHeader eyebrow="ANALYZE · ANALYTICS" title="Menghubungkan energi, air, dan operasi" description="Analitik fase ini dihitung dari rangkaian data simulasi 12 jam dan belum disimpan sebagai historical dataset." source="HISTORICAL" />
      <section className="provenance-banner"><DataBadge source="SIMULATION" /><p><b>Simulated historical window.</b> Grafik tidak berasal dari database atau sensor nyata. Refresh halaman menghasilkan kembali rangkaian skenario.</p></section>
      <section className="metric-grid"><MetricCard icon={Sun} label="Energi surya terhitung" value={solarEnergy.toFixed(1)} unit="kWh*" meta="Penjumlahan titik simulasi" tone="solar" /><MetricCard icon={Droplets} label="Volume teralirkan" value={totalWater.toFixed(1)} unit="m³*" meta="Estimasi dari debit per interval" tone="water" /><MetricCard icon={Gauge} label="Solar fraction aktif" value={data.energy.solarFractionPercent} unit="%" meta="Kondisi saat ini" /><MetricCard icon={Leaf} label="Emisi terhindarkan" value="MODEL" meta="Memerlukan faktor emisi tervalidasi" tone="agriculture" /></section>
      <section className="two-column-layout two-column-layout--wide"><article className="panel-block"><SectionHeading kicker="ENERGY PROFILE" title="Kesesuaian produksi dan beban" /><OperationsChart data={data.history} /></article><article className="panel-block"><SectionHeading kicker="MODEL INSIGHT" title="Apa yang dapat diuji" /><div className="insight-list"><article><span>01</span><p><b>Solar matching</b>Bandingkan jam pompa dengan produksi PLTS.</p></article><article><span>02</span><p><b>Water buffering</b>Ukur apakah tandon menunda kebutuhan bantuan PLN.</p></article><article><span>03</span><p><b>Crop response</b>Bandingkan air, mikroklimat, dan hasil dengan petak kontrol.</p></article></div></article></section>
      <section className="panel-block"><SectionHeading kicker="DATA PROVENANCE" title="Pisahkan fakta, pembacaan, dan proyeksi" /><div className="table-scroll"><table className="data-table"><thead><tr><th>Kategori</th><th>Digunakan untuk</th><th>Status fase ini</th><th>Aturan tampilan</th></tr></thead><tbody><tr><td><DataBadge source="LIVE" compact /></td><td>Telemetry perangkat nyata</td><td>Belum dikonfigurasi</td><td>Tidak boleh fallback otomatis ke simulasi</td></tr><tr><td><DataBadge source="HISTORICAL" compact /></td><td>Tren tersimpan dan perbandingan periode</td><td>Simulated window saja</td><td>Selalu tampilkan rentang waktu dan sumber</td></tr><tr><td><DataBadge source="RESEARCH" compact /></td><td>Konteks lokasi dan asumsi ilmiah</td><td>Disiapkan pada modul Research</td><td>Sertakan sitasi dan tahun</td></tr><tr><td><DataBadge source="SIMULATION" compact /></td><td>Demo antarmuka dan skenario gangguan</td><td>Aktif</td><td>Garis putus dan label permanen</td></tr></tbody></table></div></section>
    </>
  );
}
