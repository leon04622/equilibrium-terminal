"use client";

import { Crosshair, Eye, Radio, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { LiveFundingCoach, type CoachState } from "@/lib/education/liveFundingCoach";
import { terminalBus } from "@/store/eventBus";
import { useDerivativesDeskStore } from "@/store/useDerivativesDeskStore";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";

const STATE_DOT: Record<CoachState, string> = {
  good: "bg-emerald-400",
  neutral: "bg-violet-400",
  warn: "bg-amber-400",
  danger: "bg-rose-400",
};

const STATE_BORDER: Record<CoachState, string> = {
  good: "border-emerald-700/50",
  neutral: "border-violet-800/50",
  warn: "border-amber-700/50",
  danger: "border-rose-700/50",
};

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="mt-px text-slate-500">{icon}</span>
      <div className="min-w-0">
        <span className={cn(TERMINAL_TYPO.micro, "text-violet-500")}>{label}</span>
        <p className="font-mono text-[11px] leading-snug text-slate-200">{children}</p>
      </div>
    </div>
  );
}

export function LiveFundingCoachPanel({ panelId }: { panelId: string }) {
  const snapshot = useDerivativesDeskStore((s) => s.snapshot);
  const setActiveTab = useDerivativesDeskStore((s) => s.setActiveTab);
  const startBridge = useFundingBridgeStore((s) => s.start);

  if (panelId !== "derivdesk") return null;

  const funding = snapshot?.funding ?? null;
  const card = LiveFundingCoach.operatorCoach(funding);

  const focusFunding = () => {
    setActiveTab("funding");
    terminalBus.emit("widget:focus", { widgetId: "derivdesk" });
  };

  return (
    <div className={cn("mb-2 border bg-slate-900/40 p-2", STATE_BORDER[card.state])}>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", STATE_DOT[card.state])} />
          <span className={cn(TERMINAL_TYPO.label, "text-slate-100")}>FUNDING COACH</span>
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>LIVE</span>
      </div>
      <Field icon={<Radio className="h-3 w-3" />} label="LIVE NOW">{card.liveNow}</Field>
      <Field icon={<Eye className="h-3 w-3" />} label="LOOK HERE">{card.lookHere}</Field>
      <Field icon={<Crosshair className="h-3 w-3" />} label="WHY IT MATTERS">{card.whyItMatters}</Field>
      <Field icon={<TriangleAlert className="h-3 w-3" />} label="WHAT TO WATCH">{card.whatToWatch}</Field>
      <div className="mt-1.5 flex gap-1">
        <button type="button" onClick={focusFunding} className={cn(TERMINAL_TYPO.micro, "flex-1 border border-slate-700 py-1 text-slate-300 hover:border-slate-500")}>
          HIGHLIGHT FUNDING
        </button>
        <button type="button" onClick={startBridge} className={cn(TERMINAL_TYPO.micro, "flex-1 border border-violet-700/50 bg-violet-950/30 py-1 text-violet-300")}>
          WALK ME THROUGH IT
        </button>
      </div>
    </div>
  );
}
