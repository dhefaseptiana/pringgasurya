import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataBadge } from "../components/common/DataBadge";
import { PringgasuryaBrand } from "../components/common/PringgasuryaBrand";

export function LoginPage() {
  const navigate = useNavigate();
  const [operatorId, setOperatorId] = useState("operator.demo");
  const [password, setPassword] = useState("pringgasurya");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate("/operate/irrigation");
  };

  return (
    <div className="login-page">
      <Link className="login-back" to="/"><ArrowLeft />Kembali ke Beranda</Link>
      <section className="login-card">
        <div className="login-brand"><PringgasuryaBrand /></div>
        <DataBadge source="SIMULATION" />
        <h1>Masuk sebagai operator</h1>
        <p>Akses kontrol irigasi untuk Pilot Unit 01 dalam lingkungan simulasi.</p>
        <form onSubmit={submit}>
          <label><span>ID Operator</span><div><UserRound /><input value={operatorId} onChange={(event) => setOperatorId(event.target.value)} required /></div></label>
          <label><span>Kata sandi demo</span><div><LockKeyhole /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div></label>
          <button type="submit">Masuk ke Kontrol <ArrowRight /></button>
        </form>
        <div className="login-disclosure"><ShieldCheck /><p><b>Autentikasi simulasi.</b> Formulir ini hanya mendemonstrasikan alur akses. Sistem nyata memerlukan backend, otorisasi berbasis peran, dan audit log.</p></div>
      </section>
    </div>
  );
}
