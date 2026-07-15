"use client";


import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { ArrowDown, ArrowRight, ArrowUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FCVisual } from "@/lib/education/fundingCrowdingScenes";

const LONG = {
  text: "text-emerald-300",
  bg: "bg-emerald-500/15",
  border: "border-emerald-500/40",
  solid: "bg-emerald-500/70",
};
const SHORT = {
  text: "text-rose-300",
  bg: "bg-rose-500/15",
  border: "border-rose-500/40",
  solid: "bg-rose-500/70",
};

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-violet-950/20 to-slate-950 p-4">
      {children}
    </div>
  );
}

function TraderDot({ tone, className }: { tone: typeof LONG | typeof SHORT; className?: string }) {
  return (
    <span
      className={cn("inline-block h-3 w-3 rounded-full border", tone.solid, tone.border, className)}
    />
  );
}

function CrowdBuilding({ animate }: { animate: boolean }) {
  const n = usePlaygroundLoop(6, 700, animate, 5);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-3">
        <span className={cn("font-mono text-[10px] uppercase tracking-wide", LONG.text)}>LONG side</span>
        <div className="flex flex-wrap justify-center gap-1.5 max-w-[200px]">
          {Array.from({ length: 3 + n }).map((_, i) => (
            <TraderDot key={i} tone={LONG} className="eq-mm-float" />
          ))}
        </div>
        <Users className={cn("h-5 w-5", LONG.text)} />
        <span className="font-mono text-[10px] text-slate-500">more traders joining…</span>
        <div className="flex gap-1 opacity-40">
          <TraderDot tone={SHORT} />
          <TraderDot tone={SHORT} />
        </div>
        <span className={cn("font-mono text-[10px] uppercase", SHORT.text)}>SHORT side (few)</span>
      </div>
    </Stage>
  );
}

function Balancing({ animate }: { animate: boolean }) {
  const tilt = usePlaygroundLoop(4, 1200, animate, 2);
  const leanLong = tilt < 2;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-56 items-end justify-center gap-8">
          <div className={cn("flex flex-col items-center gap-1 transition-all duration-700", leanLong ? "scale-110" : "scale-90 opacity-60")}>
            <span className={cn("font-mono text-xs font-bold", LONG.text)}>LONGS</span>
            <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <TraderDot key={i} tone={LONG} />)}</div>
          </div>
          <div className={cn("flex flex-col items-center gap-1 transition-all duration-700", !leanLong ? "scale-110" : "scale-90 opacity-60")}>
            <span className={cn("font-mono text-xs font-bold", SHORT.text)}>SHORTS</span>
            <div className="flex gap-0.5">{Array.from({ length: 2 }).map((_, i) => <TraderDot key={i} tone={SHORT} />)}</div>
          </div>
        </div>
        <div className="relative mt-2 h-1 w-48 rounded bg-slate-800">
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-violet-400 transition-all duration-700"
            style={{ left: leanLong ? "65%" : "35%" }}
          />
        </div>
        <span className="font-mono text-[10px] text-violet-300">FUNDING nudges the crowd back toward balance</span>
      </div>
    </Stage>
  );
}

function PaymentFlow({
  from,
  to,
  label,
  animate,
}: {
  from: typeof LONG | typeof SHORT;
  to: typeof LONG | typeof SHORT;
  label: string;
  animate: boolean;
}) {
  const pulse = usePlaygroundLoop(3, 900, animate, 1);
  return (
    <Stage>
      <div className="flex items-center gap-4">
        <div className={cn("rounded-md border px-3 py-2 text-center", from.bg, from.border)}>
          <span className={cn("font-mono text-xs font-bold", from.text)}>{from === LONG ? "LONGS" : "SHORTS"}</span>
          <p className="font-mono text-[9px] text-slate-500">pay</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowRight className={cn("h-5 w-5 transition-opacity", pulse === 1 ? "text-violet-300 opacity-100" : "text-slate-600 opacity-40")} aria-hidden />
          <span className="font-mono text-[9px] text-violet-400">{label}</span>
        </div>
        <div className={cn("rounded-md border px-3 py-2 text-center", to.bg, to.border)}>
          <span className={cn("font-mono text-xs font-bold", to.text)}>{to === LONG ? "LONGS" : "SHORTS"}</span>
          <p className="font-mono text-[9px] text-slate-500">receive</p>
        </div>
      </div>
    </Stage>
  );
}

