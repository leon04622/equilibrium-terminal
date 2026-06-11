"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { Check, ClipboardList, Sunrise, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DOVisual } from "@/lib/education/dailyOperationsScenes";

const GOOD = { text: "text-emerald-300", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
const BAD = { text: "text-rose-300", border: "border-rose-500/50", bg: "bg-rose-500/10" };
const AMBER = { text: "text-amber-300", border: "border-amber-500/40", bg: "bg-amber-500/10" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-amber-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhyExistsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  const showB = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Opens ticket first</p>
          {phase >= 1 ? <p className={cn("mt-1 font-mono text-[9px]", BAD.text)}>Reactive · noisy</p> : null}
        </div>
        <div className={cn("border p-2", showB ? GOOD.border : "border-slate-700", showB ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", showB ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Daily Ops first</p>
          {showB ? <p className={cn("mt-1 font-mono text-[9px]", GOOD.text)}>Prepared · context</p> : null}
        </div>
      </div>
    </Stage>
  );
}

function WhatItDoesScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 900, animate, 0, sceneKey);
  const layers = ["STATE", "VOL", "LIQ", "RISK", "SESSION"];
  return (
    <Stage>
      <div className="flex w-full max-w-[280px] flex-col items-center gap-2">
        <Sunrise className="h-6 w-6 text-amber-400" />
        <p className="font-mono text-[9px] text-amber-300">DAILY OPERATIONS</p>
        <div className="flex flex-wrap justify-center gap-1">
          {layers.map((l, i) => (
            <span
              key={l}
              className={cn(
                "border px-1.5 py-0.5 font-mono text-[8px] transition-all duration-300",
                i < phase ? `${AMBER.border} ${AMBER.text}` : "border-slate-800 text-slate-600",
              )}
            >
              {l}
            </span>
          ))}
        </div>
        {phase >= 5 ? <p className="font-mono text-[9px] text-slate-400">One operational view</p> : null}
      </div>
    </Stage>
  );
}

function MarketEnvironmentScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 1000, animate, 0, sceneKey);
  const envs = [
    { label: "CALM", color: GOOD },
    { label: "ACTIVE", color: AMBER },
    { label: "VOLATILE", color: { text: "text-orange-300", border: "border-orange-500/40", bg: "bg-orange-500/10" } },
    { label: "DANGEROUS", color: BAD },
  ];
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-1.5">
        {envs.map((e, i) => (
          <div
            key={e.label}
            className={cn(
              "border p-2 text-center transition-all duration-500",
              i <= phase - 1 ? `${e.color.border} ${e.color.bg}` : "border-slate-800 opacity-40",
            )}
          >
            <p className={cn("font-mono text-[9px] font-bold", i <= phase - 1 ? e.color.text : "text-slate-600")}>{e.label}</p>
          </div>
        ))}
      </div>
    </Stage>
  );
}

function OperatorRoutineScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 1000, animate, 0, sceneKey);
  const steps = ["OPEN OPS", "STATE", "VOL", "RISK", "PLAN"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2 border px-2 py-1 font-mono text-[9px] transition-all duration-300",
              i < phase ? `${AMBER.border} text-amber-200` : "border-slate-800 text-slate-600",
            )}
          >
            <span className="text-slate-500">{i + 1}.</span>
            {s}
            {i < phase ? <Check className="ml-auto h-3 w-3 text-amber-400" /> : null}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function DecisionQualityScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", phase >= 1 ? BAD.border : "border-slate-800")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>REACTIVE</p>
          <p className="font-mono text-[8px] text-slate-500">Chases noise</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? GOOD.border : "border-slate-800 opacity-50")}>
          <p className={cn("font-mono text-[9px] font-bold", phase >= 2 ? GOOD.text : "text-slate-500")}>PREPARED</p>
          <p className="font-mono text-[8px] text-slate-500">Uses Daily Ops</p>
        </div>
        {phase >= 3 ? (
          <p className={cn("col-span-2 text-center font-mono text-[9px]", AMBER.text)}>
            <ClipboardList className="mr-1 inline h-3 w-3" />
            Discipline · consistency · preparation
          </p>
        ) : null}
      </div>
    </Stage>
  );
}

function RecapScene() {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <Zap className="h-8 w-8 text-amber-400" />
        <p className="text-center font-mono text-sm font-bold text-amber-200">DAILY OPERATING SYSTEM</p>
        <p className="text-center font-mono text-[9px] text-slate-400">Equilibrium Terminal · open the live panel next</p>
      </div>
    </Stage>
  );
}

export function DailyOperationsPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: DOVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const motion = animate && !reduceMotion;
  switch (visual) {
    case "whyExists":
      return <WhyExistsScene animate={motion} sceneKey={sceneKey} />;
    case "whatItDoes":
      return <WhatItDoesScene animate={motion} sceneKey={sceneKey} />;
    case "marketEnvironment":
      return <MarketEnvironmentScene animate={motion} sceneKey={sceneKey} />;
    case "operatorRoutine":
      return <OperatorRoutineScene animate={motion} sceneKey={sceneKey} />;
    case "decisionQuality":
      return <DecisionQualityScene animate={motion} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return null;
  }
}
