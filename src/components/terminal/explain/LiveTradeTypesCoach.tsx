"use client";

import { Crosshair, Eye, Radio, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { LiveTradeTypesCoach, type CoachState } from "@/lib/education/liveTradeTypesCoach";
import { terminalBus } from "@/store/eventBus";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { useTradeTypesBridgeStore } from "@/store/useTradeTypesBridgeStore";

const STATE_DOT: Record<CoachState, string> = {
  good: "bg-emerald-400",
  neutral: "bg-amber-400",
  warn: "bg-amber-400",
  danger: "bg-rose-400",
};

const STATE_BORDER: Record<CoachState, string> = {
  good: "border-emerald-700/50",
  neutral: "border-amber-800/50",
  warn: "border-amber-700/50",
  danger: "border-rose-700/50",
};

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="mt-px text-slate-500">{icon}</span>
      <div className="min-w-0">
        <span className={cn(TERMINAL_TYPO.micro, "text-amber-500")}>{label}</span>
        <p className="font-mono text-[11px] leading-snug text-slate-200">{children}</p>
      </div>
    </div>
  );
}

export function LiveTradeTypesCoachPanel({ panelId }: { panelId: string }) {
  const book = useHyperliquidStore((s) => s.book);
  const startBridge = useTradeTypesBridgeStore((s) => s.start);

  if (panelId !== "ticket") return null;

  const ctx = LiveTradeTypesCoach.contextFromBook(book);
  const card = LiveTradeTypesCoach.operatorCoach(ctx);

  const focusTicket = () => {
    terminalBus.emit("widget:focus", { widgetId: "ticket" });
  };

  return (
    <div className={cn("mb-2 border bg-slate-900/40 p-2", STATE_BORDER[card.state])}>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", STATE_DOT[card.state])} />
          <span className={cn(TERMINAL_TYPO.label, "text-slate-100")}>ORDER TYPE COACH</span>
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
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          onClick={focusTicket}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-slate-700 py-1 text-slate-300 hover:border-slate-500")}
        >
          HIGHLIGHT TICKET
        </button>
        <button
          type="button"
          onClick={startBridge}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-amber-700/50 bg-amber-950/30 py-1 text-amber-300")}
        >
          WALK ME THROUGH IT
        </button>
      </div>
    </div>
  );
}
