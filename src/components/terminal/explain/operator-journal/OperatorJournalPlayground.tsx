"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { BookOpen, Brain, ClipboardList, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OJVisual } from "@/lib/education/operatorJournalScenes";

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

function WhyJournalScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  const showB = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Forgets why</p>
          {phase >= 1 ? <p className={cn("mt-1 font-mono text-[9px]", BAD.text)}>Repeats mistakes</p> : null}
        </div>
        <div className={cn("border p-2", showB ? GOOD.border : "border-slate-700", showB ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", showB ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Records decisions</p>
          {showB ? <p className={cn("mt-1 font-mono text-[9px]", GOOD.text)}>Improves over time</p> : null}
        </div>
      </div>
    </Stage>
  );
}

function JournalStructureScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(7, 850, animate, 0, sceneKey);
  const tabs = ["SESSION", "LOG", "EXEC", "BEHAVIOR", "REVIEW", "PATTERNS"];
  return (
    <Stage>
      <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
        <ClipboardList className="h-6 w-6 text-cyan-400" />
        <p className="font-mono text-[9px] text-cyan-300">OPERATOR JOURNAL</p>
        <div className="flex flex-wrap justify-center gap-1">
          {tabs.map((t, i) => (
            <span
              key={t}
              className={cn(
                "border px-1 py-0.5 font-mono text-[7px] transition-all duration-300",
                i < phase ? `${CYAN.border} ${CYAN.text}` : "border-slate-800 text-slate-600",
              )}
            >
              {t}
            </span>
          ))}
        </div>
        {phase >= 6 ? <p className="font-mono text-[9px] text-slate-400">Your trading memory</p> : null}
      </div>
    </Stage>
  );
}

function SessionTrackingScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-2 text-center">
        <p className={cn("font-mono text-[9px]", phase >= 1 ? "text-cyan-300" : "text-slate-600")}>SESSION START</p>
        <div className={cn("border p-2", phase >= 2 ? CYAN.border : "border-slate-800")}>
          <p className="font-mono text-[8px] text-slate-400">Regime · Vol · Liq · Decisions</p>
        </div>
        <p className={cn("font-mono text-[9px]", phase >= 3 ? "text-violet-300" : "text-slate-600")}>SESSION END → REVIEW</p>
      </div>
    </Stage>
  );
}

function DecisionLoggingScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const kinds = ["ENTRY", "EXIT", "SKIP", "OBS"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {kinds.map((k, i) => (
          <div
            key={k}
            className={cn(
              "border px-2 py-1 font-mono text-[8px] transition-all",
              i < phase ? `${CYAN.border} text-cyan-200` : "border-slate-800 text-slate-600",
            )}
          >
            {k} · thesis · emotion · risk
          </div>
        ))}
      </div>
    </Stage>
  );
}

function ExecutionReviewScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1200, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", phase >= 1 ? GOOD.border : "border-slate-800 opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", GOOD.text)}>GOOD EXEC</p>
          <p className="font-mono text-[8px] text-slate-500">Patient · sized</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? BAD.border : "border-slate-800 opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>POOR EXEC</p>
          <p className="font-mono text-[8px] text-slate-500">Chase · overtrade</p>
        </div>
      </div>
    </Stage>
  );
}

function BehaviorAnalysisScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  const flags = ["REVENGE", "OVERTRADE", "IMPATIENCE", "EMOTIONAL"];
  return (
    <Stage>
      <div className="space-y-1">
        {flags.map((f, i) => (
          <p
            key={f}
            className={cn(
              "font-mono text-[9px] transition-all",
              i < phase - 1 ? "text-rose-400" : "text-slate-700",
            )}
          >
            ⚠ {f}
          </p>
        ))}
        {phase >= 4 ? <p className="font-mono text-[9px] text-cyan-300">Detected early</p> : null}
      </div>
    </Stage>
  );
}

function PatternsReviewScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(3, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <Brain className="h-6 w-6 text-cyan-400" />
        <div className={cn("border p-2", phase >= 1 ? GOOD.border : "border-slate-800")}>
          <p className="font-mono text-[8px] text-emerald-300">STRENGTH: patient entries</p>
        </div>
        <div className={cn("border p-2", phase >= 2 ? BAD.border : "border-slate-800")}>
          <p className="font-mono text-[8px] text-rose-300">WEAKNESS: chase after loss</p>
        </div>
        {phase >= 3 ? <TrendingUp className="h-5 w-5 text-cyan-400" /> : null}
      </div>
    </Stage>
  );
}

function RecapScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(2, 1400, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="text-center">
        <BookOpen className={cn("mx-auto h-8 w-8", phase >= 1 ? "text-cyan-400" : "text-slate-600")} />
        <p className={cn("mt-2 font-mono text-sm font-semibold", phase >= 1 ? "text-cyan-200" : "text-slate-600")}>
          TRADING MEMORY
        </p>
        {phase >= 2 ? <p className="font-mono text-[10px] text-slate-400">Find it live on your terminal →</p> : null}
      </div>
    </Stage>
  );
}

const SCENES: Record<OJVisual, React.FC<{ animate: boolean; sceneKey: string }>> = {
  whyJournal: WhyJournalScene,
  journalStructure: JournalStructureScene,
  sessionTracking: SessionTrackingScene,
  decisionLogging: DecisionLoggingScene,
  executionReview: ExecutionReviewScene,
  behaviorAnalysis: BehaviorAnalysisScene,
  patternsReview: PatternsReviewScene,
  recap: RecapScene,
};

export function OperatorJournalPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: OJVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const Scene = SCENES[visual];
  return <Scene animate={animate && !reduceMotion} sceneKey={sceneKey} />;
}
