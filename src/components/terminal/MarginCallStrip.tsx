"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { MarginCallEngine } from "@/lib/institutional/MarginCallEngine";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { usePortfolioDeskStore } from "@/store/usePortfolioDeskStore";
import { useTerminalStore } from "@/store/terminalStore";
import { terminalBus } from "@/store/eventBus";

export function MarginCallStrip() {
  const accountValue = useTerminalStore((s) => s.accountValue);
  const positionsVersion = useTerminalStore((s) => s.positionsVersion);
  const setActiveTab = usePortfolioDeskStore((s) => s.setActiveTab);

  const snap = useMemo(
    () => MarginCallEngine.snapshot(),
    [accountValue, positionsVersion],
  );

  if (snap.marginCallRisk === "clear") return null;

  const imminent = snap.marginCallRisk === "imminent";
  const topHint = snap.hints.find((h) => h.priority === "high") ?? snap.hints[0];

  return (
    <button
      type="button"
      onClick={() => {
        setActiveTab("margin");
        terminalBus.emit("widget:focus", { widgetId: "portfoliodesk" });
      }}
      className={cn(
        "flex w-full shrink-0 items-center gap-2 border-b px-2 py-0.5 text-left",
        imminent
          ? "border-rose-900/60 bg-rose-950/40 text-rose-200"
          : "border-amber-900/50 bg-amber-950/30 text-amber-200",
        TERMINAL_TYPO.micro,
      )}
    >
      <AlertTriangle className={cn("h-3 w-3 shrink-0", imminent ? terminalSkin.textDown : terminalSkin.textWarn)} />
      <span className="font-semibold uppercase">
        {imminent ? "Margin call imminent" : "Margin call watch"}
      </span>
      <span className="text-slate-400">
        Buffer {snap.distanceToMarginCallPct}% · util {snap.marginUtilPct}%
      </span>
      {topHint ? (
        <span className="ml-auto truncate text-[9px] opacity-90">{topHint.action}</span>
      ) : null}
    </button>
  );
}
