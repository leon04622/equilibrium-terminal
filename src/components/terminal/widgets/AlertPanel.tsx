"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { AlertWorkflowBridge } from "@/lib/workflow/AlertWorkflowBridge";
import { useAlertStore, type TriggeredAlert } from "@/store/useAlertStore";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";
import { useTerminalStore } from "@/store/terminalStore";
import { LiveContextEngine } from "@/lib/education/LiveContextEngine";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

function subscribeTriggers(cb: () => void) {
  return useAlertStore.subscribe((s) => s.triggersVersion, () => cb());
}

function getTriggers(): TriggeredAlert[] {
  return useAlertStore.getState().triggers;
}

function AlertRow({ alert, beginner }: { alert: TriggeredAlert; beginner: boolean }) {
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const clearFlash = useAlertStore((s) => s.clearTriggerFlash);

  // PHASE 1 / PHASE 8 — every alert is expanded into plain English.
  const edu = useMemo(() => LiveContextEngine.fromAlert(alert), [alert]);

  useEffect(() => {
    if (!alert.isNew) return;
    const t = window.setTimeout(() => clearFlash(alert.id), 400);
    return () => window.clearTimeout(t);
  }, [alert.id, alert.isNew, clearFlash]);

  const sevColor =
    alert.severity === "critical"
      ? terminalSkin.textDown
      : alert.severity === "watch"
        ? terminalSkin.textWarn
        : "text-slate-500";

  return (
    <button
      type="button"
      onClick={() => {
        selectAssetByCoin(alert.coin, "alert-panel");
        AlertWorkflowBridge.execute(alert.id, alert.coin, alert.severity, alert.title);
      }}
      className={cn(
        terminalSkin.row,
        "w-full border-b-[0.5px] border-slate-800 px-1 text-left",
        "hover:bg-slate-900/90",
        alert.isNew && terminalSkin.flashUp,
      )}
    >
      <div className="flex w-full items-center gap-1">
        <span className={cn(TERMINAL_TYPO.dataSm, "w-16 tabular-nums text-slate-500")}>
          {formatTapeTime(alert.timestamp).slice(0, 8)}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
          {alert.coin}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "w-24 truncate", sevColor)}>
          {alert.event.type}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
          {alert.title}
        </span>
        {alert.aiPending ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#00e5ff]" />
        ) : (
          <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>AI</span>
        )}
      </div>
      <div className="mt-0.5 space-y-0.5 pl-[4.5rem]">
        {beginner ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{edu.meaning}</p>
        ) : null}
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          <span className="mr-1 text-amber-500">WHY</span>
          {edu.whyMatters}
        </p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          <span className="mr-1 text-cyan-500">CHECK</span>
          {edu.checkNext}
        </p>
        {beginner ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
            <span className="mr-1 text-rose-500">AVOID</span>
            {edu.mistake}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function AlertPanel() {
  useSyncExternalStore(subscribeTriggers, getTriggers, getTriggers);
  const triggers = useAlertStore((s) => s.triggers);
  const prioritized = useDailyOperationsStore((s) => s.prioritizedAlerts);
  const rules = useAlertStore((s) => s.rules);
  const enabledCount = rules.filter((r) => r.enabled).length;
  const beginner = useOperatorGuideStore((s) => s.selectedAudience) === "beginner";

  const ordered =
    prioritized.length > 0
      ? [...triggers].sort((a, b) => {
          const pa = prioritized.find((p) => p.id === a.id)?.priorityScore ?? 0;
          const pb = prioritized.find((p) => p.id === b.id)?.priorityScore ?? 0;
          return pb - pa;
        })
      : triggers;

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", terminalSkin.canvas)}>
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between px-1",
        )}
      >
        <span>ALERT ENGINE</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={terminalSkin.textUp}>{enabledCount}</span>
          <span className="text-slate-600"> RULES · </span>
          <span className="text-slate-400">{triggers.length} TRG</span>
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {triggers.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            EVAL · OI · FUNDING · WHALE · LIQ CLUSTER
          </p>
        ) : (
          ordered.map((a) => <AlertRow key={a.id} alert={a} beginner={beginner} />)
        )}
      </div>
    </div>
  );
}
