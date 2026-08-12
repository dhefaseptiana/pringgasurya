import { Droplets, Gauge, MapPin, Sprout } from "lucide-react";
import { useState } from "react";
import type { TelemetrySnapshot } from "../../domain/types";

export function InteractiveFieldMap({ data, onRequestToggle }: { data: TelemetrySnapshot; onRequestToggle: (zoneId: string, open: boolean) => void }) {
  const [selectedId, setSelectedId] = useState("Zona 01");
  const selected = data.zones.find((zone) => zone.id === selectedId) ?? data.zones[0];
  return (
    <div className="field-map-layout">
      <div className="field-map" aria-label="Peta skematik zona irigasi">
        <div className="map-source"><Droplets /><b>Tandon</b><span>{data.water.tankLevelPercent}%</span></div>
        <div className={`map-canal ${data.water.flowLps > 0 ? "is-flowing" : ""}`}><i /><span>{data.water.flowLps} L/s</span></div>
        <div className="field-zones">
          {data.zones.map((zone, index) => <button key={zone.id} className={`field-zone field-zone--${index + 1} ${zone.valveOpen ? "is-open" : ""} ${selectedId === zone.id ? "is-selected" : ""}`} onClick={() => setSelectedId(zone.id)} aria-pressed={selectedId === zone.id}><span>{zone.id}</span><Sprout /><b>{zone.crop}</b><small>{zone.demandPercent}% demand</small><i>{zone.valveOpen ? "IRRIGATING" : zone.status.toUpperCase()}</i></button>)}
        </div>
        <div className="map-legend"><span><i className="legend-water" />Air mengalir</span><span><i className="legend-demand" />Zona dipilih</span></div>
      </div>
      <aside className="zone-inspector">
        <span>ZONE INSPECTOR</span><h3>{selected.id}</h3><p>{selected.crop} · Pilot Unit 01</p>
        <dl><div><dt>Parameter utama</dt><dd>{selected.crop === "Padi" ? `${data.water.fieldWaterLevelCm} cm muka air` : `${data.water.soilMoisturePercent}% VWC`}</dd></div><div><dt>Kebutuhan</dt><dd>{selected.demandPercent}%</dd></div><div><dt>Katup</dt><dd>{selected.valveOpen ? "Terbuka" : "Tertutup"}</dd></div><div><dt>Sensor</dt><dd>{selected.crop === "Padi" ? "WL-01 hydrostatic" : "SM-01 multi-depth"}</dd></div></dl>
        <button className={`zone-action ${selected.valveOpen ? "zone-action--stop" : ""}`} onClick={() => onRequestToggle(selected.id, !selected.valveOpen)}>{selected.valveOpen ? <Gauge /> : <Droplets />}<span>{selected.valveOpen ? "Tutup katup simulasi" : "Buka katup simulasi"}</span></button>
        <div className="zone-location"><MapPin /><span>Peta ini skematik, bukan koordinat atau batas petak aktual.</span></div>
      </aside>
    </div>
  );
}
