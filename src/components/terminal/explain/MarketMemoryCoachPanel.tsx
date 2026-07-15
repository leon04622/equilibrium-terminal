"use client";

import { Crosshair, HeartPulse, History, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { MarketMemoryCoach, type CoachState } from "@/lib/education/marketMemoryCoach";
import { useMarketMemoryBridgeStore } from "@/store/useMarketMemoryBridgeStore";
import { useMarketMemoryLessonStore } from "@/store/useMarketMemoryLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { terminalBus } from "@/store/eventBus";

const STATE_DOT: Record<CoachState, string> = {
  good: "bg-emerald-400",
  neutral: "bg-slate-400",
  warn: "bg-amber-400",
  danger: "bg-rose-500",
};

const STATE_BORDER: Record<CoachState, string> = {
  good: "border-emerald-700/50",
  neutral: "border-slate-800/50",
  warn: "border-amber-700/50",
  danger: "border-rose-700/50",
};

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="mt-px text-slate-500">{icon}</span>
      <div className="min-w-0">
        <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>{label}</span>
        <p className="font-mono text-[11px] leading-snug text-slate-200">{children}</p>
      </div>
    </div>
  );
}

export function MarketMemoryCoachPanel({ panelId }: { panelId: string }) {
  const startBridge = useMarketMemoryBridgeStore((s) => s.start);
  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);
  const simulatorActive = useMarketMemoryLessonStore((s) => s.active);
  const bridgeActive = useMarketMemoryBridgeStore((s) => s.active);

  if (panelId !== "explaindesk") return null;
  if (simulatorActive || bridgeActive) return null;

  const ctx = MarketMemoryCoach.contextLive();
  const card = MarketMemoryCoach.operatorCoach(ctx);

  return (
    <div className={cn("mb-2 border bg-slate-900/40 p-2", STATE_BORDER[card.state])}>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", STATE_DOT[card.state])} />
          <span className={cn(TERMINAL_TYPO.label, "text-slate-100")}>MARKET MEMORY COACH</span>
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>MEMORY</span>
      </div>
      <Field icon={<Radio className="h-3 w-3" />} label="LIVE NOW">
        {card.liveNow}
      </Field>
      <Field icon={<History className="h-3 w-3" />} label="LOOK HERE">
        {card.lookHere}
      </Field>
      <Field icon={<Crosshair className="h-3 w-3" />} label="WHY IT MATTERS">
        {card.whyItMatters}
      </Field>
      <Field icon={<HeartPulse className="h-3 w-3" />} label="WHAT TO WATCH">
        {card.whatToWatch}
      </Field>
      <div className="mt-1.5 border border-cyan-800/40 bg-cyan-950/20 px-2 py-1">
        <p className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}>NOW</p>
        <p className="font-mono text-[10px] leading-snug text-cyan-100">{card.alertLine}</p>
      </div>
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          onClick={() => {
            setHighlightPanel("memorydesk");
            terminalBus.emit("widget:focus", { widgetId: "memorydesk" });
            window.setTimeout(() => setHighlightPanel(null), 2000);
          }}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-slate-700 py-1 text-slate-300 hover:border-slate-500")}
        >
          PANEL
        </button>
        <button
          type="button"
          onClick={() => {
            armLessonVoice();
            startBridge();
          }}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-cyan-700/50 bg-cyan-950/30 py-1 text-cyan-300")}
        >
          WALK ME THROUGH IT
        </button>
      </div>
    </div>
  );
}
