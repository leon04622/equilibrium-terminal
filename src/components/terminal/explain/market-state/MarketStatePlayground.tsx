"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MSVisual } from "@/lib/education/marketStateScenes";

const GOOD = { text: "text-emerald-300", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
const BAD = { text: "text-rose-300", border: "border-rose-500/50", bg: "bg-rose-500/10" };
const VIOLET = { text: "text-violet-300", border: "border-violet-500/40", bg: "bg-violet-500/10" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-violet-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhyStatesScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Same approach daily</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? GOOD.border : "border-slate-700", phase >= 2 ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", phase >= 2 ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Adapts to state</p>
        </div>
      </div>
    </Stage>
  );
}

function StateScene({ label, color, note, animate, sceneKey }: { label: string; color: string; note: string; animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1000, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="text-center">
        <p className={cn("font-mono text-2xl font-bold transition-all", phase >= 1 ? color : "text-slate-600")}>{label}</p>
        {phase >= 2 ? <p className={cn("mt-2 font-mono text-[10px]", color)}>{note}</p> : null}
      </div>
    </Stage>
  );
}

function TransitionsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  const chain = ["CALM", "ACTIVE", "STRESS", "CALM"];
  return (
    <Stage>
      <div className="flex items-center gap-1">
        {chain.map((s, i) => (
          <span key={`${s}-${i}`} className={cn("font-mono text-[9px]", i < phase ? "text-violet-300" : "text-slate-600")}>
            {s}{i < chain.length - 1 ? " →" : ""}
          </span>
        ))}
      </div>
    </Stage>
  );
}

function WorkflowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const steps = ["Read state", "Check confidence", "Review signals", "Adjust risk", "Trade"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div key={s} className={cn("border px-2 py-1 font-mono text-[8px]", i < phase ? `${VIOLET.border} text-violet-200` : "border-slate-800 text-slate-600")}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function RecapScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(2, 1400, animate, 0, sceneKey);
  return (
    <Stage>
      <Layers className={cn("mx-auto h-8 w-8", phase >= 1 ? "text-violet-400" : "text-slate-600")} />
      <p className={cn("mt-2 text-center font-mono text-sm font-semibold", phase >= 1 ? "text-violet-200" : "text-slate-600")}>
        BEHAVIOR FOLLOWS ENVIRONMENT
      </p>
    </Stage>
  );
}

const SCENES: Record<MSVisual, React.FC<{ animate: boolean; sceneKey: string }>> = {
  whyStates: WhyStatesScene,
  calm: (p) => <StateScene {...p} label="CALM" color="text-emerald-300" note="Stable · planned execution" />,
  active: (p) => <StateScene {...p} label="ACTIVE" color="text-cyan-300" note="Vol expanding · read faster" />,
  thin: (p) => <StateScene {...p} label="THIN" color="text-amber-300" note="Weak liq · slippage risk" />,
  stress: (p) => <StateScene {...p} label="STRESS" color="text-rose-300" note="Defensive · protect capital" />,
  transitions: TransitionsScene,
  operatorWorkflow: WorkflowScene,
  recap: RecapScene,
};

export function MarketStatePlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: MSVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const Scene = SCENES[visual];
  return <Scene animate={animate && !reduceMotion} sceneKey={sceneKey} />;
}
