"use client";

import { Globe2, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { CrossMarketVisual } from "@/lib/education/crossMarketScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-cyan-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

export function CrossMarketPlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: CrossMarketVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(6, 1000, animate, 0, sceneKey);

  if (visual === "whyCrossMarket") {
    return (
      <Stage>
        <p className="font-mono text-[10px] text-cyan-300">VENUES → BASIS → MACRO</p>
        <div className="mt-2 flex gap-1">
          {["HL", "CEX", "INDEX"].map((label, i) => (
            <span
              key={label}
              className={cn(
                "border px-2 py-0.5 font-mono text-[9px]",
                phase > i ? "border-cyan-600/50 text-cyan-200" : "border-slate-800 text-slate-600",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "venues") {
    const rows = ["HL · LIVE", "STAGING · INFRA", "PROP · METRICS"];
    return (
      <Stage>
        <Globe2 className="mb-1 h-5 w-5 text-cyan-400" />
        {rows.map((r, i) => (
          <p
            key={r}
            className={cn(
              "font-mono text-[9px]",
              phase > i ? "text-cyan-200" : "text-slate-600",
            )}
          >
            {r}
          </p>
        ))}
      </Stage>
    );
  }

  if (visual === "basis") {
    return (
      <Stage>
        <div className="flex gap-3 font-mono text-[10px]">
          <span className={cn(phase >= 1 ? "text-emerald-300" : "text-slate-600")}>SPOT 64,210</span>
          <span className={cn(phase >= 2 ? "text-amber-300" : "text-slate-600")}>PERP +12 bps</span>
        </div>
        <p className={cn("mt-2 font-mono text-[9px] text-slate-400", phase >= 3 ? "opacity-100" : "opacity-40")}>
          BASIS WIDENING
        </p>
      </Stage>
    );
  }

  if (visual === "relativeValue") {
    return (
      <Stage>
        <div className="flex items-end gap-2">
          <div className={cn("h-12 w-6 bg-emerald-500/40", phase >= 1 ? "opacity-100" : "opacity-30")} />
          <div className={cn("h-8 w-6 bg-slate-600/40", phase >= 2 ? "opacity-100" : "opacity-30")} />
          <div className={cn("h-5 w-6 bg-rose-500/30", phase >= 3 ? "opacity-100" : "opacity-30")} />
        </div>
        <p className="mt-1 font-mono text-[9px] text-cyan-300">LEADER · NEUTRAL · LAGGARD</p>
      </Stage>
    );
  }

  if (visual === "macroLink") {
    return (
      <Stage>
        {phase % 2 === 0 ? (
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-5 w-5 text-rose-400" />
        )}
        <p className="mt-1 font-mono text-[9px] text-amber-300">RATES · STRESS · RISK APPETITE</p>
      </Stage>
    );
  }

  if (visual === "deskStack") {
    const panels = ["COVERAGE", "MACRO", "WIRE"];
    return (
      <Stage>
        <div className="flex gap-1">
          {panels.map((p, i) => (
            <div
              key={p}
              className={cn(
                "border px-2 py-3 font-mono text-[9px]",
                phase > i ? "border-cyan-700/50 bg-cyan-950/30 text-cyan-200" : "border-slate-800 text-slate-600",
              )}
            >
              {p}
            </div>
          ))}
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      <p className="font-mono text-sm text-cyan-200">CROSS-MARKET CERTIFIED</p>
      <p className="mt-1 font-mono text-[9px] text-slate-500">Read the map — then route size</p>
    </Stage>
  );
}
