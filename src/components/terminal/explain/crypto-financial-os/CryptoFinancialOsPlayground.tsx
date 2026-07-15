"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CFOVisual } from "@/lib/education/cryptoFinancialOsScenes";

const GOOD = { text: "text-emerald-300", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
const BAD = { text: "text-rose-300", border: "border-rose-500/50", bg: "bg-rose-500/10" };
const INDIGO = { text: "text-indigo-300", border: "border-indigo-500/40", bg: "bg-indigo-500/10" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-indigo-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhyOsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADITIONAL</p>
          <p className="font-mono text-[8px] text-slate-500">Many disconnected tools</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? GOOD.border : "border-slate-700", phase >= 2 ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", phase >= 2 ? GOOD.text : "text-slate-500")}>OPERATOR</p>
          <p className="font-mono text-[8px] text-slate-500">One integrated OS</p>
        </div>
      </div>
    </Stage>
  );
}

function LayersOverviewScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(7, 850, animate, 0, sceneKey);
  const layers = ["Terminal", "Intelligence", "Execution", "Organizational", "Infrastructure", "API"];
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-1">
        {layers.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border px-2 py-1 font-mono text-[8px]",
              i < phase ? `${INDIGO.border} text-indigo-200` : "border-slate-800 text-slate-600",
            )}
          >
            {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function InfoFlowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 950, animate, 0, sceneKey);
  const steps = ["Market data", "Intelligence", "Decision", "Execution", "Review"];
  return (
    <Stage>
      <div className="w-full max-w-[220px] space-y-1">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={cn(
                "w-full border px-2 py-1 text-center font-mono text-[8px]",
                i < phase ? `${INDIGO.border} text-indigo-200` : "border-slate-800 text-slate-600",
              )}
            >
              {s}
            </div>
            {i < steps.length - 1 && i < phase - 1 ? (
              <span className="font-mono text-[8px] text-indigo-500/70">then</span>
            ) : null}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function LayerScene({ label, headline, animate, sceneKey }: { label: string; headline: string; animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1000, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="text-center">
        <p className={cn("font-mono text-[9px] text-slate-500", phase >= 1 && INDIGO.text)}>{label}</p>
        <p className={cn("mt-2 font-mono text-sm font-bold", phase >= 2 ? INDIGO.text : "text-slate-600")}>{headline}</p>
        {phase >= 3 ? <p className="mt-2 font-mono text-[9px] text-emerald-300/80">Layer active</p> : null}
      </div>
    </Stage>
  );
}

function OperatorWorkflowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const steps = ["Context", "Intelligence", "Execution", "Review"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border px-2 py-1 font-mono text-[8px]",
              i < phase ? `${INDIGO.border} text-indigo-200` : "border-slate-800 text-slate-600",
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
      <Layers className="h-10 w-10 text-indigo-400" />
      <p className="mt-3 font-mono text-sm text-indigo-200">One connected operating system</p>
    </Stage>
  );
}

export function CryptoFinancialOsPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: CFOVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const motion = animate && !reduceMotion;
  switch (visual) {
    case "whyOs":
      return <WhyOsScene animate={motion} sceneKey={sceneKey} />;
    case "layersOverview":
      return <LayersOverviewScene animate={motion} sceneKey={sceneKey} />;
    case "infoFlow":
      return <InfoFlowScene animate={motion} sceneKey={sceneKey} />;
    case "terminalLayer":
      return <LayerScene label="TERMINAL LAYER" headline="Direct interface" animate={motion} sceneKey={sceneKey} />;
    case "intelligenceLayer":
      return <LayerScene label="INTELLIGENCE LAYER" headline="Signals and context" animate={motion} sceneKey={sceneKey} />;
    case "executionLayer":
      return <LayerScene label="EXECUTION LAYER" headline="Decisions to fills" animate={motion} sceneKey={sceneKey} />;
    case "organizationalLayer":
      return <LayerScene label="ORGANIZATIONAL LAYER" headline="Ops and workflow" animate={motion} sceneKey={sceneKey} />;
    case "infrastructureLayer":
      return <LayerScene label="INFRASTRUCTURE LAYER" headline="Behind the scenes" animate={motion} sceneKey={sceneKey} />;
    case "operatorWorkflow":
      return <OperatorWorkflowScene animate={motion} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return <RecapScene />;
  }
}
