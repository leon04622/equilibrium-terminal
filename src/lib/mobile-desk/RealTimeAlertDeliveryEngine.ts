import { ExecutionAlertEngine } from "@/lib/execution-analytics/ExecutionAlertEngine";
import { DerivativesAlertEngine } from "@/lib/derivatives/DerivativesAlertEngine";
import { MemoryAlertEngine } from "@/lib/market-memory/MemoryAlertEngine";
import { SystemicAlertEngine } from "@/lib/systemic-intelligence/SystemicAlertEngine";
import { IncidentMonitorEngine } from "@/lib/distribution/IncidentMonitorEngine";
import { useAlertStore } from "@/store/useAlertStore";
import type { MobileAlertKind, OperationalAlert } from "@/types/mobile-operational";

function mapSeverity(s: string): OperationalAlert["severity"] {
  if (s === "critical") return "critical";
  if (s === "watch" || s === "high") return "watch";
  return "info";
}

function row(
  kind: MobileAlertKind,
  severity: OperationalAlert["severity"],
  headline: string,
  detail: string,
  coin: string | null,
  ts: number,
): OperationalAlert {
  return {
    id: `mob-${kind}-${ts}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    severity,
    headline,
    detail,
    coin,
    pushed: severity === "critical",
    timestamp: ts,
  };
}

export class RealTimeAlertDeliveryEngine {
  static alerts(asset: string): OperationalAlert[] {
    const upper = asset.toUpperCase();
    const out: OperationalAlert[] = [];
    const now = Date.now();

    for (const t of useAlertStore.getState().triggers.slice(0, 6)) {
      const evType = t.event.type;
      out.push(
        row(
          evType.includes("LIQUIDATION")
            ? "liquidation"
            : evType.includes("FUNDING")
              ? "funding"
              : "whale",
          mapSeverity(t.severity),
          t.title,
          t.summary,
          t.coin,
          t.timestamp,
        ),
      );
    }

    for (const a of ExecutionAlertEngine.evaluate().slice(0, 4)) {
      out.push(
        row("execution", mapSeverity(a.severity), a.headline, a.detail, upper, a.timestamp),
      );
    }

    for (const a of DerivativesAlertEngine.evaluate(asset).slice(0, 3)) {
      out.push(
        row(
          a.kind.includes("funding") ? "funding" : "volatility",
          mapSeverity(a.severity),
          a.headline,
          a.detail,
          upper,
          a.timestamp,
        ),
      );
    }

    for (const a of SystemicAlertEngine.evaluate(asset).slice(0, 2)) {
      out.push(row("systemic", mapSeverity(a.severity), a.headline, a.detail, upper, a.timestamp));
    }

    for (const a of MemoryAlertEngine.evaluate(asset).slice(0, 2)) {
      out.push(row("volatility", mapSeverity(a.severity), a.headline, a.detail, upper, a.timestamp));
    }

    for (const inc of IncidentMonitorEngine.scan().slice(0, 3)) {
      out.push(
        row(
          "exchange_incident",
          mapSeverity(inc.severity),
          inc.headline,
          inc.detail,
          inc.coin,
          inc.updatedAt,
        ),
      );
    }

    const rank = { critical: 3, watch: 2, info: 1 };
    return out
      .sort((a, b) => rank[b.severity] - rank[a.severity] || b.timestamp - a.timestamp)
      .slice(0, 16);
  }
}
