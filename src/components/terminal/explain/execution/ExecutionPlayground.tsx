"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { AlertTriangle, Check, Clock, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecVisual } from "@/lib/education/executionScenes";

const UP = { text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
const DOWN = { text: "text-rose-300", bg: "bg-rose-500/20", border: "border-rose-500/50" };
const VIOLET = { text: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/40" };
const AMBER = { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-violet-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhatIsExecutionScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 0, sceneKey);
  const reveal = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", reveal ? DOWN.border : "border-slate-700")}>
          <p className="font-mono text-[9px] text-rose-300">TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Good idea · poor execution</p>
          <p className={cn("mt-1 font-mono text-sm font-bold", reveal ? DOWN.text : "text-slate-500")}>
            {reveal ? "-2.4%" : "—"}
          </p>
        </div>
        <div className={cn("border p-2", UP.border)}>
          <p className="font-mono text-[9px] text-emerald-300">TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Same idea · better execution</p>
          <p className={cn("mt-1 font-mono text-sm font-bold", reveal ? UP.text : "text-slate-500")}>
            {reveal ? "+1.1%" : "—"}
          </p>
        </div>
      </div>
    </Stage>
  );
}

function ChasingPriceScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const prices = [100, 100.4, 100.9, 101.5, 102.1];
  const idx = Math.min(phase, prices.length - 1);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <Zap className="h-5 w-5 text-amber-400" />
        <p className="font-mono text-[9px] text-amber-300">CHASING HIGHER</p>
        <div className="flex gap-1">
          {prices.map((p, i) => (
            <span
              key={p}
              className={cn(
                "border px-1.5 py-0.5 font-mono text-[9px]",
                i <= idx ? "border-rose-500/60 bg-rose-950/40 text-rose-300" : "border-slate-700 text-slate-600",
              )}
            >
              {p.toFixed(1)}
            </span>
          ))}
        </div>
        {phase >= 3 ? <p className="font-mono text-[9px] text-rose-300">Each click paid a worse price</p> : null}
      </div>
    </Stage>
  );
}

function PatientExecutionScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1300, animate, 0, sceneKey);
  const improved = phase >= 3;
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col items-center gap-2">
        <Clock className="h-6 w-6 text-violet-400" />
        <div className="w-full space-y-1">
          <div className="flex justify-between font-mono text-[9px] text-slate-500">
            <span>Spread</span>
            <span className={improved ? "text-emerald-400" : "text-amber-300"}>
              {improved ? "4 bps" : "14 bps"}
            </span>
          </div>
          <div className="flex justify-between font-mono text-[9px] text-slate-500">
            <span>Fill</span>
            <span className={improved ? "text-emerald-400" : "text-slate-500"}>
              {improved ? "100.05" : "waiting…"}
            </span>
          </div>
        </div>
        {improved ? <p className="font-mono text-[9px] text-emerald-300">Patience improved entry</p> : null}
      </div>
    </Stage>
  );
}

function ScalingInScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  const layers = phase >= 1;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", DOWN.border)}>
          <p className="font-mono text-[9px] text-rose-300">ALL-IN</p>
          <p className="font-mono text-lg font-bold text-rose-300">100%</p>
          <p className="font-mono text-[8px] text-slate-500">Moves market</p>
        </div>
        <div className={cn("border p-2", UP.border)}>
          <p className="font-mono text-[9px] text-emerald-300">SCALE IN</p>
          <div className="mt-1 flex gap-0.5">
            {[25, 25, 25, 25].map((pct, i) => (
              <span
                key={pct}
                className={cn(
                  "h-6 flex-1 border font-mono text-[7px]",
                  layers && i <= phase - 1 ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300" : "border-slate-700 text-slate-600",
                )}
              >
                {pct}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}

function ScalingOutScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 1, sceneKey);
  const remaining = Math.max(0, 100 - phase * 25);
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2">
        <Layers className="h-5 w-5 text-violet-400" />
        <p className="font-mono text-[9px] text-slate-400">Position remaining</p>
        <div className="h-4 w-full border border-slate-700 bg-slate-900">
          <div className="h-full bg-violet-500/40 transition-all duration-500" style={{ width: `${remaining}%` }} />
        </div>
        <p className="font-mono text-sm font-bold text-violet-300">{remaining}%</p>
        {phase >= 2 ? <p className="font-mono text-[9px] text-emerald-300">Partial exits lock gains · cut risk</p> : null}
      </div>
    </Stage>
  );
}

function VolatilityExecutionScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1500, animate, 0, sceneKey);
  const vol = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", !vol ? UP.border : "border-slate-700 opacity-50")}>
          <p className="font-mono text-[9px] text-emerald-300">CALM</p>
          <p className="font-mono text-sm text-emerald-300">Clean fill</p>
        </div>
        <div className={cn("border p-2", vol ? DOWN.border : "border-slate-700")}>
          <p className="font-mono text-[9px] text-rose-300">VOLATILE</p>
          <p className={cn("font-mono text-sm", vol ? DOWN.text : "text-slate-500")}>
            {vol ? "Sloppy fill" : "—"}
          </p>
        </div>
      </div>
    </Stage>
  );
}

function ThinLiquidityScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1400, animate, 0, sceneKey);
  const thin = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", !thin ? UP.border : "border-slate-700 opacity-50")}>
          <p className="font-mono text-[9px] text-emerald-300">DEEP</p>
          <p className="font-mono text-[8px] text-slate-500">Tight spread</p>
        </div>
        <div className={cn("border p-2", thin ? DOWN.border : "border-slate-700")}>
          <p className="font-mono text-[9px] text-rose-300">THIN</p>
          <p className={cn("font-mono text-[8px]", thin ? DOWN.text : "text-slate-500")}>
            {thin ? "Spread + slip risk" : "—"}
          </p>
        </div>
      </div>
    </Stage>
  );
}

function GoodVsBadScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1500, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", phase === 1 ? UP.border : "border-slate-700 opacity-60")}>
          <p className="font-mono text-[9px] font-bold text-emerald-300">GOOD</p>
          {["Patience", "Planning", "Liquidity aware"].map((t) => (
            <p key={t} className="font-mono text-[8px] text-slate-400">
              <Check className="mr-0.5 inline h-2.5 w-2.5 text-emerald-400" />
              {t}
            </p>
          ))}
        </div>
        <div className={cn("border p-2", phase === 2 ? DOWN.border : "border-slate-700 opacity-60")}>
          <p className="font-mono text-[9px] font-bold text-rose-300">BAD</p>
          {["Chasing", "Emotional", "Poor timing"].map((t) => (
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

function RecapScene() {
  const items = ["Plan entry", "Patience", "Scale in/out", "Read spread", "Check vol", "Right order type"];
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm font-bold text-violet-200">GOOD IDEA ≠ GOOD TRADE</p>
        <div className="grid grid-cols-3 gap-1">
          {items.map((item) => (
            <span key={item} className="border border-violet-700/40 bg-violet-950/30 px-2 py-1 font-mono text-[9px] text-violet-300">
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono text-[9px] text-slate-400">Execution is the edge</p>
      </div>
    </Stage>
  );
}

export function ExecutionPlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: ExecVisual;
  reduceMotion: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  switch (visual) {
    case "whatIsExecution":
      return <WhatIsExecutionScene animate={animate} sceneKey={sceneKey} />;
    case "chasingPrice":
      return <ChasingPriceScene animate={animate} sceneKey={sceneKey} />;
    case "patientExecution":
      return <PatientExecutionScene animate={animate} sceneKey={sceneKey} />;
    case "scalingIn":
      return <ScalingInScene animate={animate} sceneKey={sceneKey} />;
    case "scalingOut":
      return <ScalingOutScene animate={animate} sceneKey={sceneKey} />;
    case "volatilityExecution":
      return <VolatilityExecutionScene animate={animate} sceneKey={sceneKey} />;
    case "thinLiquidity":
      return <ThinLiquidityScene animate={animate} sceneKey={sceneKey} />;
    case "goodVsBad":
      return <GoodVsBadScene animate={animate} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return null;
  }
}
