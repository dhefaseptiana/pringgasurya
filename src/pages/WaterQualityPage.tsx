import { Beaker, Droplet, Info, ShieldCheck, Thermometer, Waves } from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { monitoringTabs, SectionTabs } from "../components/navigation/SectionTabs";
import { useTelemetry } from "../hooks/useTelemetry";

export function WaterQualityPage() {
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Memeriksa kualitas air simulasi…</div>;

  const checks = [
    { icon: Droplet, label: "pH", value: data.waterQuality.ph, unit: "", range: "Rentang model 5,5–8,5", safe: data.waterQuality.ph >= 5.5 && data.waterQuality.ph <= 8.5 },
    { icon: Beaker, label: "Konduktivitas", value: data.waterQuality.ecMsCm, unit: "mS/cm", range: "Indikator salinitas awal", safe: data.waterQuality.ecMsCm < 2 },
    { icon: Waves, label: "Kekeruhan", value: data.waterQuality.turbidityNtu, unit: "NTU", range: "Interlock model < 50 NTU", safe: data.waterQuality.turbidityNtu < 50 },
    { icon: Thermometer, label: "Suhu air", value: data.waterQuality.temperatureC, unit: "°C", range: "Dibandingkan pola harian", safe: data.waterQuality.temperatureC < 34 },
  ];
  const allSafe = checks.every((check) => check.safe) && data.quality === "VALID";

  return (
    <div className="project-page quality-page">
      <SectionTabs label="Navigasi monitoring" items={monitoringTabs} />
      <header className="operation-page-header"><div><span>MONITORING · WATER QUALITY</span><h1>Periksa air sebelum dialirkan.</h1><p>Empat parameter menjadi peringatan awal. Keputusan pengolahan tetap memerlukan uji laboratorium dan kebutuhan komoditas.</p></div><DataBadge source="SIMULATION" /></header>
      <section className={`quality-verdict ${allSafe ? "is-safe" : "is-warning"}`}><ShieldCheck /><div><span>KEPUTUSAN MODEL</span><h2>{allSafe ? "Air dapat digunakan dalam simulasi" : "Tahan irigasi otomatis"}</h2><p>{allSafe ? "Seluruh pembacaan sintetis berada di dalam batas interlock awal." : "Satu atau lebih parameter memerlukan pemeriksaan sebelum distribusi dilanjutkan."}</p></div></section>
      <section className="quality-grid">{checks.map(({ icon: Icon, label, value, unit, range, safe }) => <article key={label}><div><Icon /><i className={safe ? "safe" : "warning"}>{safe ? "Dalam batas" : "Periksa"}</i></div><span>{label}</span><b>{value} <small>{unit}</small></b><p>{range}</p></article>)}</section>
      <section className="quality-context"><article><span>01</span><div><h2>Apa yang dapat diputuskan?</h2><p>Dashboard dapat menahan irigasi saat sensor menunjukkan risiko, meminta verifikasi operator, dan menyimpan kejadian untuk ditinjau.</p></div></article><article><span>02</span><div><h2>Apa yang belum dapat diputuskan?</h2><p>Dashboard tidak menyatakan air tercemar atau aman secara definitif tanpa hasil laboratorium dan baku mutu yang relevan.</p></div></article><article><span>03</span><div><h2>Bagaimana menuju pilot?</h2><p>Kalibrasi sensor, ambil sampel pembanding, tetapkan ambang per komoditas, lalu validasi interlock bersama operator.</p></div></article></section>
      <section className="quality-note"><Info /><p>Nilai pada halaman ini merupakan data sintetis. Elektrolisis atau elektrokoagulasi bukan komponen wajib dan hanya dipilih jika kontaminan terbukti membutuhkan perlakuan tersebut.</p></section>
    </div>
  );
}
