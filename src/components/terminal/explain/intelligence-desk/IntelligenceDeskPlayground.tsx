"use client";

import { ClipboardList, Radio, ScanEye, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { IntelligenceDeskVisual } from "@/lib/education/intelligenceDeskScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-violet-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

export function IntelligenceDeskPlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: IntelligenceDeskVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(6, 1000, animate, 0, sceneKey);

  if (visual === "whyDesk") {
    return (
      <Stage>
        <p className="font-mono text-[10px] text-violet-300">WIRE → SURVEILLANCE → WORKFLOW</p>
        <div className="mt-2 flex gap-1">
          {["WIRE", "WATCH", "WORK"].map((label, i) => (
            <span
              key={label}
              className={cn(
                "border px-2 py-0.5 font-mono text-[9px]",
                phase > i ? "border-violet-600/50 text-violet-200" : "border-slate-800 text-slate-600",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "tacticalWire") {
    return (
      <Stage>
        <Zap className="mb-1 h-5 w-5 text-cyan-400" />
        {["BTC · BULL · CNF 82", "ETH · NEUT · CNF 61", "SOL · BEAR · CNF 74"].map((row, i) => (
          <p
            key={row}
            className={cn(
              "font-mono text-[9px]",
              phase > i ? (i === 0 && phase >= 4 ? "text-rose-300" : "text-cyan-200") : "text-slate-600",
            )}
          >
            {row}
          </p>
        ))}
      </Stage>
    );
  }

  if (visual === "surveillance") {
    return (
      <Stage>
        <ScanEye className="mb-1 h-5 w-5 text-cyan-400" />
        <p className={cn("font-mono text-[9px]", phase >= 1 ? "text-emerald-300" : "text-slate-600")}>
          REGIME RISK-ON
        </p>
        <p className={cn("font-mono text-[9px]", phase >= 2 ? "text-amber-300" : "text-slate-600")}>
          STRESS {(30 + phase * 10) % 100}
        </p>
        <p className={cn("font-mono text-[9px]", phase >= 3 ? "text-slate-300" : "text-slate-600")}>
          FUNDING LONG PAYS
        </p>
      </Stage>
    );
  }

  if (visual === "movers") {
    const movers = [
      { sym: "SOL", chg: "+4.2" },
      { sym: "BTC", chg: "+1.1" },
      { sym: "DOGE", chg: "-2.8" },
    ];
    return (
      <Stage>
        <div className="flex gap-2">
          {movers.map((m, i) => (
            <div
              key={m.sym}
              className={cn(
                "border px-2 py-1 font-mono text-[9px]",
                phase > i ? "border-cyan-700/50 text-cyan-200" : "border-slate-800 text-slate-600",
              )}
            >
              {m.sym}
              <span className={m.chg.startsWith("+") ? " text-emerald-400" : " text-rose-400"}>{m.chg}%</span>
            </div>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "headlines") {
    const lines = ["Funding squeeze on alts", "Whale cluster near 64k", "Macro headline cross-check"];
    return (
      <Stage>
        <Radio className="mb-1 h-5 w-5 text-amber-400" />
        {lines.map((line, i) => (
          <p
            key={line}
            className={cn("font-mono text-[9px]", phase > i ? "text-slate-200" : "text-slate-600")}
          >
            {line}
          </p>
        ))}
      </Stage>
    );
  }

  if (visual === "operatorFlow") {
    const phases = ["MORNING", "TRADING", "REVIEW"];
    return (
      <Stage>
        <ClipboardList className="mb-1 h-5 w-5 text-violet-400" />
        <div className="flex gap-1">
          {phases.map((p, i) => (
            <span
              key={p}
              className={cn(
                "border px-2 py-0.5 font-mono text-[9px]",
                phase > i ? "border-violet-700/50 text-violet-200" : "border-slate-800 text-slate-600",
              )}
            >
              {p}
            </span>
          ))}
        </div>
        <p className={cn("mt-2 font-mono text-[9px]", phase >= 4 ? "text-emerald-300" : "text-slate-500")}>
          SCORE {(40 + phase * 10) % 100}
        </p>
      </Stage>
    );
  }

  return (
    <Stage>
      <p className="font-mono text-sm text-violet-200">INTELLIGENCE DESK CERTIFIED</p>
      <p className="mt-1 font-mono text-[9px] text-slate-500">Wire → watch → work — then route</p>
    </Stage>
  );
}
