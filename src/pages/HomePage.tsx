import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
  LockKeyhole,
  Mail,
  MapPinned,
  Menu,
  MonitorUp,
  Play,
  Sprout,
  Sun,
  UsersRound,
  Warehouse,
  Waves,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PringgasuryaBrand } from "../components/common/PringgasuryaBrand";
import systemLandscape from "../assets/pringgasurya-system-landscape.webp";
import pilotField from "../assets/pringgasurya-pilot-field.webp";
import impactField from "../assets/pringgasurya-impact-field.webp";

const capabilities = [
  { icon: Sun, title: "Solar powered", body: "Energi pompa dari PV" },
  { icon: Sprout, title: "Smart irrigation", body: "Irigasi sesuai kebutuhan tanaman" },
  { icon: MonitorUp, title: "Field monitoring", body: "Pemantauan kondisi lahan" },
];

const operatingSteps = [
  {
    number: "01",
    icon: Sun,
    title: "Tangkap energi",
    body: "Panel surya mengubah sinar matahari menjadi energi untuk menyalakan pompa pada siang hari.",
  },
  {
    number: "02",
    icon: Droplets,
    title: "Simpan air",
    body: "Air hasil pemompaan disimpan di tandon sebagai cadangan operasional.",
  },
  {
    number: "03",
    icon: Sprout,
    title: "Irigasi sesuai kebutuhan",
    body: "Sensor membantu menyesuaikan irigasi berdasarkan kebutuhan tanaman, zona, dan waktu.",
  },
];

const impacts = [
  {
    icon: Sun,
    title: "Solar-first",
    body: "Energi surya menjadi sumber utama untuk operasional pompa pada siang hari.",
  },
  {
    icon: Waves,
    title: "Lebih terkendali",
    body: "Tandon dan sensor membantu menjaga distribusi air sesuai kondisi lahan.",
  },
  {
    icon: Leaf,
    title: "Dual-use",
    body: "Panel di atas lahan tetap memungkinkan satu ruang menghasilkan energi dan pangan.",
  },
];

const pilotScales = [
  {
    icon: MapPinned,
    area: "±1 ha",
    title: "Pilot petani",
    body: "Lahan percontohan yang dikelola bersama petani lokal untuk menguji sistem secara nyata.",
  },
  {
    icon: UsersRound,
    area: "±5 ha",
    title: "Kelompok tani",
    body: "Diperluas bersama kelompok tani untuk memperkuat kolaborasi dan adopsi teknologi.",
  },
  {
    icon: Warehouse,
    area: "±20 ha",
    title: "Gapoktan atau BUMDes",
    body: "Skala komunitas untuk mendorong kemandirian pengelolaan air dan energi.",
  },
];

const systemComponents = [
  { icon: Sun, title: "Panel Surya", body: "Sumber energi utama" },
  { icon: Waves, title: "Pompa Irigasi", body: "Menyalurkan air ke lahan" },
  { icon: Droplets, title: "Tandon Air", body: "Penyimpanan sementara" },
  { icon: Sprout, title: "Sensor Lapangan", body: "Kelembapan dan kondisi tanah" },
  { icon: MonitorUp, title: "Komunikasi LoRa", body: "Mengirim data jarak jauh" },
];

