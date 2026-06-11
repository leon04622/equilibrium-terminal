"use client";


import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Shield, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiqVisual } from "@/lib/education/liquidationsScenes";

const LONG = { text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/40" };
const SHORT = { text: "text-rose-300", bg: "bg-rose-500/15", border: "border-rose-500/40" };
const DANGER = { text: "text-rose-200", bg: "bg-rose-950/40", border: "border-rose-600/50" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-rose-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

function MarginBar({ pct, tone }: { pct: number; tone: "good" | "warn" | "danger" }) {
  const color = tone === "danger" ? "bg-rose-500" : tone === "warn" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="h-2 w-full bg-slate-800">
      <div className={cn("h-full transition-all duration-700", color)} style={{ width: `${Math.max(0, pct)}%` }} />
    </div>
  );
}

/** Phase 1 — £1,000 capital, different position size */
function WhatIsLeverage({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(3, 1200, animate, 2);
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-3">
        {[
          { name: "Trader A", cap: "£1,000", lev: "1x", notional: "£1,000", w: 28 },
          { name: "Trader B", cap: "£1,000", lev: "10x", notional: "£10,000", w: 100 },
        ].map((t) => (
          <div key={t.name} className="border border-slate-700 bg-slate-900/50 p-2">
            <p className="font-mono text-[10px] font-bold text-slate-200">{t.name}</p>
            <p className="font-mono text-[9px] text-slate-500">{t.cap} · {t.lev}</p>
            <p className="mt-2 font-mono text-[8px] text-slate-600">Position size</p>
            <div className="mt-0.5 h-3 bg-slate-800">
              <div
                className="h-full bg-rose-500/70 transition-all duration-700"
                style={{ width: phase >= 1 ? `${t.w}%` : "8%" }}
              />
            </div>
            <p className="mt-1 font-mono text-[9px] text-rose-300">{t.notional} exposure</p>
          </div>
        ))}
      </div>
      {phase >= 2 ? (
        <p className="absolute bottom-3 font-mono text-[9px] text-amber-300">Same capital · different risk</p>
      ) : null}
    </Stage>
  );
}

/** Phase 2 — margin as safety buffer */
function WhatIsMargin({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(4, 900, animate, 3);
  const margin = Math.max(8, 100 - phase * 28);
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <p className="font-mono text-[10px] text-slate-400">MARGIN · safety buffer</p>
        <MarginBar pct={margin} tone={margin < 25 ? "danger" : margin < 50 ? "warn" : "good"} />
        <div className="flex items-center gap-2">
          {phase > 0 ? <ArrowDown className="h-4 w-4 text-rose-400" /> : null}
          <span className="font-mono text-[9px] text-slate-500">
            {phase === 0 ? "Price stable" : "Price moving against you…"}
          </span>
        </div>
        <p className="font-mono text-[9px] text-amber-300/90">Buffer shrinks as losses grow</p>
      </div>
    </Stage>
  );
}

function WhatIsLiq() {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2 text-center">
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <p className="font-mono text-xs font-semibold text-rose-200">FORCED CLOSURE</p>
        <p className="max-w-[220px] font-mono text-[10px] text-slate-400">
          Margin exhausted → exchange closes automatically
        </p>
        <div className="mt-2 border border-rose-800/50 bg-rose-950/30 px-3 py-1 font-mono text-[9px] text-rose-300">
          The exchange closes the trade to prevent further losses
        </div>
      </div>
    </Stage>
  );
}

function LongLiq({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(5, 900, animate, 4);
  const margin = Math.max(0, 100 - phase * 22);
  const liq = margin <= 10;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <p className={cn("font-mono text-[10px] font-bold", LONG.text)}>LONG</p>
        <div className="flex items-center gap-2">
          <ArrowDown className={cn("h-4 w-4", phase > 0 ? "text-rose-400" : "text-slate-600")} />
          <span className="font-mono text-[9px] text-slate-500">Price falling</span>
        </div>
        <MarginBar pct={margin} tone={liq ? "danger" : margin < 40 ? "warn" : "good"} />
        <div className="relative h-1 bg-slate-800">
          <div className="absolute right-0 top-0 h-2 w-0.5 bg-rose-500" title="liq level" />
          <span className="absolute -top-3 right-0 font-mono text-[7px] text-rose-400">LIQ</span>
        </div>
        {liq ? <p className={cn("font-mono text-[11px] font-bold", DANGER.text)}>LIQUIDATED</p> : null}
      </div>
    </Stage>
  );
}

function ShortLiq({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(5, 900, animate, 4);
  const margin = Math.max(0, 100 - phase * 22);
  const liq = margin <= 10;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <p className={cn("font-mono text-[10px] font-bold", SHORT.text)}>SHORT</p>
        <div className="flex items-center gap-2">
          <ArrowUp className={cn("h-4 w-4", phase > 0 ? "text-rose-400" : "text-slate-600")} />
          <span className="font-mono text-[9px] text-slate-500">Price rising</span>
        </div>
        <MarginBar pct={margin} tone={liq ? "danger" : margin < 40 ? "warn" : "good"} />
        {liq ? <p className={cn("font-mono text-[11px] font-bold", DANGER.text)}>LIQUIDATED</p> : null}
      </div>
    </Stage>
  );
}

