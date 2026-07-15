"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { EQ_CHART } from "@/lib/theme/equilibrium-visual";

export interface ChartLegendValues {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ChartLegend({ values, coin }: { values: ChartLegendValues | null; coin: string }) {
  if (!values) {
    return (
      <div className="pointer-events-none absolute left-2 top-2 z-[12] text-[10px] text-slate-500">
        {coin}-PERP
      </div>
    );
  }

  const up = values.close >= values.open;

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-2 top-2 z-[12] flex flex-wrap items-center gap-x-2 gap-y-0.5",
        TERMINAL_TYPO.micro,
      )}
    >
      <span className="text-[10px] font-medium text-slate-400">{coin}-PERP</span>
      <LegendField label="O" value={fmt(values.open)} />
      <LegendField label="H" value={fmt(values.high)} />
      <LegendField label="L" value={fmt(values.low)} />
      <LegendField label="C" value={fmt(values.close)} accent={up ? EQ_CHART.up : EQ_CHART.down} />
      {values.volume != null ? (
        <LegendField label="V" value={values.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
      ) : null}
    </div>
  );
}

function LegendField({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span className="tabular-nums text-slate-500">
      <span className="mr-0.5 text-slate-600">{label}</span>
      <span style={accent ? { color: accent } : undefined} className={accent ? undefined : "text-slate-300"}>
        {value}
      </span>
    </span>
  );
}
