"use client";

import { AlertTriangle, ArrowRight, Check, Clock, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TTVisual } from "@/lib/education/tradeTypesScenes";
import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";

const UP = { text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
const DOWN = { text: "text-rose-300", bg: "bg-rose-500/20", border: "border-rose-500/50" };
const AMBER = { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-amber-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function IntroScene() {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-bold text-amber-200">BTC · BUY</span>
        <p className="font-mono text-[10px] text-slate-400">How should you enter?</p>
        <div className="grid w-full max-w-[220px] gap-1.5">
          {[
            { label: "Buy instantly", icon: Zap },
            { label: "Wait for better price", icon: Clock },
            { label: "Enter at a level", icon: Shield },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-[10px] text-slate-300">
              <Icon className="h-3 w-3 text-amber-400" />
              {label}
            </div>
          ))}
        </div>
        <ArrowRight className="h-4 w-4 text-amber-500" aria-hidden />
        <span className="font-mono text-[9px] text-amber-400/80">→ market · limit · stop</span>
      </div>
    </Stage>
  );
}

function MarketOrderScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 900, animate, 3, sceneKey);
  const filled = phase >= 2;
  const slippage = phase >= 3;
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <div className="flex justify-between font-mono text-[9px] text-slate-500">
          <span>ASKS</span>
          <span className={UP.text}>MARKET BUY</span>
        </div>
        <div className="space-y-0.5">
          {[48.2, 32.1, 18.5].map((sz, i) => (
            <div
              key={i}
              className={cn(
                "flex justify-between border px-2 py-0.5 font-mono text-[10px] transition-all duration-500",
                filled && i < 2 ? "border-rose-900/30 bg-rose-950/20 text-slate-600 line-through" : DOWN.border,
                DOWN.text,
              )}
            >
              <span>{(97200 + i * 10).toLocaleString()}</span>
              <span>{sz} BTC</span>
            </div>
          ))}
        </div>
        <div className={cn("border px-2 py-1 text-center font-mono text-[10px]", filled ? UP.bg : "border-slate-700 text-slate-500")}>
          {filled ? <span className={UP.text}>FILLED instantly</span> : "Click BUY → consumes liquidity"}
        </div>
        {slippage ? (
          <div className={cn("border px-2 py-1 font-mono text-[9px]", AMBER.border, AMBER.text)}>
            Slippage cost: paid above best ask · wide spread hurts
          </div>
        ) : null}
      </div>
    </Stage>
  );
}

function LimitOrderScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 1000, animate, 4, sceneKey);
  const waiting = phase < 3;
  const filled = phase >= 3;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <div className={cn("border px-2 py-1 font-mono text-[10px]", AMBER.border, AMBER.bg, AMBER.text)}>
          LIMIT BUY @ 96,800
        </div>
        <div className="h-16 border border-slate-800 bg-slate-900/40 relative">
          <div
            className="absolute bottom-0 left-0 right-0 bg-emerald-500/20 transition-all duration-700"
            style={{ height: `${20 + phase * 12}%` }}
          />
          <span className="absolute left-2 top-1 font-mono text-[9px] text-slate-500">price →</span>
          {filled ? (
            <span className="absolute bottom-1 right-2 font-mono text-[9px] text-emerald-400">touched limit</span>
          ) : null}
        </div>
        <p className="text-center font-mono text-[10px] text-slate-400">
          {waiting ? "Order waiting in book…" : <span className={UP.text}>Filled at your price</span>}
        </p>
        {waiting && phase > 1 ? (
          <p className="text-center font-mono text-[9px] text-amber-400/80">May never fill if price stays away</p>
        ) : null}
      </div>
    </Stage>
  );
}

function StopOrderScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const triggered = phase >= 2;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-slate-400">LONG position</span>
          <span className={DOWN.text}>STOP @ 96,200</span>
        </div>
        <div className="h-20 border border-slate-800 bg-slate-900/50 relative">
          <div className="absolute left-0 right-0 top-[30%] border-t border-dashed border-amber-500/50" />
          <span className="absolute left-1 top-[22%] font-mono text-[8px] text-amber-400">trigger</span>
          <div
            className={cn("absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full transition-all duration-700", triggered ? "top-[32%] bg-rose-400" : "top-[10%] bg-emerald-400")}
          />
          {triggered ? (
            <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[9px] text-rose-300">
              Stop triggered → sell to protect
            </span>
          ) : (
            <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[9px] text-slate-500">
              Price falls toward trigger…
            </span>
          )}
        </div>
        <p className="text-center font-mono text-[9px] text-slate-400">Also used for breakout entries</p>
      </div>
    </Stage>
  );
}

function ComparisonScene() {
  const cols = [
    { title: "MARKET", traits: ["Fast", "Less control", "Slippage risk"], tone: "text-cyan-300" },
    { title: "LIMIT", traits: ["Price control", "Better fills", "May miss"], tone: "text-amber-300" },
    { title: "STOP", traits: ["Conditional", "Risk mgmt", "Auto trigger"], tone: "text-violet-300" },
  ];
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-3 gap-1">
        {cols.map((c) => (
          <div key={c.title} className="border border-slate-700 bg-slate-900/50 p-1.5">
            <p className={cn("mb-1 text-center font-mono text-[9px] font-bold", c.tone)}>{c.title}</p>
            {c.traits.map((t) => (
              <p key={t} className="font-mono text-[8px] text-slate-400">{t}</p>
            ))}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function MistakesScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(4, 1400, animate, 0, sceneKey);
  const mistakes = [
    { title: "Market into thin book", cost: "High slippage", icon: AlertTriangle },
    { title: "Limit too far away", cost: "Never fills", icon: Clock },
    { title: "No stop loss", cost: "Unlimited downside", icon: Shield },
    { title: "Stop vs limit confusion", cost: "Wrong execution", icon: Zap },
  ];
  const m = mistakes[idx]!;
  const Icon = m.icon;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2 text-center">
        <Icon className="h-6 w-6 text-rose-400" />
        <p className="font-mono text-[11px] font-semibold text-rose-200">{m.title}</p>
        <p className="font-mono text-[10px] text-amber-300">{m.cost}</p>
        <div className="mt-2 flex gap-1">
          {mistakes.map((_, i) => (
            <span key={i} className={cn("h-1 w-4", i === idx ? "bg-rose-400" : "bg-slate-700")} />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function PreTradeScene() {
  const qs = [
    { q: "Need instant execution?", a: "→ MARKET" },
    { q: "Need price control?", a: "→ LIMIT" },
    { q: "Need protection?", a: "→ STOP" },
  ];
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        {qs.map(({ q, a }) => (
          <div key={q} className="border border-slate-700 bg-slate-900/50 px-2 py-1.5">
            <p className="font-mono text-[10px] text-slate-300">{q}</p>
            <p className="font-mono text-[10px] font-semibold text-amber-300">{a}</p>
          </div>
        ))}
      </div>
    </Stage>
  );
}

function RecapScene() {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2 text-center">
        <Check className="h-8 w-8 text-emerald-400" />
        <p className="font-mono text-xs text-slate-200">Market · Limit · Stop</p>
        <p className="font-mono text-[10px] text-amber-300">Match order type to your goal</p>
        <span className="mt-1 border border-amber-700/40 bg-amber-950/30 px-2 py-0.5 font-mono text-[9px] uppercase text-amber-200">
          Next: live trade ticket
        </span>
      </div>
    </Stage>
  );
}

export function TradeTypesPlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: TTVisual;
  reduceMotion?: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  switch (visual) {
    case "intro":
      return <IntroScene />;
    case "marketOrder":
      return <MarketOrderScene animate={animate} sceneKey={sceneKey} />;
    case "limitOrder":
      return <LimitOrderScene animate={animate} sceneKey={sceneKey} />;
    case "stopOrder":
      return <StopOrderScene animate={animate} sceneKey={sceneKey} />;
    case "comparison":
      return <ComparisonScene />;
    case "mistakes":
      return <MistakesScene animate={animate} sceneKey={sceneKey} />;
    case "preTrade":
      return <PreTradeScene />;
    case "recap":
      return <RecapScene />;
    default:
      return <IntroScene />;
  }
}
