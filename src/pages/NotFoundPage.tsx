import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <div className="not-found"><span>404</span><h1>Halaman belum tersedia</h1><p>Rute yang kamu buka tidak termasuk dalam arsitektur PRINGGASURYA saat ini.</p><Link className="button button--primary" to="/"><ArrowLeft />Kembali ke Home</Link></div>;
}
