import { Droplets, Sprout } from "lucide-react";
import type { TelemetrySnapshot } from "../../domain/types";

interface InteractiveFieldMapProps {
  data: TelemetrySnapshot;
  selectedId: string;
  onSelect: (zoneId: string) => void;
}

export function InteractiveFieldMap({ data, selectedId, onSelect }: InteractiveFieldMapProps) {
  return (
    <div className="field-map field-map--control" aria-label="Peta skematik zona irigasi">
      <div className="map-source"><Droplets /><b>Tandon</b><span>{data.water.tankLevelPercent}%</span></div>
      <div className={`map-canal ${data.water.flowLps > 0 ? "is-flowing" : ""}`}><i /><span>{data.water.flowLps} L/s</span></div>
      <div className="field-zones">
        {data.zones.map((zone, index) => {
          const selected = selectedId === zone.id;
          const primaryReading = zone.crop === "Padi"
            ? `${zone.fieldWaterLevelCm} cm`
            : `${zone.soilMoisturePercent}%`;
          return (
            <button
              key={zone.id}
              className={`field-zone field-zone--${index + 1} ${zone.valveOpen ? "is-open" : ""} ${selected ? "is-selected" : ""}`}
              onClick={() => onSelect(zone.id)}
              aria-pressed={selected}
            >
              <span>{zone.id}</span>
              <Sprout />
              <b>{zone.crop}</b>
              <small>{zone.crop === "Padi" ? "Muka air" : "Kelembapan"} · {primaryReading}</small>
              <i>{zone.valveOpen ? "SEDANG DIAIRI" : `${zone.demandPercent}% KEBUTUHAN`}</i>
            </button>
          );
        })}
      </div>
      <div className="map-legend"><span><i className="legend-water" />Air mengalir</span><span><i className="legend-demand" />Zona dipilih</span></div>
    </div>
  );
}