function ShortSqueeze({ animate }: { animate: boolean }) {
  const step = usePlaygroundLoop(5, 850, animate, 4);
  const price = 100 + step * 2;
  const shortsLeft = Math.max(0, 5 - step);
  return (
    <Stage>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn("font-mono text-[10px]", SHORT.text)}>SHORTS ({shortsLeft})</span>
          <span className="font-mono text-lg font-bold text-cyan-200">${price}</span>
        </div>
        <div className="flex justify-center">
          <ArrowUp className={cn("h-6 w-6 text-emerald-400", step > 0 && "animate-pulse")} />
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: shortsLeft }).map((_, i) => (
            <TraderDot key={i} tone={SHORT} className="opacity-70" />
          ))}
        </div>
        <p className="text-center font-mono text-[10px] text-amber-300">
          {step < 2 ? "price rising…" : step < 4 ? "shorts forced to buy back" : "squeeze accelerates"}
        </p>
      </div>
    </Stage>
  );
}

function LongSqueeze({ animate }: { animate: boolean }) {
  const step = usePlaygroundLoop(5, 850, animate, 4);
  const price = 100 - step * 2;
  const longsLeft = Math.max(0, 5 - step);
  return (
    <Stage>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn("font-mono text-[10px]", LONG.text)}>LONGS ({longsLeft})</span>
          <span className="font-mono text-lg font-bold text-cyan-200">${price}</span>
        </div>
        <div className="flex justify-center">
          <ArrowDown className={cn("h-6 w-6 text-rose-400", step > 0 && "animate-pulse")} />
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: longsLeft }).map((_, i) => (
            <TraderDot key={i} tone={LONG} className="opacity-70" />
          ))}
        </div>
        <p className="text-center font-mono text-[10px] text-amber-300">
          {step < 2 ? "price falling…" : step < 4 ? "liquidations force selling" : "cascade accelerates"}
        </p>
      </div>
    </Stage>
  );
}

function IntroRecap({ kind }: { kind: "intro" | "recap" }) {
  return (
    <Stage>
      <div className="text-center">
        <p className="font-mono text-sm font-semibold text-violet-200">
          {kind === "intro" ? "Funding · Crowding · Squeezes" : "Funding balances crowds"}
        </p>
        <p className="mt-2 font-mono text-[11px] text-slate-400">
          {kind === "intro"
            ? "Who pays whom — and why it matters before you trade."
            : "Ready to read this in the live derivatives desk."}
        </p>
      </div>
    </Stage>
  );
}

export function FundingCrowdingPlayground({
  visual,
  reduceMotion = false,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: FCVisual;
  reduceMotion?: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  void sceneKey;
  switch (visual) {
    case "crowdBuilding":
      return <CrowdBuilding animate={animate} />;
    case "balancing":
      return <Balancing animate={animate} />;
    case "positiveFunding":
      return <PaymentFlow from={LONG} to={SHORT} label="positive funding" animate={animate} />;
    case "negativeFunding":
      return <PaymentFlow from={SHORT} to={LONG} label="negative funding" animate={animate} />;
    case "shortSqueeze":
      return <ShortSqueeze animate={animate} />;
    case "longSqueeze":
      return <LongSqueeze animate={animate} />;
    case "recap":
      return <IntroRecap kind="recap" />;
    default:
      return <IntroRecap kind="intro" />;
  }
}
