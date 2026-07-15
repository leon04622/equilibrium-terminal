"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MMVisual } from "@/lib/education/marketMemoryScenes";

const GOOD = { text: "text-emerald-300", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
const BAD = { text: "text-rose-300", border: "border-rose-500/50", bg: "bg-rose-500/10" };
const CYAN = { text: "text-cyan-300", border: "border-cyan-500/40", bg: "bg-cyan-500/10" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-cyan-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhyMemoryScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Only current price</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? GOOD.border : "border-slate-700", phase >= 2 ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", phase >= 2 ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Price plus history</p>
        </div>
      </div>
    </Stage>
  );
}

function ContentsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 900, animate, 0, sceneKey);
  const items = ["Market states", "Volatility", "Liquidity", "Major events", "Observations"];
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-1">
        {items.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border px-2 py-1 font-mono text-[8px]",
              i < phase ? `${CYAN.border} text-cyan-200` : "border-slate-800 text-slate-600",
            )}
          >
            {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function PatternsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2 text-center">
        <div className={cn("border p-2", phase >= 1 ? CYAN.border : "border-slate-800")}>
          <p className="font-mono text-[8px] text-slate-500">TODAY</p>
          <p className={cn("font-mono text-sm font-bold", phase >= 1 ? CYAN.text : "text-slate-600")}>ACTIVE</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? "border-violet-500/50" : "border-slate-800")}>
          <p className="font-mono text-[8px] text-slate-500">PRIOR</p>
          <p className={cn("font-mono text-sm font-bold", phase >= 2 ? "text-violet-300" : "text-slate-600")}>ACTIVE</p>
        </div>
        {phase >= 3 ? <p className="col-span-2 font-mono text-[9px] text-cyan-300">82% analog match</p> : null}
      </div>
    </Stage>
  );
}

function HistoryScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 950, animate, 0, sceneKey);
  const events = ["Vol expansion", "Stress event", "Funding extreme"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {events.map((e, i) => (
          <div
            key={e}
            className={cn(
              "border px-2 py-1 font-mono text-[8px]",
              i < phase ? "border-violet-500/40 text-violet-200" : "border-slate-800 text-slate-600",
            )}
          >
            {e}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function ContextScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="text-center">
        <p className={cn("font-mono text-lg font-bold", phase >= 1 ? CYAN.text : "text-slate-600")}>CONTEXT</p>
        {phase >= 2 ? <p className="mt-2 font-mono text-[10px] text-emerald-300">Prepare differently</p> : null}
        {phase >= 3 ? <p className="mt-1 font-mono text-[9px] text-rose-400/80 line-through">Not a forecast</p> : null}
      </div>
    </Stage>
  );
}

function WorkflowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const steps = ["Daily Briefing", "Market State", "Memory Archive", "Build plan", "Execute"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border px-2 py-1 font-mono text-[8px]",
              i < phase ? `${CYAN.border} text-cyan-200` : "border-slate-800 text-slate-600",
            )}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function RecapScene() {
  return (
    <Stage>
      <History className="h-10 w-10 text-cyan-400" />
      <p className="mt-3 font-mono text-sm text-cyan-200">The market has memory</p>
    </Stage>
  );
}

export function MarketMemoryPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: MMVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const motion = animate && !reduceMotion;
  switch (visual) {
    case "whyMemory":
      return <WhyMemoryScene animate={motion} sceneKey={sceneKey} />;
    case "archiveContents":
      return <ContentsScene animate={motion} sceneKey={sceneKey} />;
    case "patterns":
      return <PatternsScene animate={motion} sceneKey={sceneKey} />;
    case "learnHistory":
      return <HistoryScene animate={motion} sceneKey={sceneKey} />;
    case "contextNotPrediction":
      return <ContextScene animate={motion} sceneKey={sceneKey} />;
    case "operatorWorkflow":
      return <WorkflowScene animate={motion} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return <RecapScene />;
  }
}
