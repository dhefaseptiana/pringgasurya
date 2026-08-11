import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "../../domain/types";

export function OperationsChart({ data, mode = "energy" }: { data: HistoryPoint[]; mode?: "energy" | "water" }) {
  const isEnergy = mode === "energy";
  return (
    <div className="chart-wrap" aria-label={isEnergy ? "Grafik daya sistem simulasi" : "Grafik level tandon dan debit simulasi"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8EA" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#65737A", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#65737A", fontSize: 11 }} />
          <Tooltip contentStyle={{ border: "1px solid #D8E0E3", borderRadius: 4, boxShadow: "none", fontSize: 12 }} />
          {isEnergy ? (
            <>
              <Line type="monotone" dataKey="pvKw" name="PLTS (kW)" stroke="#E9A820" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="pumpKw" name="Pompa (kW)" stroke="#28536B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gridKw" name="PLN (kW)" stroke="#6B7479" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="tankPercent" name="Tandon (%)" stroke="#247BA0" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="flowLps" name="Debit (L/s)" stroke="#3A7D5D" strokeWidth={2} dot={false} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
