import { AssetWorkspaceOrchestrator } from "@/lib/workflow/AssetWorkspaceOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { AlertWorkflowContext } from "@/types/trader-workflow";

const FOCUS_SEQUENCE = [
  "surveillance",
  "hyperbook",
  "domladder",
  "intelligence",
  "ticket",
  "knowledgegraph",
] as const;

/**
 * Alert → action workflow: reduce friction from anomaly to operational context.
 */
export class AlertWorkflowBridge {
  private static active: AlertWorkflowContext | null = null;
  private static recentExecutions = new Map<string, number>();
  private static readonly DEDUPE_MS = 90_000;

  static start(): () => void {
    return terminalBus.on("alert:triggered", (payload) => {
      if (payload.severity !== "critical") return;
      AlertWorkflowBridge.execute(payload.id, payload.coin, payload.severity, "", "auto");
    });
  }

  static execute(
    alertId: string,
    coin: string,
    severity: "info" | "watch" | "critical",
    title: string,
    source: "auto" | "manual" = "manual",
  ): AlertWorkflowContext {
    const now = Date.now();
    const lastRun = AlertWorkflowBridge.recentExecutions.get(alertId);
    if (lastRun != null && now - lastRun < AlertWorkflowBridge.DEDUPE_MS) {
      const existing = AlertWorkflowBridge.active;
      if (existing?.alertId === alertId) {
        AssetWorkspaceOrchestrator.open(existing.coin, {
          mode: existing.severity === "critical" ? "execution" : "surveillance",
          source: "alert-workflow",
        });
        terminalBus.emit("widget:focus", { widgetId: FOCUS_SEQUENCE[0] });
        return existing;
      }
    }
    AlertWorkflowBridge.recentExecutions.set(alertId, now);
    const ctx: AlertWorkflowContext = {
      alertId,
      coin: coin.toUpperCase(),
      severity,
      title,
      stepsCompleted: [],
      startedAt: Date.now(),
    };
    AlertWorkflowBridge.active = ctx;

    if (source === "manual" || severity === "critical") {
      useTraderWorkflowStore.getState().addJournalEntry({
        kind: "alert_response",
        coin: ctx.coin,
        title: `Alert: ${title || severity}`,
        body: `Operational workflow started for ${ctx.coin} · ${severity}`,
        tags: ["alert", "workflow"],
        linkedAlertId: alertId,
      });
    }

    AssetWorkspaceOrchestrator.open(ctx.coin, {
      mode: severity === "critical" ? "execution" : "surveillance",
      source: "alert-workflow",
    });

    FOCUS_SEQUENCE.forEach((widgetId, i) => {
      window.setTimeout(() => {
        terminalBus.emit("widget:focus", { widgetId });
        ctx.stepsCompleted.push(widgetId);
        useTraderWorkflowStore.getState().setAlertWorkflow(ctx);
      }, 200 + i * 180);
    });

    useTraderWorkflowStore.getState().setAlertWorkflow(ctx);
    return ctx;
  }

  static getActive(): AlertWorkflowContext | null {
    return AlertWorkflowBridge.active;
  }
}
