"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { Activity, Clock, HeartPulse, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LDVisual } from "@/lib/education/liveDeskScenes";

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

function WhyLiveDeskScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  const showB = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", BAD.border, phase >= 1 ? BAD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", BAD.text)}>TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">Charts only</p>
          {phase >= 1 ? <p className={cn("mt-1 font-mono text-[9px]", BAD.text)}>Reacts to ticks</p> : null}
        </div>
        <div className={cn("border p-2", showB ? GOOD.border : "border-slate-700", showB ? GOOD.bg : "opacity-40")}>
          <p className={cn("font-mono text-[9px] font-bold", showB ? GOOD.text : "text-slate-500")}>TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">Live Desk first</p>
          {showB ? <p className={cn("mt-1 font-mono text-[9px]", GOOD.text)}>Trades with context</p> : null}
        </div>
      </div>
    </Stage>
  );
}

function ComponentsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(7, 800, animate, 0, sceneKey);
  const parts = ["FND", "SESSION", "TONE", "VOL", "LIQ", "RISK", "ALERTS"];
  return (
    <Stage>
      <div className="flex w-full max-w-[300px] flex-col items-center gap-2">
        <Radio className="h-6 w-6 text-cyan-400" />
        <p className="font-mono text-[9px] text-cyan-300">LIVE DESK</p>
        <div className="flex flex-wrap justify-center gap-1">
          {parts.map((t, i) => (
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
        {phase >= 6 ? <p className="font-mono text-[9px] text-slate-400">Mission control readout</p> : null}
      </div>
    </Stage>
  );
}

function FundingCountdownScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-2 text-center">
        <Clock className="mx-auto h-6 w-6 text-amber-400" />
        <p className={cn("font-mono text-lg tabular-nums", phase >= 1 ? "text-amber-300" : "text-slate-600")}>
          FND {phase >= 2 ? "04:32" : "—:—"}
        </p>
        <p className={cn("font-mono text-[9px]", phase >= 3 ? "text-amber-400" : "text-slate-600")}>
          FUNDING WINDOW · watch carry
        </p>
      </div>
    </Stage>
  );
}

function SessionCountdownScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1000, animate, 0, sceneKey);
  const sessions = ["ASIA", "EUROPE", "US"];
  return (
    <Stage>
      <div className="flex w-full max-w-[280px] flex-col items-center gap-2">
        {sessions.map((s, i) => (
          <div
            key={s}
            className={cn(
              "w-full border px-2 py-1 font-mono text-[9px] transition-all",
              i < phase ? `${CYAN.border} text-cyan-200` : "border-slate-800 text-slate-600",
            )}
          >
            {s} {i === phase - 1 ? "→ ACTIVE" : ""}
          </div>
        ))}
        {phase >= 3 ? <p className="font-mono text-[8px] text-slate-400">Transitions change behavior</p> : null}
      </div>
    </Stage>
  );
}

function DeskToneScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(6, 900, animate, 0, sceneKey);
  const tones = [
    { label: "CALM", color: "text-slate-400" },
    { label: "ACTIVE", color: "text-cyan-400" },
    { label: "THIN", color: "text-amber-400" },
    { label: "FUNDING", color: "text-cyan-300" },
    { label: "STRESS", color: "text-rose-400" },
  ];
  return (
    <Stage>
      <div className="space-y-1">
        {tones.map((t, i) => (
          <p
            key={t.label}
            className={cn(
              "font-mono text-[10px] transition-all",
              i < phase ? t.color : "text-slate-700",
            )}
          >
            {t.label}
          </p>
        ))}
      </div>
    </Stage>
  );
}

function LiveAwarenessScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <Activity className={cn("h-8 w-8", phase >= 1 ? "text-cyan-400" : "text-slate-600")} />
        <div className={cn("border px-3 py-2", phase >= 2 ? CYAN.border : "border-slate-800")}>
          <p className="font-mono text-[8px] text-slate-400">09:00 CALM → 14:00 ACTIVE → 16:00 STRESS</p>
        </div>
        {phase >= 3 ? <p className="font-mono text-[9px] text-cyan-300">Awareness throughout the day</p> : null}
      </div>
    </Stage>
  );
}

function OperatorWorkflowScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 900, animate, 0, sceneKey);
  const steps = ["Open terminal", "Check Live Desk", "Review state", "Plan execution", "Trade"];
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "border px-2 py-1 font-mono text-[8px] transition-all",
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

function RecapScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(2, 1400, animate, 0, sceneKey);
  return (
    <Stage>
      <div className="text-center">
        <HeartPulse className={cn("mx-auto h-8 w-8", phase >= 1 ? "text-cyan-400" : "text-slate-600")} />
        <p className={cn("mt-2 font-mono text-sm font-semibold", phase >= 1 ? "text-cyan-200" : "text-slate-600")}>
          HEARTBEAT OF THE DAY
        </p>
        {phase >= 2 ? <p className="font-mono text-[10px] text-slate-400">Find it live in your header →</p> : null}
      </div>
    </Stage>
  );
}

const SCENES: Record<LDVisual, React.FC<{ animate: boolean; sceneKey: string }>> = {
  whyLiveDesk: WhyLiveDeskScene,
  components: ComponentsScene,
  fundingCountdown: FundingCountdownScene,
  sessionCountdown: SessionCountdownScene,
  deskTone: DeskToneScene,
  liveAwareness: LiveAwarenessScene,
  operatorWorkflow: OperatorWorkflowScene,
  recap: RecapScene,
};

export function LiveDeskPlayground({
  visual,
  reduceMotion,
  sceneKey,
  animate,
}: {
  visual: LDVisual;
  reduceMotion: boolean;
  sceneKey: string;
  animate: boolean;
}) {
  const Scene = SCENES[visual];
  return <Scene animate={animate && !reduceMotion} sceneKey={sceneKey} />;
}
