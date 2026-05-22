import { EnterpriseReliabilityEngine } from "@/lib/enterprise/EnterpriseReliabilityEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { ScalabilityVitals } from "@/types/industry-integrations";

export class ScalabilityReadinessEngine {
  static vitals(): ScalabilityVitals {
    const reliability = EnterpriseReliabilityEngine.state();
    const prod = useProductionConfigStore.getState();
    const tier = prod.entitlements.tier;

    return {
      capacityHeadroomPct: Math.round(Math.min(85, 40 + reliability.uptimePct * 0.4)),
      uptimePct: reliability.uptimePct,
      redundancyActive: reliability.redundancyMode !== "degraded",
      autoScaleReady: tier === "enterprise",
      supportTier: tier === "enterprise" ? "mission_critical" : tier === "team" ? "enterprise" : "standard",
      deploymentReady: tier === "enterprise" && reliability.failoverReady,
    };
  }
}
