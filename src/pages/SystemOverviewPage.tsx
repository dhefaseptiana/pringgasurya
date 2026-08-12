import { Database, Factory, Layers3, RadioTower, Server, ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { StatusBadge } from "../components/common/StatusBadge";
import { InteractiveSystemExplorer } from "../components/interactive/InteractiveSystemExplorer";
import { PageContinuation } from "../components/navigation/ProjectJourney";
import { sensorCatalog } from "../domain/sensors";
import { useTelemetry } from "../hooks/useTelemetry";

const layers = [
  { icon: Factory, title: "Physical", detail: "PLTS, PLN, panel/VFD, pompa, tandon, pipa, dan katup." },
  { icon: ShieldCheck, title: "Edge & safety", detail: "Sensor terisolasi, RTU ESP32 industri, interlock, dan fallback lokal." },
  { icon: RadioTower, title: "Communication", detail: "RS485/4–20 mA ke node; LoRa atau Wi-Fi menuju gateway." },
  { icon: Server, title: "Data & application", detail: "MQTT ke backend, validasi, penyimpanan, API, dan event stream." },
  { icon: Database, title: "Presentation", detail: "Dashboard operasi, analisis, perencanaan, dan riset." },
];

export function SystemOverviewPage() {
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menyiapkan arsitektur simulasi…</div>;
  return (
    <div className="project-page project-page--system">
      <PageHeader eyebrow="SYSTEM OVERVIEW" title="Satu sistem dari panel hingga keputusan" description="Arsitektur PRINGGASURYA memisahkan proteksi lapangan, komunikasi, layanan data, dan antarmuka pengguna agar aman dikembangkan menuju pilot nyata." />
      <section className="status-ribbon"><div><span>Status sistem</span><StatusBadge status={data.systemStatus} /></div><div><span>Strategi energi</span><b>Solar-first, grid-assisted</b></div><div><span>Buffer operasi</span><b>Tandon air · {data.water.tankLevelPercent}%</b></div><div><span>Unit</span><b>Pilot Unit 01</b></div></section>
      <section className="panel-block"><SectionHeading kicker="INTERACTIVE SYSTEM EXPLORER" title="Klik komponen dan ikuti alirannya" description="Garis bergerak mengikuti daya dan debit pada skenario aktif. Pilih setiap komponen untuk melihat sensor, logika, dan proteksi lapangannya." /><InteractiveSystemExplorer data={data} /><div className="engineering-note"><DropletNote /></div></section>
      <section className="panel-block"><SectionHeading kicker="SYSTEM LAYERS" title="Lima lapisan yang dapat dikembangkan bertahap" /><div className="layer-grid">{layers.map(({ icon: Icon, title, detail }, index) => <article key={title}><span>0{index + 1}</span><Icon /><h3>{title}</h3><p>{detail}</p></article>)}</div></section>
      <section className="panel-block"><SectionHeading kicker="FIELD INSTRUMENTATION" title="Sensor dan perangkat yang perlu dihubungkan" description="Tipe berikut adalah rekomendasi teknis awal. Merek, range, dan material wetted parts ditentukan setelah survei lokasi." /><div className="table-scroll"><table className="data-table"><thead><tr><th>Kode</th><th>Parameter</th><th>Jenis yang disarankan</th><th>Sinyal</th><th>Penempatan</th><th>Peran</th><th>Prioritas</th></tr></thead><tbody>{sensorCatalog.map((sensor) => <tr key={sensor.code}><td><code>{sensor.code}</code></td><td><b>{sensor.measurement}</b></td><td>{sensor.recommendedType}</td><td>{sensor.signal}</td><td>{sensor.placement}</td><td>{sensor.role}</td><td><span className={`priority priority--${sensor.priority.toLowerCase()}`}>{sensor.priority}</span></td></tr>)}</tbody></table></div></section>
      <PageContinuation current="system" />
    </div>
  );
}

function DropletNote() {
  return <><Layers3 /><div><b>Instead of storing electricity, we store water.</b><p>Baterai kecil/UPS hanya menopang sensor, kontroler, dan komunikasi. Beban pompa besar menggunakan PLTS secara langsung dengan bantuan PLN saat diperlukan.</p></div></>;
}
