import { NarrativePropagationEngine } from "@/lib/systemic-intelligence/NarrativePropagationEngine";
import { RelationshipEngine } from "@/lib/systemic-intelligence/RelationshipEngine";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import type { SystemicAlert, SystemicAlertKind } from "@/types/systemic-intelligence";

function alert(
  kind: SystemicAlertKind,
  severity: SystemicAlert["severity"],
  headline: string,
  detail: string,
): SystemicAlert {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    severity,
    headline,
    detail,
    timestamp: Date.now(),
  };
}

export class SystemicAlertEngine {
  static evaluate(asset: string): SystemicAlert[] {
    const alerts: SystemicAlert[] = [];
    const risk = SystemicRiskEngine.metrics(asset);
    const rel = RelationshipEngine.metrics(asset);
    const narr = NarrativePropagationEngine.analyze(asset);

    if (risk.exchangeConcentration >= 65) {
      alerts.push(
        alert(
          "concentration_risk",
          risk.exchangeConcentration >= 80 ? "critical" : "watch",
          "Exchange concentration",
          `${risk.exchangeConcentration}% venue dependency`,
        ),
      );
    }

    if (risk.stablecoinDependency >= 65) {
      alerts.push(
        alert(
          "stablecoin_stress",
          risk.stablecoinDependency >= 80 ? "critical" : "watch",
          "Stablecoin dependency",
          `${risk.stablecoinDependency}% stable exposure`,
        ),
      );
    }

    if (risk.contagionRisk >= 55) {
      alerts.push(
        alert(
          "contagion_risk",
          risk.contagionRisk >= 75 ? "critical" : "watch",
          "Cross-market contagion",
          `Score ${risk.contagionRisk} · tier ${risk.riskTier}`,
        ),
      );
    }

    if (narr.accelerationScore >= 60) {
      alerts.push(
        alert(
          "narrative_acceleration",
          narr.accelerationScore >= 80 ? "critical" : "watch",
          "Narrative acceleration",
          `Accel ${narr.accelerationScore} · ${narr.activeNarratives.length} active`,
        ),
      );
    }

    if (risk.liquidityFragmentation >= 55) {
      alerts.push(
        alert(
          "liquidity_fragmentation",
          "watch",
          "Liquidity fragmentation",
          `Fragmentation index ${risk.liquidityFragmentation}`,
        ),
      );
    }

    if (rel.correlationStress >= 60 && risk.leverageStress >= 50) {
      alerts.push(
        alert(
          "cascade_warning",
          risk.riskTier === "critical" ? "critical" : "watch",
          "Cascade risk elevated",
          `Correlation ${rel.correlationStress} · leverage ${risk.leverageStress}`,
        ),
      );
    }

    return alerts.slice(0, 12);
  }
}
