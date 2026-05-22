import { ProprietaryMetricsEngine } from "@/lib/proprietary/ProprietaryMetricsEngine";
import { EnterpriseAlertGovernanceEngine } from "@/lib/enterprise/EnterpriseAlertGovernanceEngine";
import type { RiskSurveillanceAlert } from "@/types/crypto-ecosystem";

export class RiskSurveillanceEngine {
  static alerts(): RiskSurveillanceAlert[] {
    const metrics = ProprietaryMetricsEngine.metrics();
    const gov = EnterpriseAlertGovernanceEngine.rules();
    const now = Date.now();
    const alerts: RiskSurveillanceAlert[] = [];

    for (const m of metrics.filter((x) => x.band === "critical" || x.band === "elevated")) {
      alerts.push({
        id: `risk-metric-${m.id}`,
        domain: m.kind.includes("liquidity") ? "liquidity" : m.kind.includes("exchange") ? "exchange" : "surveillance",
        headline: `${m.label} at ${m.value} — ${m.band}`,
        severity: m.band === "critical" ? "critical" : "watch",
        coin: null,
        timestamp: m.updatedAt,
      });
    }

    for (const r of gov.filter((g) => g.severity !== "info").slice(0, 4)) {
      alerts.push({
        id: `risk-gov-${r.id}`,
        domain: "operational",
        headline: r.name,
        severity: r.severity,
        coin: r.scope === "desk" ? "BTC" : null,
        timestamp: r.lastTriggeredAt ?? now - 3600_000,
      });
    }

    alerts.push({
      id: "risk-surveillance-01",
      domain: "surveillance",
      headline: "Abnormal activity cluster — 2 assets anomaly score > 85",
      severity: "watch",
      coin: "HYPE",
      timestamp: now - 900_000,
    });

    return alerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 12);
  }
}
