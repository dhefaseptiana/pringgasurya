import { ArrowRight, BarChart3, CloudSun, Droplets, Gauge, Leaf, PlugZap, Sprout, Sun, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { DataBadge } from "../components/common/DataBadge";
import { SectionHeading } from "../components/common/SectionHeading";

const challengeItems = [
  { icon: Droplets, title: "Air belum selalu tersedia", body: "Kebutuhan air tanaman berubah menurut musim, fase tumbuh, dan kondisi sumber." },
  { icon: Waves, title: "Kualitas air perlu dipantau", body: "pH, EC, dan kekeruhan membantu memberi peringatan awal sebelum air didistribusikan." },
  { icon: PlugZap, title: "Energi pompa perlu andal", body: "Ketergantungan pada satu sumber energi dapat mengganggu jadwal irigasi dan biaya operasi." },
];

const capabilities = [
  { icon: Sun, title: "Energy", body: "PLTS sebagai sumber utama siang hari; PLN siap membantu ketika dibutuhkan.", tone: "solar" },
  { icon: Droplets, title: "Water", body: "Pompa mengisi tandon ketika energi tersedia. Air menjadi buffer operasional.", tone: "water" },
  { icon: Sprout, title: "Agriculture", body: "Logika padi berbasis muka air; hortikultura dan palawija berbasis kelembapan tanah.", tone: "crop" },
  { icon: BarChart3, title: "Decision support", body: "Dashboard menyatukan status, peringatan, tren, dan asumsi analisis.", tone: "engineering" },
];

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <div className="eyebrow-row"><span>PRINGGARATA PILOT SYSTEM</span><DataBadge source="SIMULATION" /></div>
          <h1>Menjaga air, energi, dan pangan dalam satu sistem yang tangguh.</h1>
          <p>PRINGGASURYA adalah konsep <b>solar-first, grid-assisted smart irrigation</b> untuk Kecamatan Pringgarata—mengubah energi matahari menjadi persediaan air yang dapat digunakan ketika tanaman membutuhkannya.</p>
          <div className="button-row"><Link className="button button--primary" to="/system-overview">Jelajahi sistem <ArrowRight /></Link><Link className="button button--secondary" to="/operate/live">Buka simulasi operasi</Link></div>
          <p className="prototype-note"><Gauge /> Prototipe digital untuk analisis gagasan esai. Tidak terhubung ke pompa atau sensor nyata.</p>
        </div>
        <div className="home-hero__visual" aria-label="Hubungan energi, air, dan pertanian">
          <div className="hero-orbit hero-orbit--solar"><Sun /><span>PLTS</span><b>Energi utama</b></div>
          <div className="hero-orbit hero-orbit--water"><Droplets /><span>Tandon</span><b>Simpan air</b></div>
          <div className="hero-orbit hero-orbit--crop"><Sprout /><span>Lahan</span><b>Irigasi tepat</b></div>
          <div className="hero-core"><CloudSun /><b>PRINGGA<br />SURYA</b></div>
          <p>Instead of storing electricity,<br /><b>we store water.</b></p>
        </div>
      </section>

      <section className="home-section">
        <SectionHeading kicker="01 · PRINGGARATA CHALLENGE" title="Tiga kebutuhan yang tidak dapat dipisahkan" description="Masalah irigasi bukan hanya tentang pompa. Air, kualitas sumber, dan pasokan energi memengaruhi keputusan petani secara bersamaan." />
        <div className="challenge-grid">{challengeItems.map(({ icon: Icon, title, body }, index) => <article key={title}><span>0{index + 1}</span><Icon /><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="solution-section">
        <div>
          <span className="section-kicker">02 · THE SOLUTION</span>
          <h2>Menggunakan matahari saat tersedia, menyimpan air untuk saat dibutuhkan.</h2>
          <p>Panel surya menyuplai pompa pada siang hari. Pompa memindahkan air ke tandon, sehingga sistem tidak memerlukan baterai pompa berkapasitas besar. PLN berperan sebagai cadangan untuk kebutuhan mendesak atau produksi surya yang tidak mencukupi.</p>
          <Link className="text-link" to="/operate/energy">Lihat strategi energi <ArrowRight /></Link>
        </div>
        <div className="principle-stack">
          <article><span>1</span><div><b>Solar first</b><p>Prioritaskan produksi PLTS untuk beban pompa.</p></div></article>
          <article><span>2</span><div><b>Store water</b><p>Gunakan tandon sebagai buffer operasi dan ketahanan.</p></div></article>
          <article><span>3</span><div><b>Grid assisted</b><p>Aktifkan bantuan PLN berdasarkan kebutuhan dan batas aman.</p></div></article>
        </div>
      </section>

      <section className="home-section">
        <SectionHeading kicker="03 · HOW IT WORKS" title="Dari energi menuju dampak" description="Setiap lapisan menghasilkan keputusan untuk lapisan berikutnya." />
        <div className="impact-chain">
          {[
            ["Energy", "PLTS + PLN"], ["Water", "Pompa + tandon"], ["Agriculture", "Sensor + irigasi"], ["Economy", "Biaya operasi"], ["Environment", "Air + emisi"],
          ].map(([title, meta], index) => <div key={title}><span>{index + 1}</span><b>{title}</b><small>{meta}</small></div>)}
        </div>
      </section>

      <section className="capability-section">
        <SectionHeading kicker="04 · CAPABILITIES" title="Satu antarmuka, empat sudut pandang" />
        <div className="capability-grid">{capabilities.map(({ icon: Icon, title, body, tone }) => <article className={`capability-card capability-card--${tone}`} key={title}><Icon /><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="impact-section">
        <div><span className="section-kicker">05 · PROJECTED IMPACT</span><h2>Hipotesis yang harus dibuktikan melalui pilot.</h2><p>Angka berikut adalah keluaran skenario awal, bukan hasil lapangan. Nilainya perlu dihitung ulang setelah survei debit, total head, pola tanam, tarif energi, dan konfigurasi panel.</p><DataBadge source="PROJECTED" /></div>
        <div className="impact-metrics">
          <article><b>↓ CO₂e</b><span>Dibanding diesel atau jaringan penuh</span></article>
          <article><b>↓ OPEX</b><span>Energi surya menekan biaya operasi</span></article>
          <article><b>↑ Reliability</b><span>PLN menjaga layanan saat surya rendah</span></article>
          <article><b>↑ Water control</b><span>Sensor dan tandon memperjelas keputusan</span></article>
        </div>
      </section>

      <section className="home-section scale-preview">
        <SectionHeading kicker="06 · SCALABILITY" title="Mulai kecil, ukur, lalu replikasi" description="Arsitektur yang sama dapat dikonfigurasi untuk kelompok pengelola dan luasan berbeda." action={<Link className="text-link" to="/plan/scalability">Detail skala <ArrowRight /></Link>} />
        <div className="scale-grid"><article><span>PILOT</span><b>±1 ha</b><p>Satu pompa, tandon, dan sensor esensial.</p></article><article><span>KELOMPOK</span><b>±5 ha</b><p>Beberapa zona dan dashboard pengelola.</p></article><article><span>KAWASAN</span><b>±20 ha</b><p>Jaringan terpusat dan operasi bertingkat.</p></article></div>
      </section>
    </div>
  );
}
