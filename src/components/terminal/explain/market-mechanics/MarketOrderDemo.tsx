"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ShoppingCart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoKind } from "@/lib/education/lessonBridgeSteps";

/**
 * PHASE 4 / 6 — compact, looping animation that teaches a book behaviour
 * visually (no reading required):
 *   - "consume": a market buy eats the cheapest asks; bars vanish; price steps up.
 *   - "wall":    a large resting order absorbs flow, then is pulled and price
 *                accelerates through.
 */

function useLoop(steps: number, intervalMs: number, animate: boolean): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!animate || steps <= 1) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), intervalMs);
    return () => window.clearInterval(id);
  }, [steps, intervalMs, animate]);
  return animate ? step : steps - 1;
}

const ASK_LEVELS = [
  { price: 103, size: 100 },
  { price: 104, size: 70 },
  { price: 105, size: 55 },
  { price: 106, size: 40 },
];

function ConsumeDemo({ animate }: { animate: boolean }) {
  // step 0 = nothing eaten … 4 = all eaten, then loop
  const step = useLoop(5, 850, animate);
  const eaten = step;
  const price = ASK_LEVELS[Math.min(eaten, ASK_LEVELS.length - 1)]?.price ?? 106;
  return (
    <div className="flex items-stretch justify-center gap-3">
      <div className="flex flex-col items-center justify-end gap-1.5">
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-emerald-300">
          <ShoppingCart className="h-3 w-3" /> market buy
        </span>
        <ArrowUp className={cn("h-4 w-4 text-emerald-400 transition-opacity", eaten > 0 ? "opacity-100" : "opacity-30")} />
      </div>

      <div className="flex w-44 flex-col gap-1">
        {ASK_LEVELS.map((lvl, i) => {
          const isEaten = i < eaten;
          return (
            <div
              key={lvl.price}
              className={cn(
                "relative overflow-hidden rounded-sm border px-2 py-1 font-mono text-[11px] transition-all duration-300",
                isEaten
                  ? "scale-x-95 border-slate-800 bg-slate-900/40 text-slate-600 opacity-40"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-200",
              )}
            >
              <span
                className="absolute inset-y-0 left-0 bg-rose-500/20 transition-all duration-300"
                style={{ width: isEaten ? "0%" : `${(lvl.size / 100) * 100}%` }}
              />
              <span className="relative flex justify-between">
                <span>${lvl.price}</span>
                <span className="opacity-70">{isEaten ? "—" : lvl.size}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-center gap-1">
        <span className="font-mono text-[9px] uppercase tracking-wide text-slate-500">price</span>
        <span className="font-mono text-lg font-bold tabular-nums text-cyan-200 transition-all duration-300">
          ${price}
        </span>
        <span className="font-mono text-[9px] text-slate-500">steps up</span>
      </div>
    </div>
  );
}

function WallDemo({ animate }: { animate: boolean }) {
  // 0-1 wall holding & absorbing, 2 wall pulled, 3 price accelerates
  const step = useLoop(4, 1100, animate);
  const pulled = step >= 2;
  const accelerate = step >= 3;
  const bidLevels = [101, 100, 99, 98];
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex w-44 flex-col gap-1">
        {bidLevels.map((p, i) => {
          const isWall = i === 1;
          return (
            <div
              key={p}
              className={cn(
                "relative overflow-hidden rounded-sm border px-2 py-1 font-mono text-[11px] transition-all duration-500",
                isWall
                  ? pulled
                    ? "border-slate-800 bg-slate-900/40 text-slate-600 opacity-30"
                    : "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                  : "border-emerald-600/30 bg-emerald-500/10 text-emerald-300/90",
              )}
            >
              <span
                className="absolute inset-y-0 left-0 bg-emerald-500/25 transition-all duration-500"
                style={{ width: isWall ? (pulled ? "0%" : "100%") : "45%" }}
              />
              <span className="relative flex items-center justify-between">
                <span>${p}</span>
                <span className="flex items-center gap-1 opacity-80">
                  {isWall && !pulled ? <Shield className="h-3 w-3" /> : null}
                  {isWall ? (pulled ? "pulled" : "WALL") : ""}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-wide transition-colors duration-500",
            accelerate ? "text-rose-300" : pulled ? "text-amber-300" : "text-emerald-300",
          )}
        >
          {accelerate ? "price drops fast" : pulled ? "support gone" : "wall holds price"}
        </span>
        <ArrowUp
          className={cn(
            "h-5 w-5 transition-all duration-500",
            accelerate ? "rotate-180 text-rose-400" : "rotate-180 text-amber-400/40",
          )}
        />
      </div>
    </div>
  );
}

export function MarketOrderDemo({ kind, reduceMotion }: { kind: DemoKind; reduceMotion: boolean }) {
  const animate = !reduceMotion;
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 p-2">
      {kind === "wall" ? <WallDemo animate={animate} /> : <ConsumeDemo animate={animate} />}
    </div>
  );
}
