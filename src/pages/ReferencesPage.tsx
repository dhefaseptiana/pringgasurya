import { ArrowUpRight, BookOpen, FileText, Landmark, Microscope } from "lucide-react";
import { DataBadge } from "../components/common/DataBadge";
import { SectionTabs, systemTabs } from "../components/navigation/SectionTabs";

const references = [
  { type: "Data wilayah", icon: Landmark, title: "Kecamatan Pringgarata dalam Angka 2025", author: "BPS Kabupaten Lombok Tengah", year: "2025", use: "Luas wilayah, jumlah desa, dan konteks Kecamatan Pringgarata.", url: "https://lomboktengahkab.bps.go.id/id/publication/2025/09/26/693aabd831fd1515b111cf5c/pringgarata-district-in-figures-2025.html" },
  { type: "Irigasi", icon: FileText, title: "Analisis ketersediaan air dan efektivitas saluran irigasi Bendung Gebong", author: "Yamin et al.", year: "2024", use: "Ketersediaan air dan efisiensi saluran sekunder 29,54%.", url: "https://doi.org/10.37824/sij.v7i1.2024.612" },
  { type: "Kondisi lokal", icon: Landmark, title: "Optimalisasi lahan pertanian terkendala listrik", author: "Akhyar Rosidi · ANTARA News Mataram", year: "2026", use: "Kendala daya listrik pompa irigasi di Pringgarata.", url: "https://mataram.antaranews.com/berita/562728/optimalisasi-lahan-pertanian-terkendala-listrik" },
  { type: "Kualitas air", icon: Microscope, title: "Uji kualitas air sungai di Desa Bilebante", author: "DLH Kabupaten Lombok Tengah", year: "2025", use: "Kegiatan sampling pH, kekeruhan, oksigen terlarut, dan pencemar; publikasi tidak memuat hasil laboratorium.", url: "https://dlh.lomboktengahkab.go.id/berita/dukung-sertifikasi-desa-wisata-berkelanjutan-dlh-lombok-tengah-uji-kualitas-air-sungai-di-desa-bilebante-" },
  { type: "Energi", icon: Landmark, title: "Keberlanjutan operasi PLTU, pemerintah pertimbangkan hal ini", author: "Kementerian ESDM", year: "2024", use: "Konteks dominasi batubara dalam struktur pembangkitan listrik Indonesia.", url: "https://www.esdm.go.id/id/media-center/arsip-berita/keberlanjutan-operasi-pltu-pemerintah-pertimbangkan-hal-ini" },
  { type: "Pompa surya", icon: BookOpen, title: "Optimization of solar PV water pumping system with different scenarios for storage elements", author: "Osama, Abdel-Salam, & Elnozahy", year: "2025", use: "Pertimbangan penyimpanan air dibanding ketergantungan pada baterai berkapasitas besar.", url: "https://doi.org/10.1007/s10668-025-06949-z" },
];

export function ReferencesPage() {
  return (
    <div className="project-page references-page">
      <SectionTabs label="Navigasi tentang sistem" items={systemTabs} />
      <header className="operation-page-header"><div><span>RESEARCH · EVIDENCE BASE</span><h1>Sumber yang dapat ditelusuri.</h1><p>Setiap klaim utama dipisahkan dari asumsi desain dan keluaran simulasi agar pembaca mengetahui mana fakta, konteks, serta hal yang masih harus diuji.</p></div><DataBadge source="RESEARCH" /></header>
      <section className="reference-principle"><BookOpen /><div><span>ATURAN BACA</span><h2>Sumber mendukung konteks—bukan membuktikan seluruh sistem.</h2><p>Angka model PRINGGASURYA tetap diberi label simulasi. Kapasitas final dan dampak pilot hanya dapat ditetapkan setelah survei serta pengukuran lapangan.</p></div></section>
      <section className="reference-list">{references.map(({ type, icon: Icon, title, author, year, use, url }, index) => <a key={title} href={url} target="_blank" rel="noreferrer"><span>0{index + 1}</span><Icon /><div><small>{type} · {year}</small><h2>{title}</h2><b>{author}</b><p>{use}</p></div><ArrowUpRight /></a>)}</section>
    </div>
  );
}
