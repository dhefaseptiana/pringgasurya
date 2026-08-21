import { Activity, Droplets, Gauge, Waves } from "lucide-react";
import { OperationsChart } from "../components/charts/OperationsChart";
import { MetricCard } from "../components/common/MetricCard";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { monitoringTabs, SectionTabs } from "../components/navigation/SectionTabs";
import { useSystem } from "../contexts/SystemContext";
import { useTelemetry } from "../hooks/useTelemetry";

export function WaterManagementPage() {
  const { inputs } = useSystem();
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menghitung neraca air simulasi…</div>;
  return (
    <>
      <SectionTabs label="Navigasi monitoring" items={monitoringTabs} />
      <PageHeader eyebrow="OPERATE · WATER MANAGEMENT" title="Air adalah penyimpanan energi sistem" description="Tandon memisahkan waktu pemompaan dari waktu irigasi, sehingga energi surya dapat digunakan ketika tersedia tanpa baterai pompa berkapasitas besar." />
      <section className="water-overview">
        <article className="tank-panel">
          <div className="tank-graphic"><div className="tank-water" style={{ height: `${data.water.tankLevelPercent}%` }} /><span>{data.water.tankLevelPercent}%</span></div>
          <div><span>OPERATING STORAGE</span><h2>{data.water.tankVolumeM3} m³</h2><p>dari kapasitas skenario {inputs.tankCapacityM3} m³</p><div className="range-key"><i /><span>Minimum operasi 25%</span><b>Target 80%</b></div></div>
        </article>
        <div className="water-side-metrics"><MetricCard icon={Activity} label="Debit pengisian" value={data.water.flowLps} unit="L/s" meta="Flow meter FM-01" tone="water" /><MetricCard icon={Gauge} label="Tekanan" value={data.water.pressureBar} unit="bar" meta="Pressure transmitter PT-01" /><MetricCard icon={Waves} label="Muka air padi" value={data.water.fieldWaterLevelCm} unit="cm" meta="Hydrostatic level WL-01" tone="agriculture" /></div>
      </section>
      <section className="two-column-layout"><article className="panel-block"><SectionHeading kicker="SIMULATED TREND" title="Level tandon dan debit" /><OperationsChart data={data.history} mode="water" /></article><article className="panel-block"><SectionHeading kicker="CONTROL BOUNDARIES" title="Logika pengelolaan air" /><div className="rule-list"><div><span>01</span><p><b>Isi tandon</b> ketika PLTS tersedia dan level di bawah target.</p></div><div><span>02</span><p><b>Hentikan pompa</b> pada batas maksimum atau interlock keselamatan.</p></div><div><span>03</span><p><b>Distribusikan air</b> berdasarkan kebutuhan zona dan persediaan minimum.</p></div><div><span>04</span><p><b>Minta bantuan PLN</b> hanya ketika kebutuhan mendesak tidak dapat ditunda.</p></div></div></article></section>
      <section className="instrument-note"><Droplets /><div><b>Sensor esensial jalur air</b><p>TL-01 ultrasonic level, FS-01 float switch independen, FM-01 electromagnetic flow meter, dan PT-01 pressure transmitter. Semua input menuju RTU melalui RS485 atau I/O terisolasi.</p></div></section>
    </>
  );
}