function Cascade({ animate }: { animate: boolean }) {
  const n = usePlaygroundLoop(6, 650, animate, 5);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-10 w-5 items-end justify-center border pb-0.5 font-mono text-[8px] transition-all",
                i <= n ? "border-rose-500 bg-rose-950/50 text-rose-300" : "border-slate-700 text-slate-600",
              )}
            >
              {i <= n ? "↓" : ""}
            </div>
          ))}
        </div>
        <Zap className="h-5 w-5 text-rose-400" />
        <p className="font-mono text-[10px] text-rose-200">Market accelerates</p>
      </div>
    </Stage>
  );
}

function ShortSqueeze({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(5, 800, animate, 4);
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-1">
        {["Crowded shorts", "Price rises", "Shorts liquidated", "Forced buying", "Price accelerates"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2 border px-2 py-1 font-mono text-[10px]",
              i <= phase ? "border-rose-600/50 bg-rose-950/40 text-rose-200" : "border-slate-800 text-slate-600",
            )}
          >
            <ArrowUp className={cn("h-3 w-3", i <= phase && i > 0 ? "text-emerald-400" : "text-slate-600")} />
            {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function LongSqueeze({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(5, 800, animate, 4);
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col gap-1">
        {["Crowded longs", "Price falls", "Longs liquidated", "Forced selling", "Price accelerates"].map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2 border px-2 py-1 font-mono text-[10px]",
              i <= phase ? "border-rose-600/50 bg-rose-950/40 text-rose-200" : "border-slate-800 text-slate-600",
            )}
          >
            <ArrowDown className={cn("h-3 w-3", i <= phase && i > 0 ? "text-rose-400" : "text-slate-600")} />
            {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function ProVsReckless() {
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className="border border-emerald-800/50 bg-emerald-950/20 p-2">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] font-bold text-emerald-200">PROFESSIONAL</span>
          </div>
          <ul className="mt-1 space-y-0.5 font-mono text-[8px] text-slate-400">
            <li>2–5x leverage</li>
            <li>Small size</li>
            <li>Stop loss set</li>
            <li>Avoids crowds</li>
          </ul>
        </div>
        <div className="border border-rose-800/50 bg-rose-950/20 p-2">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span className="font-mono text-[10px] font-bold text-rose-200">RECKLESS</span>
          </div>
          <ul className="mt-1 space-y-0.5 font-mono text-[8px] text-slate-400">
            <li>20x+ leverage</li>
            <li>Max size</li>
            <li>No stop</li>
            <li>Joins crowd</li>
          </ul>
        </div>
      </div>
    </Stage>
  );
}

/** Phase 10 — visual recognition (not quiz-like) */
function RecognitionChecks({ animate }: { animate: boolean }) {
  const phase = usePlaygroundLoop(3, 2200, animate, 2);
  const prompts = [
    "Greater risk → high leverage",
    "Survives volatility → low leverage",
    "Liquidation danger → thin margin",
  ];
  return (
    <Stage>
      <p className="absolute top-3 font-mono text-[9px] text-amber-300">{prompts[phase]}</p>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        {[
          { label: "2x · wide buffer", risk: false, survive: true },
          { label: "20x · thin buffer", risk: true, survive: false },
        ].map((t) => {
          const highlight =
            (phase === 0 && t.risk) || (phase === 1 && t.survive) || (phase === 2 && t.risk);
          return (
            <div
              key={t.label}
              className={cn(
                "relative border p-2 transition-all duration-500",
                highlight ? "border-rose-500 bg-rose-950/40 ring-2 ring-rose-400/60" : "border-slate-700 bg-slate-900/50",
              )}
            >
              <User className={cn("h-5 w-5", highlight ? "text-rose-300" : "text-slate-600")} />
              <p className="mt-1 font-mono text-[9px] text-slate-300">{t.label}</p>
              {highlight ? <Check className="absolute right-1 top-1 h-3 w-3 text-rose-400" /> : null}
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

function Recap() {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2 text-center">
        <Check className="h-8 w-8 text-emerald-400" />
        <p className="font-mono text-xs text-slate-200">Would you survive normal volatility?</p>
        <p className="font-mono text-[10px] text-rose-300">Next: live terminal bridge</p>
      </div>
    </Stage>
  );
}

export function LiquidationsPlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: LiqVisual;
  reduceMotion?: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  void sceneKey;
  switch (visual) {
    case "whatIsLeverage":
      return <WhatIsLeverage animate={animate} />;
    case "whatIsMargin":
      return <WhatIsMargin animate={animate} />;
    case "whatIsLiq":
      return <WhatIsLiq />;
    case "longLiq":
      return <LongLiq animate={animate} />;
    case "shortLiq":
      return <ShortLiq animate={animate} />;
    case "cascade":
      return <Cascade animate={animate} />;
    case "shortSqueeze":
      return <ShortSqueeze animate={animate} />;
    case "longSqueeze":
      return <LongSqueeze animate={animate} />;
    case "proVsReckless":
      return <ProVsReckless />;
    case "recognitionChecks":
      return <RecognitionChecks animate={animate} />;
    case "recap":
      return <Recap />;
    default:
      return <WhatIsLiq />;
  }
}
