"use client";

import { cn } from "@/lib/utils";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import type { LiqDeepVisual } from "@/lib/education/liquidityDeepScenes";

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-cyan-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

function BookCol({ side, bars, phase }: { side: "bid" | "ask"; bars: number[]; phase: number }) {
  const color = side === "bid" ? "bg-emerald-600/50" : "bg-rose-600/50";
  return (
    <div className="flex h-28 w-14 flex-col justify-end gap-0.5">
      {bars.map((w, i) => (
        <div
          key={i}
          className={cn("h-2", color, phase > i ? "opacity-100" : "opacity-25")}
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

export function LiquidityDeepPlayground({
  visual,
  animate,
  sceneKey,
}: {
  visual: LiqDeepVisual;
  animate: boolean;
  sceneKey: string;
}) {
  const phase = usePlaygroundLoop(5, 1000, animate, 0, sceneKey);

  if (visual === "whyDepth") {
    return (
      <Stage>
        <p className="font-mono text-[10px] text-cyan-300">TOP OF BOOK ≠ TOTAL DEPTH</p>
        <p className={cn("mt-2 font-mono text-[9px] text-slate-500", phase >= 2 ? "opacity-100" : "opacity-40")}>
          Read the stack below
        </p>
      </Stage>
    );
  }

  if (visual === "bidStack") {
    return (
      <Stage>
        <div className="flex items-end gap-3">
          <BookCol side="bid" bars={[40, 65, 90, 55, 30]} phase={phase} />
          <span className="font-mono text-[9px] text-emerald-400">BIDS</span>
        </div>
      </Stage>
    );
  }

  if (visual === "askWall") {
    return (
      <Stage>
        <div className="flex items-end gap-3">
          <span className="font-mono text-[9px] text-rose-400">WALL</span>
          <BookCol side="ask" bars={[25, 30, 95, 40, 20]} phase={phase} />
        </div>
      </Stage>
    );
  }

  if (visual === "thinBook") {
    return (
      <Stage>
        <div className="flex gap-4">
          <BookCol side="bid" bars={[15, 10, 8]} phase={phase} />
          <div className="border-x border-amber-600/40 px-2 font-mono text-[9px] text-amber-300">WIDE SPR</div>
          <BookCol side="ask" bars={[12, 9, 7]} phase={phase} />
        </div>
      </Stage>
    );
  }

  if (visual === "domRead") {
    return (
      <Stage>
        <div className="h-24 w-32 border border-cyan-800/50 bg-slate-900">
          <div
            className={cn(
              "mx-auto h-0.5 w-full bg-cyan-400 transition-all",
              phase >= 2 ? "mt-12" : "mt-6",
            )}
          />
          <p className="mt-2 text-center font-mono text-[8px] text-slate-500">MID · IMB · SKEW</p>
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      <p className="font-mono text-sm font-bold text-cyan-200">LIQUIDITY CERTIFIED</p>
      <p className={cn("font-mono text-[9px] text-slate-500", phase >= 2 ? "opacity-100" : "opacity-40")}>
        FIND IT LIVE →
      </p>
    </Stage>
  );
}
