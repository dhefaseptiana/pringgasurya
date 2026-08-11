import { useEffect, useMemo, useState } from "react";

type Tab = "ringkasan" | "irigasi" | "energi" | "sensor" | "riwayat";
type Crop = "Padi" | "Hortikultura" | "Palawija";

type SensorSpec = {
  id: string;
  code: string;
  name: string;
  type: string;
  priority: "Wajib" | "Disarankan" | "Opsional" | "Aktuator";
  signal: string;
  location: string;
  purpose: string;
  connection: string;
  interval: string;
  maintenance: string;
  crops: Crop[];
};

const navItems: { id: Tab; label: string; short: string }[] = [
  { id: "ringkasan", label: "Ringkasan", short: "R" },
  { id: "irigasi", label: "Irigasi & Zona", short: "I" },
  { id: "energi", label: "Energi", short: "E" },
  { id: "sensor", label: "Sensor & Integrasi", short: "S" },
  { id: "riwayat", label: "Riwayat Data", short: "D" },
];

const sensorSpecs: SensorSpec[] = [
  {
    id: "rice-level",
    code: "WL-01",
    name: "Tinggi muka air sawah",
    type: "Vented hydrostatic level transmitter 0–1 m, IP68",
    priority: "Wajib",
    signal: "4–20 mA",
    location: "Di dalam tabung AWD berlubang pada petak representatif",
    purpose: "Membaca muka air di atas maupun di bawah permukaan tanah untuk logika AWD.",
    connection: "Probe → receiver 4–20 mA terisolasi → ADC industri → RTU ESP32",
    interval: "1–5 menit",
    maintenance: "Bersihkan sedimen bulanan; verifikasi nol dan span tiap musim.",
    crops: ["Padi"],
  },
  {
    id: "tank-level",
    code: "TL-01",
    name: "Ketinggian tandon/embung",
    type: "Ultrasonic level sensor IP67, 0,3–8 m",
    priority: "Wajib",
    signal: "RS485 Modbus atau 4–20 mA",
    location: "Di atas permukaan tandon, tegak lurus dan bebas halangan",
    purpose: "Mengubah tinggi air menjadi estimasi volume dan menentukan kapan pompa mengisi.",
    connection: "Sensor → bus RS485 berantai → RTU lokal; float switch dipasang sebagai proteksi terpisah",
    interval: "30–60 detik",
    maintenance: "Periksa kondensasi, sarang serangga, dan bandingkan dengan penggaris ukur tiap bulan.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "float-switch",
    code: "FS-01",
    name: "Saklar batas tandon",
    type: "Float switch high/low level, normally closed",
    priority: "Wajib",
    signal: "Digital dry contact",
    location: "Dua titik pada batas minimum dan maksimum tandon",
    purpose: "Proteksi independen ketika sensor utama atau komunikasi gagal.",
    connection: "Float switch → digital input optoisolasi → safety relay/VFD interlock",
    interval: "Kontinu",
    maintenance: "Uji gerak mekanis dan fungsi trip setiap bulan.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "flow",
    code: "FM-01",
    name: "Debit air utama",
    type: "Electromagnetic flow meter sesuai diameter pipa, IP67",
    priority: "Wajib",
    signal: "RS485 Modbus + pulse output",
    location: "Pipa lurus setelah pompa; minimal 5D upstream dan 3D downstream",
    purpose: "Menghitung volume air, mendeteksi dry-run, kebocoran, dan penurunan kinerja pompa.",
    connection: "Flow meter → RS485 RTU; pulse output → pencacah lokal sebagai redundansi",
    interval: "5–15 detik",
    maintenance: "Pastikan pipa selalu penuh; verifikasi terhadap uji volume tiap musim.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "pressure",
    code: "PT-01",
    name: "Tekanan discharge pompa",
    type: "Pressure transmitter 0–10 bar, G¼, IP67",
    priority: "Disarankan",
    signal: "4–20 mA",
    location: "Pipa keluar pompa sebelum manifold zona",
    purpose: "Mendeteksi sumbatan, kebocoran besar, dan operasi pompa di luar kurva aman.",
    connection: "Transmitter → 4–20 mA input terisolasi → RTU",
    interval: "5–15 detik",
    maintenance: "Pasang isolation valve; kalibrasi tahunan dengan pressure calibrator.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "soil",
    code: "SM-01",
    name: "Kelembapan tanah",
    type: "FDR/capacitive soil probe multi-depth, IP68",
    priority: "Wajib",
    signal: "RS485 Modbus",
    location: "Zona akar representatif pada dua kedalaman per zona",
    purpose: "Menentukan waktu irigasi hortikultura dan palawija berdasarkan volumetric water content.",
    connection: "Probe → node ESP32/RS485 → LoRa AS923 → gateway",
    interval: "5–15 menit",
    maintenance: "Kalibrasi terhadap jenis tanah lokal; hindari probe kapasitif murah tanpa sealing.",
    crops: ["Hortikultura", "Palawija"],
  },
  {
    id: "ph",
    code: "PH-01",
    name: "pH air irigasi",
    type: "Industrial immersion pH probe + replaceable transmitter",
    priority: "Disarankan",
    signal: "RS485 Modbus atau 4–20 mA",
    location: "Flow cell pada jalur sampling setelah pompa",
    purpose: "Peringatan awal perubahan keasaman; bukan pengganti uji laboratorium kontaminan.",
    connection: "Probe → transmitter pH → RS485 RTU",
    interval: "5 menit",
    maintenance: "Kalibrasi buffer pH 4 dan 7 tiap 2–4 minggu; simpan probe tetap basah.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "ec",
    code: "EC-01",
    name: "Konduktivitas/EC",
    type: "Conductivity sensor 0–20 mS/cm dengan kompensasi suhu",
    priority: "Disarankan",
    signal: "RS485 Modbus atau 4–20 mA",
    location: "Flow cell yang sama dengan pH, mudah dilepas untuk pembersihan",
    purpose: "Mengawasi salinitas dan konsentrasi ion; penting untuk fertigasi.",
    connection: "Probe EC → transmitter → RS485 RTU",
    interval: "5 menit",
    maintenance: "Bersihkan fouling; kalibrasi larutan standar tiap bulan.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "turbidity",
    code: "TU-01",
    name: "Kekeruhan air",
    type: "Optical turbidity sensor 0–1000 NTU, self-cleaning optional",
    priority: "Opsional",
    signal: "RS485 Modbus",
    location: "Bypass flow cell dengan aliran stabil",
    purpose: "Mendeteksi lonjakan sedimen yang dapat menyumbat irigasi tetes atau menunjukkan perubahan sumber.",
    connection: "Sensor → RS485 RTU; alarm mengunci fertigasi, bukan otomatis menolak seluruh air",
    interval: "5 menit",
    maintenance: "Bersihkan lensa mingguan pada air keruh; lakukan blank check.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "energy",
    code: "EM-01",
    name: "Energi pompa & PLN",
    type: "Multifunction energy meter 1/3 fasa + split-core CT",
    priority: "Wajib",
    signal: "RS485 Modbus",
    location: "Panel daya setelah MCB, dipisahkan dari rangkaian kontrol tegangan rendah",
    purpose: "Merekam tegangan, arus, daya, faktor daya, dan kWh dari jaringan.",
    connection: "CT + meter energi → RS485 panel → RTU/gateway",
    interval: "5–10 detik",
    maintenance: "Pemasangan oleh teknisi listrik; cek arah CT dan rasio tiap commissioning.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "pv",
    code: "PV-01",
    name: "Daya panel surya",
    type: "Data inverter/MPPT atau DC meter 0–100 V dengan shunt",
    priority: "Wajib",
    signal: "RS485 Modbus",
    location: "Dibaca dari inverter/VFD; DC meter hanya jika perangkat tidak menyediakan data",
    purpose: "Menghitung produksi surya, solar fraction, dan indikasi penurunan performa.",
    connection: "Inverter/MPPT → RS485 Modbus → gateway; hindari duplikasi sensor bila register tersedia",
    interval: "10–30 detik",
    maintenance: "Bandingkan energi harian dan inspeksi konektor/kebersihan modul tiap bulan.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "weather",
    code: "WX-01",
    name: "Cuaca mikro",
    type: "SHT35 dalam radiation shield + tipping bucket; pyranometer opsional",
    priority: "Opsional",
    signal: "RS485/SDI-12 atau digital pulse",
    location: "Tiang 2 m di area terbuka; sensor suhu tambahan di bawah panel dan petak kontrol",
    purpose: "Mendukung ET, mencatat hujan, dan menguji pengaruh agrivoltaik pada mikroklimat.",
    connection: "Weather node → LoRa AS923 → gateway; pyranometer 0–2000 W/m² melalui RS485",
    interval: "1–5 menit",
    maintenance: "Bersihkan rain gauge, cek level, dan bandingkan sensor suhu tiap musim.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
  {
    id: "valve",
    code: "MV-01",
    name: "Katup zona bermotor",
    type: "Motorized ball/butterfly valve dengan limit switch",
    priority: "Aktuator",
    signal: "24 VDC relay + open/close feedback",
    location: "Manifold setiap zona dalam box tahan cuaca",
    purpose: "Membuka aliran hanya ke zona yang meminta air dan mengonfirmasi posisi katup.",
    connection: "RTU relay optoisolasi → interposing relay → valve; limit switch → digital input",
    interval: "Sesuai perintah",
    maintenance: "Exercise valve mingguan; sediakan operasi manual saat daya gagal.",
    crops: ["Padi", "Hortikultura", "Palawija"],
  },
];

const historyData = [38, 42, 47, 44, 52, 61, 73, 86, 91, 88, 76, 64, 58, 49, 43, 37, 31, 26];

function MetricCard({ label, value, unit, meta, tone = "green", progress }: {
  label: string; value: string; unit: string; meta: string; tone?: "green" | "blue" | "amber"; progress?: number;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-top"><span>{label}</span><span className="metric-dot" /></div>
      <div className="metric-value">{value}<small>{unit}</small></div>
      {typeof progress === "number" && <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>}
      <p>{meta}</p>
    </article>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-heading">
      <div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>
      <div className="live-pill"><i /> Data demo bergerak</div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [crop, setCrop] = useState<Crop>("Padi");
  const [mode, setMode] = useState<"Otomatis" | "Manual">("Otomatis");
  const [pumpOn, setPumpOn] = useState(true);
  const [zones, setZones] = useState([true, false, false]);
  const [selectedSensor, setSelectedSensor] = useState<SensorSpec | null>(null);
  const [sensorFilter, setSensorFilter] = useState<"Semua" | SensorSpec["priority"]>("Semua");
  const [toast, setToast] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 3500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const live = useMemo(() => ({
    water: (4.7 + (tick % 4) * 0.08).toFixed(1),
    tank: 72 + (tick % 3),
    pv: (1.42 + (tick % 5) * 0.03).toFixed(2),
    flow: pumpOn ? (2.86 + (tick % 3) * 0.04).toFixed(1) : "0.0",
  }), [tick, pumpOn]);

  const filteredSensors = sensorSpecs.filter((sensor) =>
    (sensorFilter === "Semua" || sensor.priority === sensorFilter) && sensor.crops.includes(crop)
  );

  const notify = (message: string) => setToast(message);

  const toggleZone = (index: number) => {
    if (mode === "Otomatis") {
      notify("Aktifkan mode Manual untuk mengubah zona secara langsung.");
      return;
    }
    setZones((current) => current.map((value, idx) => idx === index ? !value : value));
    notify(`Perintah katup Zona ${index + 1} dikirim ke kontrol lokal.`);
  };

  const renderOverview = () => (
    <>
      <PageHeader eyebrow="Desa Sisik • Pringgarata" title="Air tersedia saat tanaman membutuhkan" description="Satu tampilan untuk air, energi, tanaman, dan kondisi perangkat." />
      <section className="hero-status">
        <div className="hero-main">
          <div className="status-kicker"><span>●</span> SISTEM NORMAL</div>
          <h2>Irigasi otomatis sedang aktif</h2>
          <p>Zona 1 menerima air dari tandon. Energi surya mencukupi sehingga PLN berada dalam posisi siaga.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setTab("irigasi")}>Kelola irigasi <span>→</span></button>
            <button className="quiet-btn" onClick={() => setTab("sensor")}>Lihat koneksi sensor</button>
          </div>
        </div>
        <div className="crop-card">
          <div className="crop-visual"><span>01</span><div className="rice-lines"><i /><i /><i /><i /></div></div>
          <p>Profil tanaman</p>
          <h3>{crop}</h3>
          <span>{crop === "Padi" ? "Vegetatif • hari ke-34" : crop === "Hortikultura" ? "Pertumbuhan • hari ke-21" : "Vegetatif • hari ke-27"}</span>
          <button onClick={() => setTab("irigasi")}>Ubah profil</button>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label={crop === "Padi" ? "Muka air sawah" : "Kelembapan tanah"} value={crop === "Padi" ? live.water : "32"} unit={crop === "Padi" ? "cm" : "% VWC"} meta={crop === "Padi" ? "Target aman 3–5 cm" : "Target profil 28–36%"} />
        <MetricCard label="Tandon operasional" value={String(live.tank)} unit="%" meta="±15,8 m³ tersisa" tone="blue" progress={live.tank} />
        <MetricCard label="Daya surya sekarang" value={live.pv} unit="kW" meta="85% beban pompa" tone="amber" />
        <MetricCard label="Debit menuju lahan" value={live.flow} unit="L/s" meta={pumpOn ? "Aliran stabil • Zona 1" : "Pompa sedang berhenti"} tone="blue" />
      </section>

      <section className="overview-grid">
        <article className="panel system-card">
          <div className="panel-heading"><div><p>ALUR LANGSUNG</p><h3>Status sistem terintegrasi</h3></div><button onClick={() => setTab("energi")}>Detail energi</button></div>
          <div className="system-flow">
            <div className="flow-node solar"><span>☀</span><b>PLTS</b><small>{live.pv} kW</small></div><i className="flow-arrow">→</i>
            <div className="flow-node"><span>↯</span><b>Panel daya</b><small>Surya utama</small></div><i className="flow-arrow">→</i>
            <div className={`flow-node ${pumpOn ? "active" : ""}`}><span>∿</span><b>Pompa</b><small>{pumpOn ? "Berjalan" : "Berhenti"}</small></div><i className="flow-arrow">→</i>
            <div className="flow-node water"><span>◒</span><b>Tandon</b><small>{live.tank}%</small></div><i className="flow-arrow">→</i>
            <div className="flow-node field"><span>≋</span><b>Zona 1</b><small>Terbuka</small></div>
          </div>
          <div className="flow-note"><span>PLN</span><p>Cadangan tersedia • tegangan 226 V • tidak digunakan</p><strong>SIAGA</strong></div>
        </article>

        <article className="panel energy-mix">
          <div className="panel-heading"><div><p>ENERGI HARI INI</p><h3>Mayoritas dari matahari</h3></div></div>
          <div className="energy-body">
            <div className="energy-ring"><div><b>85%</b><span>surya</span></div></div>
            <div className="energy-legend">
              <div><i className="solar-key"/><span>PLTS<b>6,4 kWh</b></span></div>
              <div><i className="grid-key"/><span>PLN<b>1,1 kWh</b></span></div>
            </div>
          </div>
          <div className="emission-save"><span>↓ 6,9 kg</span><p>CO₂e dihindari hari ini dibanding listrik jaringan penuh</p></div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel alert-panel">
          <div className="panel-heading"><div><p>PERLU DIPERHATIKAN</p><h3>Satu catatan pemeliharaan</h3></div><span className="count-badge">1</span></div>
          <div className="alert-item"><span>EC</span><div><b>Kalibrasi sensor EC jatuh tempo</b><p>Lakukan menggunakan larutan standar sebelum 16 Agustus.</p></div><button onClick={() => notify("Pengingat kalibrasi ditandai sudah dibaca.")}>Tandai</button></div>
        </article>
        <article className="panel forecast-panel">
          <div className="panel-heading"><div><p>REKOMENDASI SISTEM</p><h3>Rencana 6 jam ke depan</h3></div></div>
          <p>Radiasi diperkirakan memadai sampai 15.20. Isi tandon hingga 82%, kemudian hentikan pompa sebelum beban turun.</p>
          <div className="timeline"><span>09</span><i className="done"/><i className="done"/><i className="active"/><i/><i/><span>15</span></div>
        </article>
      </section>
    </>
  );

  const renderIrrigation = () => (
    <>
      <PageHeader eyebrow="Kontrol lokal tetap menjadi pengaman utama" title="Irigasi & zona tanaman" description="Atur profil tanaman, ambang irigasi, dan perintah manual yang tercatat." />
      <section className="control-layout">
        <article className="panel control-panel">
          <div className="panel-heading"><div><p>PROFIL AKTIF</p><h3>Logika tanaman</h3></div><span className="safe-badge">Tersimpan lokal</span></div>
          <div className="crop-switcher">
            {(["Padi", "Hortikultura", "Palawija"] as Crop[]).map((item) => <button key={item} className={crop === item ? "selected" : ""} onClick={() => { setCrop(item); notify(`Profil ${item} diaktifkan.`); }}>{item}<small>{item === "Padi" ? "Muka air + AWD" : item === "Hortikultura" ? "VWC + irigasi tetes" : "VWC + jadwal ET"}</small></button>)}
          </div>
          <div className="threshold-grid">
            <div><label>{crop === "Padi" ? "Batas atas muka air" : "Kelembapan target"}<b>{crop === "Padi" ? "5 cm" : crop === "Hortikultura" ? "36%" : "32%"}</b></label><input aria-label="Batas atas" type="range" min="1" max="10" defaultValue={crop === "Padi" ? 5 : 7}/></div>
            <div><label>{crop === "Padi" ? "Isi ulang AWD" : "Mulai irigasi"}<b>{crop === "Padi" ? "−15 cm" : crop === "Hortikultura" ? "28%" : "24%"}</b></label><input aria-label="Batas bawah" type="range" min="1" max="10" defaultValue="4"/></div>
            <div><label>Volume maksimum harian<b>87,5 m³</b></label><input aria-label="Volume maksimum" type="range" min="1" max="10" defaultValue="7"/></div>
          </div>
          <div className="logic-box"><span>IF</span><p>{crop === "Padi" ? "muka air ≤ ambang AWD" : "kelembapan tanah ≤ batas bawah"}</p><span>AND</span><p>tandon ≥ 25%</p><span>THEN</span><p>buka zona + validasi debit</p></div>
        </article>

        <aside className="panel mode-panel">
          <div className="panel-heading"><div><p>MODE OPERASI</p><h3>{mode}</h3></div></div>
          <div className="mode-toggle"><button className={mode === "Otomatis" ? "active" : ""} onClick={() => setMode("Otomatis")}>Otomatis</button><button className={mode === "Manual" ? "active" : ""} onClick={() => setMode("Manual")}>Manual</button></div>
          <p>{mode === "Otomatis" ? "Sistem menjalankan aturan tanaman dan proteksi lokal." : "Perintah langsung aktif selama 30 menit; proteksi dry-run tetap bekerja."}</p>
          <button className={`pump-control ${pumpOn ? "on" : ""}`} onClick={() => { if (mode === "Otomatis") { notify("Ubah ke mode Manual untuk mengendalikan pompa."); return; } setPumpOn(!pumpOn); notify(`Pompa ${pumpOn ? "dihentikan" : "dijalankan"}.`); }}><span>{pumpOn ? "∿" : "×"}</span><div><small>POMPA UTAMA</small><b>{pumpOn ? "Berjalan" : "Berhenti"}</b></div><i /></button>
          <small className="safety-note">Perintah dikirim ke RTU; kontaktor/VFD dan interlock tetap berada di panel lapangan.</small>
        </aside>
      </section>

      <section className="zone-grid">
        {[1,2,3].map((number, index) => <article className={`zone-card ${zones[index] ? "open" : ""}`} key={number}>
          <div className="zone-top"><span>Z{number}</span><div><p>ZONA {number}</p><h3>{number === 1 ? crop : number === 2 ? "Cabai" : "Jagung"}</h3></div><i /></div>
          <div className="zone-data"><span>{number === 1 && crop === "Padi" ? `${live.water} cm` : number === 2 ? "29% VWC" : "31% VWC"}<small>pembacaan utama</small></span><span>{zones[index] ? live.flow : "0.0"} L/s<small>debit sekarang</small></span></div>
          <button onClick={() => toggleZone(index)}>{zones[index] ? "Tutup katup" : "Buka katup"}</button>
        </article>)}
      </section>
      <div className="info-banner"><span>!</span><p><b>Override tidak melewati sistem keselamatan.</b> Float switch, dry-run, overcurrent, dan tekanan ekstrem selalu dapat menghentikan pompa secara lokal.</p></div>
    </>
  );

  const renderEnergy = () => (
    <>
      <PageHeader eyebrow="Solar-first, grid-assisted" title="Energi & jejak karbon" description="Pisahkan produksi surya, cadangan PLN, konsumsi pompa, dan estimasi emisi." />
      <section className="energy-hero">
        <article className="energy-summary dark-panel"><p>SOLAR FRACTION • HARI INI</p><h2>85<span>%</span></h2><div className="big-progress"><i style={{ width: "85%" }}/></div><div><span>Surya 6,4 kWh</span><span>PLN 1,1 kWh</span></div></article>
        <MetricCard label="Produksi PLTS" value="6,4" unit="kWh" meta="Peak 1,72 kW • 11.42" tone="amber" />
        <MetricCard label="Konsumsi pompa" value="7,5" unit="kWh" meta="6,1 jam operasi" tone="blue" />
        <MetricCard label="Emisi dihindari" value="6,9" unit="kg CO₂e" meta="vs jaringan penuh" />
      </section>
      <section className="energy-detail-grid">
        <article className="panel chart-panel"><div className="panel-heading"><div><p>PROFIL DAYA</p><h3>Produksi dan konsumsi hari ini</h3></div><span className="date-chip">11 Agu 2026</span></div>
          <div className="bar-chart" aria-label="Grafik profil daya per jam">{historyData.map((value, index) => <div key={index}><i style={{ height: `${value}%` }}/><span>{index % 3 === 0 ? `${index + 5}.00` : ""}</span></div>)}</div>
          <div className="chart-legend"><span><i className="solar-key"/>Produksi PLTS</span><span><i className="grid-key"/>Energi pompa</span></div>
        </article>
        <article className="panel source-card"><div className="panel-heading"><div><p>URUTAN PRIORITAS</p><h3>Strategi sumber energi</h3></div></div>
          <ol><li className="active"><span>1</span><div><b>Surya langsung</b><p>Selama daya cukup dan tandon belum penuh.</p></div></li><li><span>2</span><div><b>Surya + PLN</b><p>PLN menutup kekurangan saat kebutuhan tidak dapat ditunda.</p></div></li><li><span>3</span><div><b>PLN cadangan</b><p>Digunakan saat cuaca buruk atau perawatan PLTS.</p></div></li></ol>
          <div className="source-note"><b>Tidak ada ekspor listrik</b><p>Desain awal memakai seluruh energi di lokasi dan mengikuti kajian interkoneksi PLN.</p></div>
        </article>
      </section>
      <section className="emission-grid"><article><p>HARI INI</p><b>6,9 kg</b><span>CO₂e dihindari</span></article><article><p>BULAN INI</p><b>142 kg</b><span>CO₂e dihindari</span></article><article><p>PROYEKSI TAHUNAN</p><b>1,20 t</b><span>CO₂e dihindari</span></article><article><p>BASELINE</p><b>1,11</b><span>kg CO₂e/kWh jaringan</span></article></section>
    </>
  );

  const renderSensors = () => (
    <>
      <PageHeader eyebrow="Dari lapangan ke keputusan" title="Sensor, aktuator & integrasi" description="Klik setiap perangkat untuk melihat tipe, sinyal, lokasi, dan cara menghubungkannya." />
      <section className="connection-map panel">
        <div className="panel-heading"><div><p>TOPOLOGI YANG DIREKOMENDASIKAN</p><h3>Kontrol tetap berjalan saat internet terputus</h3></div><span className="safe-badge">Offline-first</span></div>
        <div className="connection-flow"><div><span>01</span><b>Sensor lapangan</b><small>RS485 • 4–20 mA • digital</small></div><i>→</i><div><span>02</span><b>RTU lokal</b><small>ESP32 + I/O terisolasi</small></div><i>→</i><div><span>03</span><b>Gateway LoRa</b><small>AS923 + MQTT</small></div><i>→</i><div><span>04</span><b>Dashboard</b><small>monitor • alarm • laporan</small></div></div>
        <div className="control-return"><span>Perintah kontrol</span><i>←</i><p>Dashboard mengirim setpoint; RTU memutuskan eksekusi setelah pemeriksaan interlock.</p></div>
      </section>

      <div className="sensor-toolbar"><div className="filter-group">{(["Semua", "Wajib", "Disarankan", "Opsional", "Aktuator"] as const).map((item) => <button key={item} className={sensorFilter === item ? "active" : ""} onClick={() => setSensorFilter(item)}>{item}</button>)}</div><span>{filteredSensors.length} perangkat untuk profil {crop}</span></div>
      <section className="sensor-grid">
        {filteredSensors.map((sensor) => <button className="sensor-card" key={sensor.id} onClick={() => setSelectedSensor(sensor)}>
          <div className="sensor-card-top"><span>{sensor.code}</span><i className={sensor.priority.toLowerCase()}>{sensor.priority}</i></div>
          <h3>{sensor.name}</h3><p>{sensor.type}</p>
          <div className="sensor-meta"><span>Sinyal<b>{sensor.signal}</b></span><span>Interval<b>{sensor.interval}</b></span></div>
          <div className="sensor-link">Lihat detail koneksi <span>→</span></div>
        </button>)}
      </section>

      <section className="panel architecture-table"><div className="panel-heading"><div><p>PERANGKAT INTI PANEL</p><h3>Komponen penghubung yang perlu disiapkan</h3></div></div>
        <div className="parts-grid"><div><b>RTU ESP32 industri</b><p>24 VDC, watchdog, RTC, penyimpanan lokal, Ethernet/LoRa.</p></div><div><b>Modul RS485 terisolasi</b><p>Untuk jaringan sensor Modbus dengan terminasi 120 Ω.</p></div><div><b>Input 4–20 mA</b><p>ADC industri terisolasi; jangan langsung masuk ke pin ESP32.</p></div><div><b>Relay & interlock</b><p>Interposing relay, E-stop, overload, dry-run, dan feedback kontaktor.</p></div><div><b>Catu 24 VDC + UPS kecil</b><p>Menjaga sensor dan kontrol; bukan baterai utama pompa.</p></div><div><b>Enclosure IP65</b><p>SPD, grounding, MCB, gland kabel, dan pemisahan daya–sinyal.</p></div></div>
      </section>
    </>
  );

  const renderHistory = () => (
    <>
      <PageHeader eyebrow="Jejak operasi yang dapat diaudit" title="Riwayat air, energi & peringatan" description="Data demo memperlihatkan bentuk pencatatan sebelum terhubung ke basis data lapangan." />
      <section className="history-summary"><MetricCard label="Air tersalur bulan ini" value="1.846" unit="m³" meta="↓ 12% terhadap baseline" tone="blue" /><MetricCard label="Energi pompa" value="176" unit="kWh" meta="149,6 kWh dari surya" tone="amber" /><MetricCard label="Uptime sistem" value="98,7" unit="%" meta="Target pilot ≥ 95%" /><MetricCard label="Alarm terselesaikan" value="14/15" unit="" meta="1 pemeliharaan terbuka" tone="blue" /></section>
      <section className="history-layout">
        <article className="panel log-panel"><div className="panel-heading"><div><p>LOG TERBARU</p><h3>Aktivitas sistem</h3></div><button onClick={() => notify("Contoh laporan CSV disiapkan.")}>Ekspor CSV</button></div>
          <div className="log-list"><div><time>14.32</time><span className="ok">AUTO</span><p><b>Tandon mencapai 74%</b><small>Pompa berhenti sesuai target pengisian.</small></p></div><div><time>13.08</time><span className="info">ZONA</span><p><b>Zona 1 dibuka</b><small>Ambang AWD tercapai dan tandon berada di atas 25%.</small></p></div><div><time>11.42</time><span className="sun">PV</span><p><b>Produksi surya mencapai puncak</b><small>1,72 kW • inverter normal.</small></p></div><div><time>09.16</time><span className="warn">ALARM</span><p><b>Debit turun selama 18 detik</b><small>Sistem pulih setelah katup selesai terbuka.</small></p></div><div><time>06.04</time><span className="ok">AUTO</span><p><b>Pemeriksaan harian selesai</b><small>Semua sensor wajib merespons.</small></p></div></div>
        </article>
        <aside className="panel report-panel"><div className="panel-heading"><div><p>LAPORAN PILOT</p><h3>Indikator yang direkam</h3></div></div><ul><li><span>Air</span>m³/hari, m³/ha, penghematan vs baseline</li><li><span>Energi</span>kWh pompa, solar fraction, jam operasi</li><li><span>Agronomi</span>hasil, mutu, fase tanaman, naungan</li><li><span>Lingkungan</span>CO₂e dihindari, AWD, suhu mikro</li><li><span>Operasi</span>uptime, alarm, waktu respons, biaya O&M</li></ul><button onClick={() => notify("Template laporan bulanan dibuka.")}>Buka laporan bulanan</button></aside>
      </section>
    </>
  );

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><b>PRINGGA</b><span>SURYA</span></div></div>
        <div className="site-chip"><span>SISIK–01</span><p>Pilot 1 hektare</p></div>
        <nav aria-label="Navigasi utama">{navItems.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.short}</span>{item.label}</button>)}</nav>
        <div className="sidebar-foot"><div className="connection"><i/><div><b>Gateway terhubung</b><span>Diperbarui 8 detik lalu</span></div></div><button onClick={() => notify("Pusat bantuan prototipe dibuka.")}>? <span>Pusat bantuan</span></button></div>
      </aside>

      <section className="app-main">
        <header className="topbar"><div className="mobile-brand">PRINGGASURYA</div><div className="topbar-right"><div className="simulation"><i/> MODE SIMULASI</div><label>Profil<select value={crop} onChange={(event) => setCrop(event.target.value as Crop)}><option>Padi</option><option>Hortikultura</option><option>Palawija</option></select></label><button className="bell" aria-label="Notifikasi" onClick={() => notify("Terdapat satu pengingat kalibrasi.")}>○<span>1</span></button><div className="avatar">DS</div></div></header>
        <div className="content">{tab === "ringkasan" && renderOverview()}{tab === "irigasi" && renderIrrigation()}{tab === "energi" && renderEnergy()}{tab === "sensor" && renderSensors()}{tab === "riwayat" && renderHistory()}</div>
        <nav className="mobile-nav" aria-label="Navigasi seluler">{navItems.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.short}</span>{item.label.split(" ")[0]}</button>)}</nav>
      </section>

      {selectedSensor && <div className="drawer-backdrop" onClick={() => setSelectedSensor(null)}><aside className="sensor-drawer" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label={`Detail ${selectedSensor.name}`}><button className="drawer-close" onClick={() => setSelectedSensor(null)}>×</button><div className="drawer-code"><span>{selectedSensor.code}</span><i>{selectedSensor.priority}</i></div><h2>{selectedSensor.name}</h2><p className="drawer-type">{selectedSensor.type}</p><div className="drawer-purpose">{selectedSensor.purpose}</div><dl><div><dt>Sinyal keluaran</dt><dd>{selectedSensor.signal}</dd></div><div><dt>Lokasi pemasangan</dt><dd>{selectedSensor.location}</dd></div><div><dt>Jalur koneksi</dt><dd>{selectedSensor.connection}</dd></div><div><dt>Interval pembacaan</dt><dd>{selectedSensor.interval}</dd></div><div><dt>Kalibrasi & perawatan</dt><dd>{selectedSensor.maintenance}</dd></div></dl><div className="crop-tags"><span>Digunakan untuk</span>{selectedSensor.crops.map((item) => <i key={item}>{item}</i>)}</div><div className="drawer-warning"><b>Catatan integrasi</b><p>Semua sensor lapangan memakai catu dan isolasi yang sesuai. Proteksi motor dan E-stop harus tetap berupa rangkaian listrik lokal, bukan bergantung pada aplikasi.</p></div></aside></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
