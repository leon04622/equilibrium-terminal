"use client";

import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { MacroFlowsVisual } from "@/lib/education/macroFlowsScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-amber-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

export function MacroFlowsPlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: MacroFlowsVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(6, 1000, animate, 0, sceneKey);

  if (visual === "whyFlows") {
    return (
      <Stage>
        <p className="font-mono text-[10px] text-amber-300">REGIME → FLOWS → POSITION</p>
        <div className="mt-2 flex gap-1">
          {["RATES", "DXY", "STRESS"].map((label, i) => (
            <span
              key={label}
              className={cn(
                "border px-2 py-0.5 font-mono text-[9px]",
                phase > i ? "border-amber-600/50 text-amber-200" : "border-slate-800 text-slate-600",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "regime") {
    const regimes = ["RISK-ON", "NEUTRAL", "RISK-OFF"];
    return (
      <Stage>
        <p className="font-mono text-[10px] text-slate-500">REGIME STRIP</p>
        <p className={cn("mt-1 font-mono text-sm font-bold", phase % 3 === 0 ? "text-emerald-300" : phase % 3 === 1 ? "text-slate-300" : "text-rose-300")}>
          {regimes[phase % 3]} · STR {(40 + phase * 8) % 100}
        </p>
      </Stage>
    );
  }

  if (visual === "stressGauge") {
    const width = Math.min(95, 20 + phase * 14);
    return (
      <Stage>
        <p className="mb-2 font-mono text-[9px] text-amber-400">STRESS GAUGE</p>
        <div className="h-2 w-48 border border-slate-700 bg-slate-900">
          <div className="h-full bg-rose-500/80" style={{ width: `${width}%` }} />
        </div>
        <p className={cn("mt-2 font-mono text-[9px]", phase >= 3 ? "text-rose-300" : "text-slate-500")}>
          {phase >= 3 ? "FLOWS ACCELERATING" : "PRESSURE BUILDING"}
        </p>
      </Stage>
    );
  }

  if (visual === "tickerFlows") {
    const rows = [
      { sym: "DXY", chg: phase % 2 === 0 ? "+0.42" : "-0.18" },
      { sym: "US10Y", chg: phase >= 2 ? "+0.05" : "-0.02" },
      { sym: "BTCβ", chg: phase >= 4 ? "+1.2" : "-0.8" },
    ];
    return (
      <Stage>
        <BarChart3 className="mb-1 h-5 w-5 text-amber-400" />
        {rows.map((r, i) => (
          <p
            key={r.sym}
            className={cn(
              "font-mono text-[9px]",
              phase > i ? "text-slate-200" : "text-slate-600",
            )}
          >
            {r.sym}{" "}
            <span className={r.chg.startsWith("+") ? "text-emerald-400" : "text-rose-400"}>{r.chg}%</span>
          </p>
        ))}
      </Stage>
    );
  }

  if (visual === "stateLayer") {
    const states = ["CALM", "STRESS", "THIN"];
    return (
      <Stage>
        <Activity className="mb-1 h-5 w-5 text-violet-400" />
        <p className={cn("font-mono text-sm font-bold", phase >= 2 ? "text-amber-300" : "text-emerald-300")}>
          {states[Math.min(phase, 2)]}
        </p>
        <p className="mt-1 font-mono text-[9px] text-slate-500">VOL · LIQ signals</p>
      </Stage>
    );
  }

  if (visual === "positioning") {
    const panels = ["MACRO", "STATE", "BRIEF"];
    return (
      <Stage>
        <div className="flex gap-1">
          {panels.map((p, i) => (
            <div
              key={p}
              className={cn(
                "border px-2 py-3 font-mono text-[9px]",
                phase > i ? "border-amber-700/50 bg-amber-950/30 text-amber-200" : "border-slate-800 text-slate-600",
              )}
            >
              {p}
            </div>
          ))}
        </div>
        {phase >= 4 ? (
          <TrendingUp className="mt-2 h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="mt-2 h-4 w-4 text-rose-400" />
        )}
      </Stage>
    );
  }

  return (
    <Stage>
      <p className="font-mono text-sm text-amber-200">MACRO FLOWS CERTIFIED</p>
      <p className="mt-1 font-mono text-[9px] text-slate-500">Read flows — then position size</p>
    </Stage>
  );
}
