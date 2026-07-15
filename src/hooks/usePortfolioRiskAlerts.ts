"use client";

import { useEffect } from "react";
import { PortfolioVaREngine } from "@/lib/institutional/PortfolioVaREngine";
import { MarginCallEngine } from "@/lib/institutional/MarginCallEngine";
import { useInstitutionalRiskStore } from "@/store/useInstitutionalRiskStore";
import { usePortfolioDeskStore } from "@/store/usePortfolioDeskStore";
import { useAlertStore } from "@/store/useAlertStore";
import type { AlertSeverity } from "@/types/alerts";

const cooldowns = new Map<string, number>();

function canFire(key: string, cooldownMs: number): boolean {
  const now = Date.now();
  const last = cooldowns.get(key) ?? 0;
  if (now - last < cooldownMs) return false;
  cooldowns.set(key, now);
  return true;
}

function mapSeverity(sev: string): AlertSeverity {
  if (sev === "critical") return "critical";
  if (sev === "watch") return "watch";
  return "info";
}

export function usePortfolioRiskAlerts(enabled = true): void {
  const snapshot = usePortfolioDeskStore((s) => s.snapshot);
  const varLimits = useInstitutionalRiskStore((s) => s.varLimits);
  const riskAlertsArmed = useInstitutionalRiskStore((s) => s.riskAlertsArmed);

  useEffect(() => {
    if (!enabled || !snapshot || !riskAlertsArmed) return;

    const dispatch = useAlertStore.getState().dispatchTrigger;
    const varSnap = PortfolioVaREngine.snapshot();
    const horizon = PortfolioVaREngine.horizonMetrics(varSnap, varLimits.alertHorizonDays);
    const marginSnap = MarginCallEngine.snapshot();

    if (varLimits.enabled && horizon.var95Pct >= varLimits.maxVar95Pct) {
      const critical = horizon.var95Pct >= varLimits.criticalVar95Pct;
      if (canFire(`var-breach-${horizon.horizonDays}d`, varLimits.alertCooldownMs)) {
        dispatch({
          id: `var-breach-${horizon.horizonDays}d-${varSnap.computedAt}`,
          ruleId: "institutional-var-limit",
          event: {
            id: `var-event-${varSnap.computedAt}`,
            type: "VAR_LIMIT_BREACH",
            coin: "PORTFOLIO",
            timestamp: varSnap.computedAt,
            metrics: {
              var95Pct: horizon.var95Pct,
              var95Usd: horizon.var95Usd,
              es95Pct: horizon.expectedShortfall95Pct,
              limitPct: varLimits.maxVar95Pct,
              horizonDays: horizon.horizonDays,
            },
            meta: {
              method: varSnap.method,
              horizonDays: String(horizon.horizonDays),
            },
          },
          coin: "PORTFOLIO",
          title: critical ? "VaR limit breached" : "VaR limit watch",
          summary: `${horizon.horizonDays}d VaR 95% ${horizon.var95Pct}% (limit ${varLimits.maxVar95Pct}%) · ES ${horizon.expectedShortfall95Pct}% · ${varSnap.method}`,
          severity: critical ? "critical" : "watch",
          timestamp: varSnap.computedAt,
        });
      }
    }

    if (marginSnap.marginCallRisk === "imminent" || marginSnap.marginCallRisk === "watch") {
      const key = `margin-${marginSnap.marginCallRisk}`;
      if (canFire(key, 90_000)) {
        dispatch({
          id: `margin-${marginSnap.marginCallRisk}-${marginSnap.computedAt}`,
          ruleId: "institutional-margin-call",
          event: {
            id: `margin-event-${marginSnap.computedAt}`,
            type: "MARGIN_CALL_RISK",
            coin: "PORTFOLIO",
            timestamp: marginSnap.computedAt,
            metrics: {
              bufferPct: marginSnap.distanceToMarginCallPct,
              marginUtilPct: marginSnap.marginUtilPct,
            },
            meta: {
              band: marginSnap.marginCallRisk,
            },
          },
          coin: "PORTFOLIO",
          title:
            marginSnap.marginCallRisk === "imminent"
              ? "Margin call imminent"
              : "Margin call watch",
          summary: `Buffer ${marginSnap.distanceToMarginCallPct}% · util ${marginSnap.marginUtilPct}%`,
          severity: mapSeverity(marginSnap.marginCallRisk === "imminent" ? "critical" : "watch"),
          timestamp: marginSnap.computedAt,
        });
      }
    }
  }, [enabled, snapshot, varLimits, riskAlertsArmed]);
}
