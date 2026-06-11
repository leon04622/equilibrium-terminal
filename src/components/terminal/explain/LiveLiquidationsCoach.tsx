"use client";

import { Crosshair, Eye, Radio, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { LiveLiquidationsCoach, type CoachState } from "@/lib/education/liveLiquidationsCoach";
import { terminalBus } from "@/store/eventBus";
import { useDerivativesDeskStore } from "@/store/useDerivativesDeskStore";
import { useLiquidationsBridgeStore } from "@/store/useLiquidationsBridgeStore";

const STATE_DOT: Record<CoachState, string> = {
  good: "bg-emerald-400",
  neutral: "bg-rose-400",
  warn: "bg-amber-400",
  danger: "bg-rose-500",
};

const STATE_BORDER: Record<CoachState, string> = {
  good: "border-emerald-700/50",
  neutral: "border-rose-800/50",
  warn: "border-amber-700/50",
  danger: "border-rose-700/50",
};

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="mt-px text-slate-500">{icon}</span>
      <div className="min-w-0">
        <span className={cn(TERMINAL_TYPO.micro, "text-rose-500")}>{label}</span>
        <p className="font-mono text-[11px] leading-snug text-slate-200">{children}</p>
      </div>
    </div>
  );
}

export function LiveLiquidationsCoachPanel({ panelId }: { panelId: string }) {
  const snapshot = useDerivativesDeskStore((s) => s.snapshot);
  const setActiveTab = useDerivativesDeskStore((s) => s.setActiveTab);
  const startBridge = useLiquidationsBridgeStore((s) => s.start);

  if (panelId !== "derivdesk") return null;

  const card = LiveLiquidationsCoach.operatorCoach(snapshot);

  const focusDesk = () => {
    setActiveTab("funding");
    terminalBus.emit("widget:focus", { widgetId: "derivdesk" });
  };

  return (
    <div className={cn("mb-2 border bg-slate-900/40 p-2", STATE_BORDER[card.state])}>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", STATE_DOT[card.state])} />
          <span className={cn(TERMINAL_TYPO.label, "text-slate-100")}>LIQUIDATIONS COACH</span>
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>LIVE</span>
      </div>
      <Field icon={<Radio className="h-3 w-3" />} label="LIVE NOW">
        {card.liveNow}
      </Field>
      <Field icon={<Eye className="h-3 w-3" />} label="LOOK HERE">
        {card.lookHere}
      </Field>
      <Field icon={<Crosshair className="h-3 w-3" />} label="WHY IT MATTERS">
        {card.whyItMatters}
      </Field>
      <Field icon={<TriangleAlert className="h-3 w-3" />} label="WHAT TO WATCH">
        {card.whatToWatch}
      </Field>
      <div className="mt-1.5 border border-rose-800/40 bg-rose-950/20 px-2 py-1">
        <p className={cn(TERMINAL_TYPO.micro, "text-rose-400")}>NOW</p>
        <p className="font-mono text-[10px] leading-snug text-rose-100">{card.alertLine}</p>
      </div>
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          onClick={focusDesk}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-slate-700 py-1 text-slate-300 hover:border-slate-500")}
        >
          HIGHLIGHT DESK
        </button>
        <button
          type="button"
          onClick={startBridge}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-rose-700/50 bg-rose-950/30 py-1 text-rose-300")}
        >
          WALK ME THROUGH IT
        </button>
      </div>
    </div>
  );
}
