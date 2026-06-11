"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { AlertTriangle, ArrowDown, Check, Gauge, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlipVisual } from "@/lib/education/slippageScenes";

const UP = { text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
const DOWN = { text: "text-rose-300", bg: "bg-rose-500/20", border: "border-rose-500/50" };
const CYAN = { text: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/40" };
const AMBER = { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-cyan-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhatIsSlippageScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 0, sceneKey);
  const showGap = phase >= 2;
  return (
    <Stage>
      <div className="flex w-full max-w-[280px] flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className={cn("border p-2 text-center", CYAN.border)}>
            <p className="font-mono text-[9px] text-cyan-400">EXPECTED</p>
            <p className="font-mono text-xl font-bold text-slate-200">100.00</p>
          </div>
          <div className={cn("border p-2 text-center transition-all duration-500", showGap ? DOWN.border : "border-slate-700")}>
            <p className="font-mono text-[9px] text-rose-400">ACTUAL FILL</p>
            <p className={cn("font-mono text-xl font-bold", showGap ? DOWN.text : "text-slate-500")}>
              {showGap ? "101.00" : "—"}
            </p>
          </div>
        </div>
        {showGap ? (
          <p className="text-center font-mono text-sm font-bold text-amber-300">
            SLIPPAGE = +1.00 <span className="text-[10px] text-slate-500">(1%)</span>
          </p>
        ) : (
          <p className="text-center font-mono text-[9px] text-slate-500">You clicked buy at one price…</p>
        )}
      </div>
    </Stage>
  );
}

function OrderSizeScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 1100, animate, 0, sceneKey);
  const filled = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", UP.border)}>
          <p className="font-mono text-[9px] text-emerald-300">SMALL ORDER</p>
          <p className="font-mono text-[8px] text-slate-500">Fill @ 100.02</p>
          <p className={cn("mt-1 font-mono text-lg font-bold", filled ? UP.text : "text-slate-500")}>
            {filled ? "+0.02%" : "—"}
          </p>
        </div>
        <div className={cn("border p-2", DOWN.border)}>
          <p className="font-mono text-[9px] text-rose-300">LARGE ORDER</p>
          <p className="font-mono text-[8px] text-slate-500">Walks 4 levels</p>
          <p className={cn("mt-1 font-mono text-lg font-bold", filled ? DOWN.text : "text-slate-500")}>
            {filled ? "+1.8%" : "—"}
          </p>
        </div>
      </div>
      {filled ? <p className="mt-2 font-mono text-[9px] text-cyan-300">Same market · different size · different slippage</p> : null}
    </Stage>
  );
}

function LiquidityDepthScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1300, animate, 0, sceneKey);
  const deep = phase < 2;
  const levels = deep ? [40, 35, 30, 28, 25] : [40, 55, 72, 90];
  return (
    <Stage>
      <div className="w-full max-w-[260px]">
        <p className="mb-2 text-center font-mono text-[9px] text-slate-500">
          {deep ? "DEEP BOOK" : "THIN BOOK · market buy"}
        </p>
        <div className="space-y-0.5">
          {levels.map((px, i) => (
            <div
              key={`${px}-${i}`}
              className={cn(
                "flex items-center gap-1 border px-1 py-0.5 font-mono text-[9px] transition-all duration-500",
                !deep && i >= 1 ? DOWN.border : "border-slate-700",
                phase >= 2 && i === levels.length - 1 ? "ring-1 ring-rose-400/60" : "",
              )}
            >
              <span className="text-rose-300">{px}</span>
              <div
                className={cn("h-2 flex-1", deep ? "bg-emerald-500/40" : i === 0 ? "bg-emerald-500/30" : "bg-rose-500/25")}
                style={{ maxWidth: deep ? `${60 - i * 8}%` : `${90 - i * 20}%` }}
              />
            </div>
          ))}
        </div>
        {phase >= 3 ? (
          <p className={cn("mt-2 text-center font-mono text-[9px]", deep ? UP.text : DOWN.text)}>
            {deep ? "Absorbed with minimal move" : "Price jumps level after level"}
          </p>
        ) : null}
      </div>
    </Stage>
  );
}

function MarketOrderSweepScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const swept = Math.min(phase, 4);
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2">
        <Zap className="h-5 w-5 text-cyan-400" />
        <p className="font-mono text-[9px] text-cyan-300">MARKET BUY</p>
        <div className="w-full space-y-0.5">
          {[100, 100.5, 101, 101.5, 102].map((px, i) => (
            <div
              key={px}
              className={cn(
                "border px-2 py-0.5 font-mono text-[10px] transition-all duration-300",
                i < swept ? "border-rose-500/50 bg-rose-950/40 text-rose-300 line-through" : "border-slate-700 text-slate-500",
              )}
            >
              ASK {px.toFixed(1)}
            </div>
          ))}
        </div>
        {swept >= 3 ? (
          <p className="font-mono text-[9px] text-amber-300">Avg fill 101.2 · expected 100.0</p>
        ) : null}
      </div>
    </Stage>
  );
}

function VolatilityImpactScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 0, sceneKey);
  const volatile = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", !volatile || phase < 2 ? UP.border : "border-slate-700 opacity-50")}>
          <Gauge className="mx-auto h-4 w-4 text-emerald-400" />
          <p className="text-center font-mono text-[9px] text-emerald-300">CALM</p>
          <p className="text-center font-mono text-[10px] text-slate-400">Spread 3 bps</p>
          <p className="text-center font-mono text-sm text-emerald-300">+0.05%</p>
        </div>
        <div className={cn("border p-2", volatile ? DOWN.border : "border-slate-700")}>
          <AlertTriangle className="mx-auto h-4 w-4 text-amber-400" />
          <p className="text-center font-mono text-[9px] text-amber-300">VOLATILE</p>
          <p className="text-center font-mono text-[10px] text-slate-400">Spread 18 bps</p>
          <p className={cn("text-center font-mono text-sm", volatile ? DOWN.text : "text-slate-500")}>
            {volatile ? "+1.2%" : "—"}
          </p>
        </div>
      </div>
    </Stage>
  );
}

function GoodVsBadScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1500, animate, 0, sceneKey);
  const highlight = phase;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2 transition-all", highlight === 1 ? UP.border : "border-slate-700 opacity-60")}>
          <p className="font-mono text-[9px] font-bold text-emerald-300">GOOD</p>
          {["Tight spread", "Deep book", "Stable vol"].map((t) => (
            <p key={t} className="font-mono text-[8px] text-slate-400">
              <Check className="mr-0.5 inline h-2.5 w-2.5 text-emerald-400" />
              {t}
            </p>
          ))}
        </div>
        <div className={cn("border p-2 transition-all", highlight === 2 ? DOWN.border : "border-slate-700 opacity-60")}>
          <p className="font-mono text-[9px] font-bold text-rose-300">BAD</p>
          {["Wide spread", "Thin book", "High volatility"].map((t) => (
            <p key={t} className="font-mono text-[8px] text-slate-400">
              <AlertTriangle className="mr-0.5 inline h-2.5 w-2.5 text-rose-400" />
              {t}
            </p>
          ))}
        </div>
      </div>
    </Stage>
  );
}

function ProReductionScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 1100, animate, 0, sceneKey);
  const tips = [
    { label: "Limit orders", icon: Layers },
    { label: "Smaller size", icon: ArrowDown },
    { label: "Patience", icon: Gauge },
    { label: "Avoid thin books", icon: AlertTriangle },
    { label: "Skip extreme vol", icon: Zap },
  ];
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col gap-1">
        {tips.map((t, i) => {
          const Icon = t.icon;
          const on = phase >= i + 1;
          return (
            <div
              key={t.label}
              className={cn(
                "flex items-center gap-2 border px-2 py-1 font-mono text-[10px] transition-all",
                on ? CYAN.border : "border-slate-800 text-slate-600",
                on ? CYAN.text : "",
              )}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

function RecapScene() {
  const items = ["Spread", "Depth", "Size", "Volatility", "Order type", "Slip radar"];
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm font-bold text-cyan-200">WHY WAS MY FILL DIFFERENT?</p>
        <div className="grid grid-cols-3 gap-1">
          {items.map((item) => (
            <span key={item} className="border border-cyan-700/40 bg-cyan-950/30 px-2 py-1 font-mono text-[9px] text-cyan-300">
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono text-[9px] text-slate-400">Next: find these on your live terminal</p>
      </div>
    </Stage>
  );
}

export function SlippagePlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: SlipVisual;
  reduceMotion: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  switch (visual) {
    case "whatIsSlippage":
      return <WhatIsSlippageScene animate={animate} sceneKey={sceneKey} />;
    case "orderSize":
      return <OrderSizeScene animate={animate} sceneKey={sceneKey} />;
    case "liquidityDepth":
      return <LiquidityDepthScene animate={animate} sceneKey={sceneKey} />;
    case "marketOrderSweep":
      return <MarketOrderSweepScene animate={animate} sceneKey={sceneKey} />;
    case "volatilityImpact":
      return <VolatilityImpactScene animate={animate} sceneKey={sceneKey} />;
    case "goodVsBad":
      return <GoodVsBadScene animate={animate} sceneKey={sceneKey} />;
    case "proReduction":
      return <ProReductionScene animate={animate} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return null;
  }
}