const aboutBenefits = [
  { icon: Sun, title: "Energi bersih", body: "Dari matahari untuk pompa irigasi" },
  { icon: Droplets, title: "Air terkelola", body: "Tandon dan distribusi sesuai kebutuhan" },
  { icon: Sprout, title: "Irigasi cerdas", body: "Berbasis data lapangan dan kebutuhan tanaman" },
  { icon: MonitorUp, title: "Terhubung", body: "Komunikasi LoRa untuk pemantauan jarak jauh" },
];

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="public-site">
      <section className="public-hero" id="beranda">
        <header className="public-navbar">
          <a className="public-brand" href="#beranda" aria-label="PRINGGASURYA Beranda">
            <PringgasuryaBrand />
          </a>

          <button className="public-menu-toggle" onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} aria-label="Buka menu">
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className={`public-navigation ${menuOpen ? "is-open" : ""}`} aria-label="Navigasi landing page">
            <a className="active" href="#beranda" onClick={() => setMenuOpen(false)}>Beranda</a>
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara Kerja</a>
            <a href="#dampak" onClick={() => setMenuOpen(false)}>Dampak</a>
            <a href="#pilot" onClick={() => setMenuOpen(false)}>Pilot Pringgarata</a>
            <a href="#tentang" onClick={() => setMenuOpen(false)}>Tentang</a>
          </nav>

          <button className="language-switch" type="button" aria-label="Bahasa Indonesia">ID <span>⌄</span></button>
        </header>

        <div className="public-hero__content">
          <span className="public-hero__eyebrow">SMART AGRIVOLTAIC IRRIGATION</span>
          <h1>Air tepat waktu.<br />Energi dari matahari.</h1>
          <p className="public-hero__lead">Sistem irigasi pintar berbasis agrivoltaik untuk pertanian Pringgarata.</p>
          <p className="public-hero__description">Menghubungkan energi surya, kebutuhan air tanaman, dan monitoring lapangan dalam satu sistem yang lebih efisien.</p>
          <div className="public-hero__actions">
            <Link className="landing-button landing-button--primary" to="/operate/live">Lihat Demo Sistem <ArrowRight /></Link>
            <Link className="landing-button landing-button--secondary" to="/login"><LockKeyhole />Masuk sebagai Operator</Link>
          </div>
          <div className="prototype-pill"><i /><b>Prototipe Simulasi</b><span>Pringgarata Pilot</span></div>
        </div>

        <div className="hero-capabilities">
          {capabilities.map(({ icon: Icon, title, body }) => <article key={title}><Icon /><div><b>{title}</b><p>{body}</p></div></article>)}
        </div>
      </section>

      <main className="reference-page">
        <section className="reference-how" id="cara-kerja">
          <Sun className="reference-how__sun" aria-hidden="true" />
          <Sprout className="reference-how__plant" aria-hidden="true" />
          <div className="reference-container">
            <header className="reference-heading">
              <span>CARA KERJA</span>
              <h2>Dari matahari menuju<br />lahan dalam tiga langkah.</h2>
            </header>

            <div className="reference-steps">
              {operatingSteps.map(({ number, icon: Icon, title, body }) => (
                <article key={number}>
                  <span>{number}</span>
                  <div className="reference-step__content">
                    <Icon />
                    <div><h3>{title}</h3><p>{body}</p></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reference-impact" id="dampak">
          <img src={impactField} alt="Panel agrivoltaik di atas lahan pertanian" />
          <div className="reference-impact__shade" />
          <div className="reference-container reference-impact__content">
            <header>
              <span>DAMPAK YANG DIUJI</span>
              <h2>Bukan sekadar<br />menyalakan pompa.</h2>
              <p>PRINGGASURYA dirancang untuk menghubungkan energi surya, pengelolaan air, dan produktivitas lahan.</p>
            </header>

            <div className="reference-impact__items">
              {impacts.map(({ icon: Icon, title, body }) => (
                <article key={title}><Icon /><h3>{title}</h3><p>{body}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="reference-pilot-shell" id="pilot">
          <div className="reference-pilot">
            <div className="reference-pilot__main">
              <img src={pilotField} alt="Pilot agrivoltaik dengan tandon dan saluran irigasi" />
              <div className="reference-pilot__fade" />
              <div className="reference-pilot__copy">
                <header className="reference-heading">
                  <span>PILOT PRINGGARATA</span>
                  <h2>Mulai kecil, ukur,<br />lalu replikasi.</h2>
                  <p>Pilot di Pringgarata menjadi laboratorium lapangan untuk menguji teknologi dalam kondisi nyata dan memastikan manfaatnya bisa direplikasi di lebih banyak lahan.</p>
                </header>

                <div className="reference-scales">
                  {pilotScales.map(({ icon: Icon, area, title, body }) => (
                    <article key={area}>
                      <div><Icon /></div>
                      <b>{area}</b>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="reference-pilot__quote">
              <div className="reference-quote__copy">
                <span>“</span>
                <div><p>Pilot dimulai kecil agar setiap keputusan replikasi didasarkan pada data air, energi, tanaman, dan pengalaman operator.</p><b>PRINSIP IMPLEMENTASI PRINGGASURYA</b></div>
              </div>
              <div className="reference-slider" aria-label="Navigasi kutipan">
                <button type="button" aria-label="Kutipan sebelumnya"><ChevronLeft /></button>
                <i className="active" /><i /><i />
                <button type="button" aria-label="Kutipan berikutnya"><ChevronRight /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="reference-about" id="tentang">
          <img src={systemLandscape} alt="Lanskap pertanian dengan jaringan air dan energi surya" />
          <div className="reference-about__fade" />
          <div className="reference-about__copy">
            <header className="reference-heading">
              <span>TENTANG GAGASAN</span>
              <h2>Air, energi, dan pangan<br />diperlakukan sebagai<br />satu sistem.</h2>
            </header>
            <p>PRINGGASURYA mengintegrasikan panel surya, pompa, tandon, sensor, komunikasi LoRa, dan dashboard untuk mendukung pengelolaan irigasi di Kecamatan Pringgarata.</p>
            <Link to="/system-overview">Pelajari arsitektur sistem <ArrowRight /></Link>

            <div className="reference-benefits">
              {aboutBenefits.map(({ icon: Icon, title, body }) => (
                <article key={title}><div><Icon /></div><h3>{title}</h3><p>{body}</p></article>
              ))}
            </div>
          </div>

          <div className="reference-system-flow">
            {systemComponents.map(({ icon: Icon, title, body }) => (
              <article key={title}><Icon /><div><b>{title}</b><small>{body}</small></div></article>
            ))}
          </div>
        </section>
      </main>

      <footer className="reference-footer">
        <div className="reference-footer__brand"><PringgasuryaBrand /></div>
        <nav aria-label="Navigasi footer">
          <a href="#beranda">Beranda</a><a href="#pilot">Pilot Pringgarata</a>
          <a href="#cara-kerja">Cara Kerja</a><a href="#tentang">Tentang</a>
          <a href="#dampak">Dampak</a>
        </nav>
        <div className="reference-footer__about"><p>Prototipe gagasan smart agrivoltaic irrigation untuk Pringgarata, Lombok Tengah.</p><span><i /> PROTOTIPE SIMULASI</span></div>
        <div className="reference-footer__social" aria-label="Kanal PRINGGASURYA">
          <button type="button" aria-label="Instagram"><Camera /></button>
          <button type="button" aria-label="YouTube"><Play /></button>
          <button type="button" aria-label="Email"><Mail /></button>
        </div>
      </footer>
    </div>
  );
}
