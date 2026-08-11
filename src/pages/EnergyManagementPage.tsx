import { BatteryCharging, Gauge, PlugZap, Sun, Zap } from "lucide-react";
import { OperationsChart } from "../components/charts/OperationsChart";
import { MetricCard } from "../components/common/MetricCard";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeading } from "../components/common/SectionHeading";
import { useTelemetry } from "../hooks/useTelemetry";

export function EnergyManagementPage() {
  const { data, isLoading } = useTelemetry();
  if (isLoading || !data) return <div className="page-loading">Menghasilkan profil energi simulasi…</div>;
  const pvShare = data.energy.solarFractionPercent;
  return (
    <>
      <PageHeader eyebrow="OPERATE · ENERGY MANAGEMENT" title="Surya sebagai utama, PLN sebagai pengaman" description="Sistem memilih sumber energi berdasarkan produksi PLTS, kebutuhan pompa, kondisi tandon, dan urgensi irigasi." />
      <section className="metric-grid"><MetricCard icon={Sun} label="Produksi PLTS" value={data.energy.pvPowerKw} unit="kW" meta={`${data.weather.irradianceWm2} W/m² irradiance`} tone="solar" /><MetricCard icon={Gauge} label="Beban pompa" value={data.energy.pumpPowerKw} unit="kW" meta="Dibaca EM-01/VFD" /><MetricCard icon={PlugZap} label="Bantuan PLN" value={data.energy.gridPowerKw} unit="kW" meta={data.energy.gridPowerKw > 0 ? "Grid assist aktif" : "PLN siaga"} tone="grid" /><MetricCard icon={Zap} label="Solar fraction" value={pvShare} unit="%" meta="Porsi daya aktif dari PLTS" tone="solar" /></section>
      <section className="two-column-layout two-column-layout--wide"><article className="panel-block"><SectionHeading kicker="SOURCE PROFILE" title="PLTS, pompa, dan bantuan jaringan" /><OperationsChart data={data.history} /></article><article className="panel-block energy-policy"><SectionHeading kicker="DISPATCH LOGIC" title="Urutan keputusan" /><ol><li className="active"><span>1</span><div><b>Gunakan PLTS</b><p>Suplai langsung ke pompa saat daya memadai.</p></div></li><li className={data.energy.gridPowerKw > 0 ? "active" : ""}><span>2</span><div><b>Aktifkan grid assist</b><p>Tambahkan PLN jika kebutuhan tidak dapat ditunda.</p></div></li><li><span>3</span><div><b>Jaga buffer air</b><p>Prioritaskan level tandon dibanding menyimpan listrik.</p></div></li></ol></article></section>
      <section className="energy-summary-grid"><article><Sun /><span>Energi PLTS hari ini</span><b>{data.energy.solarEnergyTodayKwh} kWh</b></article><article><PlugZap /><span>Energi PLN hari ini</span><b>{data.energy.gridEnergyTodayKwh} kWh</b></article><article><BatteryCharging /><span>Baterai pompa</span><b>Tidak digunakan</b><small>UPS kecil hanya untuk kontrol dan komunikasi.</small></article></section>
    </>
  );
}
