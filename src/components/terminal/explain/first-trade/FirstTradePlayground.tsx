"use client";

import { Check, ClipboardList, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { FTVisual } from "@/lib/education/firstTradeScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-cyan-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

export function FirstTradePlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: FTVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(5, 1000, animate, 0, sceneKey);

  if (visual === "whyPaperFirst") {
    return (
      <Stage>
        <div className="flex gap-3">
          <div className="border border-cyan-700/50 bg-cyan-950/40 px-3 py-2 text-center">
            <p className="font-mono text-[9px] text-cyan-300">PAPER</p>
            <p className="font-mono text-lg font-bold text-cyan-200">$0 risk</p>
          </div>
          <div className={cn("border px-3 py-2 text-center", phase >= 3 ? "border-rose-800/50 opacity-100" : "border-slate-800 opacity-40")}>
            <p className="font-mono text-[9px] text-rose-300">LIVE</p>
            <p className="font-mono text-lg font-bold text-rose-200">later</p>
          </div>
        </div>
      </Stage>
    );
  }

  if (visual === "morningGate") {
    const items = ["Briefing", "State", "Wire", "Plan"];
    return (
      <Stage>
        <ClipboardList className="mb-2 h-6 w-6 text-violet-400" />
        <div className="flex flex-wrap justify-center gap-1">
          {items.map((item, i) => (
            <span
              key={item}
              className={cn(
                "border px-2 py-0.5 font-mono text-[9px]",
                phase > i ? "border-emerald-600/50 text-emerald-300" : "border-slate-700 text-slate-600",
              )}
            >
              {phase > i ? <Check className="mr-0.5 inline h-2.5 w-2.5" /> : null}
              {item}
            </span>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "preTradeChecks") {
    const checks = ["SPREAD", "DEPTH", "REGIME"];
    return (
      <Stage>
        <div className="grid grid-cols-3 gap-1">
          {checks.map((c, i) => (
            <div
              key={c}
              className={cn(
                "border px-2 py-1 text-center font-mono text-[9px]",
                phase > i + 1 ? "border-emerald-600/40 text-emerald-300" : "border-slate-700 text-slate-500",
              )}
            >
              {c}
            </div>
          ))}
        </div>
      </Stage>
    );
  }

  if (visual === "paperFill") {
    return (
      <Stage>
        <p className="font-mono text-[9px] text-cyan-400">PAPER FILL</p>
        <p className={cn("mt-1 font-mono text-sm font-bold text-slate-200", phase >= 2 ? "opacity-100" : "opacity-30")}>
          BUY 0.01 BTC @ live mid
        </p>
        <p className={cn("font-mono text-[9px] text-slate-500", phase >= 3 ? "opacity-100" : "opacity-0")}>
          → recorded in blotter
        </p>
      </Stage>
    );
  }

  return (
    <Stage>
      <Shield className="mb-2 h-6 w-6 text-amber-400" />
      <p className="font-mono text-[10px] text-amber-200">CHECKLIST CLEARED</p>
      <p className={cn("font-mono text-[9px] text-slate-500", phase >= 2 ? "opacity-100" : "opacity-40")}>
        SIGN IN · 1CT · MIN SIZE
      </p>
    </Stage>
  );
}
