import { ArrowLeft, ArrowRight, Map } from "lucide-react";
import { Link } from "react-router-dom";

export type JourneyChapter = "system" | "operation" | "irrigation" | "impact" | "feasibility";

export const journeyChapters: Array<{
  id: JourneyChapter;
  number: string;
  label: string;
  title: string;
  description: string;
  to: string;
}> = [
  { id: "system", number: "01", label: "Understand", title: "Sistem", description: "Ikuti hubungan PLTS, PLN, pompa, tandon, sensor, dan lahan.", to: "/system-overview" },
  { id: "operation", number: "02", label: "Operate", title: "Operasi", description: "Ubah kondisi cuaca dan kebutuhan air melalui simulation engine.", to: "/operate/live" },
  { id: "irrigation", number: "03", label: "Distribute", title: "Irigasi", description: "Pilih profil tanaman, zona lahan, dan logika distribusi air.", to: "/operate/irrigation" },
  { id: "impact", number: "04", label: "Evaluate", title: "Dampak", description: "Uji trade-off agrivoltaik, evaporasi, cahaya, dan emisi.", to: "/analyze/impact" },
  { id: "feasibility", number: "05", label: "Decide", title: "Kelayakan", description: "Bandingkan CAPEX, biaya air, payback, dan alternatif energi.", to: "/analyze/economics" },
];

export function ProjectJourney() {
  return (
    <section className="project-journey" id="project-journey" aria-labelledby="journey-title">
      <div className="project-journey__intro">
        <span>EXPLORE THE PROJECT</span>
        <h2 id="journey-title">Satu gagasan, lima chapter yang saling terhubung.</h2>
        <p>Mulai dari arsitektur sistem, jalankan operasinya, distribusikan air, lalu nilai dampak dan kelayakannya.</p>
      </div>
      <nav className="project-journey__chapters" aria-label="Alur utama PRINGGASURYA">
        {journeyChapters.map((chapter) => (
          <Link key={chapter.id} to={chapter.to} className={`journey-chapter journey-chapter--${chapter.id}`}>
            <span className="journey-chapter__number">{chapter.number}</span>
            <span className="journey-chapter__copy"><small>{chapter.label}</small><b>{chapter.title}</b><em>{chapter.description}</em></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  );
}

export function PageContinuation({ current }: { current: JourneyChapter }) {
  const index = journeyChapters.findIndex((chapter) => chapter.id === current);
  const previous = index > 0 ? journeyChapters[index - 1] : undefined;
  const next = index < journeyChapters.length - 1 ? journeyChapters[index + 1] : undefined;
  const active = journeyChapters[index];

  return (
    <nav className="page-continuation" aria-label="Lanjutkan perjalanan proyek">
      <div className="page-continuation__progress">
        <span>PROJECT JOURNEY</span>
        <div>{journeyChapters.map((chapter) => <i key={chapter.id} className={chapter.id === current ? "active" : ""} />)}</div>
        <p>{active.number} / 05 · {active.title}</p>
      </div>
      <div className="page-continuation__links">
        {previous ? <Link className="continuation-link continuation-link--previous" to={previous.to}><ArrowLeft /><span><small>Chapter sebelumnya</small><b>{previous.title}</b></span></Link> : <Link className="continuation-link continuation-link--previous" to="/"><Map /><span><small>Kembali ke</small><b>Project map</b></span></Link>}
        <Link className="continuation-home" to="/"><Map />Lihat seluruh alur</Link>
        {next ? <Link className="continuation-link continuation-link--next" to={next.to}><span><small>Chapter berikutnya</small><b>{next.title}</b></span><ArrowRight /></Link> : <Link className="continuation-link continuation-link--next" to="/"><span><small>Selesai</small><b>Kembali ke Home</b></span><ArrowRight /></Link>}
      </div>
    </nav>
  );
}
