import { ArrowDown, ArrowRight, CloudSun, Droplets, Gauge, Leaf, PlugZap, Sprout, Sun, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { DataBadge } from "../components/common/DataBadge";
import { ProjectJourney } from "../components/navigation/ProjectJourney";

const challenges = [
  { icon: Droplets, number: "01", title: "Air", body: "Ketersediaan air berubah menurut musim, fase tumbuh, dan kondisi sumber." },
  { icon: Waves, number: "02", title: "Kualitas", body: "pH, EC, dan kekeruhan perlu terbaca sebelum air didistribusikan." },
  { icon: PlugZap, number: "03", title: "Energi", body: "Pompa membutuhkan sumber daya yang andal tanpa bergantung pada diesel." },
];

export function HomePage() {
  return (
    <div className="home-page home-page--editorial">
      <section className="home-hero home-hero--editorial">
        <div className="home-hero__copy">
          <div className="eyebrow-row"><span>PRINGGARATA · LOMBOK TENGAH</span><DataBadge source="SIMULATION" /></div>
          <h1>Air untuk tanaman.<br /><em>Energi dari matahari.</em></h1>
          <p>PRINGGASURYA adalah konsep <b>solar-first, grid-assisted smart irrigation</b> yang menyatukan produksi energi, penyimpanan air, dan keputusan irigasi dalam satu sistem.</p>
          <div className="home-hero__actions">
            <Link className="button button--primary" to="/system-overview">Mulai perjalanan <ArrowRight /></Link>
            <a className="home-scroll-link" href="#project-journey">Lihat lima chapter <ArrowDown /></a>
          </div>
          <p className="prototype-note"><Gauge /> Prototipe digital untuk menguji gagasan esai—bukan fasilitas operasional.</p>
        </div>

        <div className="home-hero__visual terrain-visual" aria-label="Siklus energi surya, penyimpanan air, dan irigasi lahan">
          <div className="terrain-visual__sun"><Sun /><span>922 W/m²</span></div>
          <div className="terrain-visual__panels"><i /><i /><i /></div>
          <div className="terrain-visual__energy"><span>PLTS</span><b>ENERGY</b></div>
          <div className="terrain-visual__water"><Droplets /><span>TANDON</span><b>STORE WATER</b></div>
          <div className="terrain-visual__field"><Sprout /><span>LAHAN</span><b>IRRIGATE</b></div>
          <div className="terrain-visual__route terrain-visual__route--energy"><i /></div>
          <div className="terrain-visual__route terrain-visual__route--water"><i /></div>
          <div className="terrain-visual__statement"><CloudSun /><p>Instead of storing electricity,<br /><b>we store water.</b></p></div>
          <div className="terrain-visual__ground"><span>PRINGGARATA PILOT LANDSCAPE</span><span>08°34′ S · 116°16′ E</span></div>
        </div>
      </section>

      <ProjectJourney />

      <section className="home-problem">
        <div className="home-problem__statement">
          <span>THE LOCAL QUESTION</span>
          <h2>Bagaimana menjaga irigasi ketika air, kualitas sumber, dan energi tidak selalu pasti?</h2>
          <p>PRINGGASURYA memperlakukan ketiganya sebagai satu persoalan desain, bukan tiga proyek yang berdiri sendiri.</p>
        </div>
        <div className="home-problem__list">
          {challenges.map(({ icon: Icon, number, title, body }) => (
            <article key={title}><span>{number}</span><Icon /><div><h3>{title}</h3><p>{body}</p></div></article>
          ))}
        </div>
      </section>

      <section className="operating-manifesto">
        <div className="operating-manifesto__lead">
          <span>THE OPERATING IDEA</span>
          <h2>Matahari menggerakkan pompa. Tandon memisahkan waktu produksi energi dari waktu kebutuhan air.</h2>
          <Link to="/operate/live">Jalankan skenario operasi <ArrowRight /></Link>
        </div>
        <ol>
          <li><span>01</span><div><b>Solar first</b><p>Gunakan produksi PLTS sebagai sumber utama beban pompa pada siang hari.</p></div></li>
          <li><span>02</span><div><b>Store water</b><p>Simpan air sebagai buffer operasional sehingga baterai besar dapat dihindari.</p></div></li>
          <li><span>03</span><div><b>Grid assisted</b><p>Gunakan PLN hanya ketika cadangan air atau kebutuhan tanaman menuntutnya.</p></div></li>
        </ol>
      </section>

      <section className="evidence-band">
        <div><Leaf /><span>Hipotesis pilot</span><h2>Dampak harus dibuktikan, bukan sekadar diklaim.</h2></div>
        <div className="evidence-band__metrics">
          <article><span>ENERGY</span><b>↓ CO₂e</b><p>dibanding diesel atau jaringan penuh</p></article>
          <article><span>ECONOMY</span><b>↓ OPEX</b><p>melalui pemanfaatan energi matahari</p></article>
          <article><span>WATER</span><b>↑ Control</b><p>melalui sensor, tandon, dan zonasi</p></article>
        </div>
        <Link to="/analyze/impact">Uji asumsi dampak <ArrowRight /></Link>
      </section>

      <section className="scale-story">
        <div><span>SCALABILITY</span><h2>Mulai dari satu hektare.<br />Ukur. Pelajari. Replikasi.</h2><p>Arsitektur dasarnya sama; kapasitas pompa, panel, tandon, jumlah sensor, dan model pengelolaannya yang berubah.</p></div>
        <div className="scale-story__rail">
          <article><span>01</span><b>±1 ha</b><p>Pilot petani</p></article>
          <i />
          <article><span>02</span><b>±5 ha</b><p>Kelompok tani</p></article>
          <i />
          <article><span>03</span><b>±20 ha</b><p>Gapoktan / BUMDes</p></article>
        </div>
      </section>
    </div>
  );
}
