"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { FileText, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DBVisual } from "@/lib/education/dailyBriefingScenes";

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

function WhyBriefingsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Trades immediately</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? GOOD.border : "border-slate-700", phase >= 2 ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", phase >= 2 ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Reads briefing first</p>
        </div>
      </div>
    </Stage>
  );
}

function ContentsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 900, animate, 0, sceneKey);
  const items = ["Market state", "Vol outlook", "Liq outlook", "Session", "Guidance"];
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-1">
        {items.map((s, i) => (
          <div key={s} className={cn("border px-2 py-1 font-mono text-[8px]", i < phase ? `${AMBER.border} text-amber-200` : "border-slate-800 text-slate-600")}>
            {s}
          </div>
        ))}
      </div>
    </Stage>
  );
}

function OutlookScene({ label, color, note, animate, sceneKey }: { label: string; color: string; note: string; animate: boolean; sceneKey: string }) {
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

function WorkflowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const steps = ["Open terminal", "Read briefing", "Review state", "Build plan", "Execute"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div key={s} className={cn("border px-2 py-1 font-mono text-[8px]", i < phase ? `${AMBER.border} text-amber-200` : "border-slate-800 text-slate-600")}>
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
      <Sunrise className={cn("mx-auto h-8 w-8", phase >= 1 ? "text-amber-400" : "text-slate-600")} />
      <p className={cn("mt-2 text-center font-mono text-sm font-semibold", phase >= 1 ? "text-amber-200" : "text-slate-600")}>
        WHAT MATTERS TODAY
      </p>
    </Stage>
  );
}

const SCENES: Record<DBVisual, React.FC<{ animate: boolean; sceneKey: string }>> = {
  whyBriefings: WhyBriefingsScene,
  briefingContents: ContentsScene,
  marketOutlook: (p) => <OutlookScene {...p} label="MARKET" color="text-cyan-300" note="Calm · active · stressed" />,
  riskOutlook: (p) => <OutlookScene {...p} label="RISK" color="text-rose-300" note="What could hurt today" />,
  opportunityOutlook: (p) => <OutlookScene {...p} label="OPPORTUNITY" color="text-emerald-300" note="Press or wait" />,
  operatorWorkflow: WorkflowScene,
  recap: RecapScene,
};

export function DailyBriefingPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: DBVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const Scene = SCENES[visual];
  return <Scene animate={animate && !reduceMotion} sceneKey={sceneKey} />;
}
