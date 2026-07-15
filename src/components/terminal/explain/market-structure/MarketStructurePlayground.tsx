"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { MktStructVisual } from "@/lib/education/marketStructureScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-violet-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

function MiniChart({ points, highlight }: { points: string; highlight?: number }) {
  return (
    <svg viewBox="0 0 120 60" className="h-24 w-40 text-violet-400">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className={highlight !== undefined ? "opacity-40" : "opacity-90"}
      />
      {highlight !== undefined ? (
        <circle cx={highlight} cy={20} r="3" className="fill-emerald-400" />
      ) : null}
    </svg>
  );
}

export function MarketStructurePlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: MktStructVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(5, 1000, animate, 0, sceneKey);

  if (visual === "whyStructure") {
    return (
      <Stage>
        <p className="font-mono text-[10px] text-violet-300">STRUCTURE → CONTEXT → EXECUTION</p>
        <div className="mt-2 flex gap-1">
          {["TREND", "RANGE", "BREAK"].map((label, i) => (
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

  if (visual === "uptrend") {
    return (
      <Stage>
        <TrendingUp className="mb-1 h-5 w-5 text-emerald-400" />
        <MiniChart points="10,50 30,40 50,45 70,25 90,15" />
        <p className={cn("mt-1 font-mono text-[9px] text-emerald-300", phase >= 2 ? "opacity-100" : "opacity-40")}>
          HH · HL
        </p>
      </Stage>
    );
  }

  if (visual === "range") {
    return (
      <Stage>
        <MiniChart points="10,30 30,45 50,28 70,42 90,30" />
        <p className={cn("font-mono text-[9px] text-amber-300", phase >= 2 ? "opacity-100" : "opacity-40")}>
          SUPPORT ↔ RESISTANCE
        </p>
      </Stage>
    );
  }

  if (visual === "breakOfStructure") {
    return (
      <Stage>
        <TrendingDown className="mb-1 h-5 w-5 text-rose-400" />
        <MiniChart points="10,20 35,25 55,22 75,48 100,55" highlight={75} />
        <p className={cn("font-mono text-[9px] text-rose-300", phase >= 3 ? "opacity-100" : "opacity-40")}>
          BOS — prior low violated
        </p>
      </Stage>
    );
  }

  if (visual === "contextStack") {
    const panels = ["CHART", "SURV", "DOM"];
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
      <p className="font-mono text-sm font-bold text-violet-200">STRUCTURE CERTIFIED</p>
      <p className={cn("font-mono text-[9px] text-slate-500", phase >= 2 ? "opacity-100" : "opacity-40")}>
        FIND IT LIVE →
      </p>
    </Stage>
  );
}
