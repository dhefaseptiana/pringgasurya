import { BatteryCharging, Droplets, Gauge, PlugZap, Sprout, Sun } from "lucide-react";
import type { TelemetrySnapshot } from "../domain/types";

export function SystemFlow({ data }: { data: TelemetrySnapshot }) {
  const pumpRunning = data.energy.pumpPowerKw > 0;
  return (
    <div className="system-flow" aria-label="Alur energi dan air PRINGGASURYA">
      <div className="flow-source-stack">
        <div className="flow-node flow-node--solar"><Sun /><span>PLTS</span><b>{data.energy.pvPowerKw} kW</b><small>Sumber utama</small></div>
        <div className="flow-node flow-node--grid"><PlugZap /><span>PLN</span><b>{data.energy.gridPowerKw} kW</b><small>Cadangan</small></div>
      </div>
      <span className="flow-link">→</span>
      <div className="flow-node"><Gauge /><span>Panel & VFD</span><b>Solar-first</b><small>Proteksi lokal</small></div>
      <span className="flow-link">→</span>
      <div className={`flow-node ${pumpRunning ? "flow-node--active" : "flow-node--fault"}`}><BatteryCharging /><span>Pompa</span><b>{pumpRunning ? "Berjalan" : "Berhenti"}</b><small>{data.energy.pumpPowerKw} kW</small></div>
      <span className="flow-link">→</span>
      <div className="flow-node flow-node--water"><Droplets /><span>Tandon</span><b>{data.water.tankLevelPercent}%</b><small>{data.water.tankVolumeM3} m³</small></div>
      <span className="flow-link">→</span>
      <div className="flow-node flow-node--crop"><Sprout /><span>Lahan</span><b>{data.zones.filter((zone) => zone.valveOpen).length} zona aktif</b><small>{data.water.flowLps} L/s</small></div>
    </div>
  );
}
