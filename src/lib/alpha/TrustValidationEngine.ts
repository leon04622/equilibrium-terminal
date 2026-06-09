import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import { SecurityOrchestrator } from "@/lib/security/SecurityOrchestrator";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { TrustValidationRow } from "@/types/alpha-launch";

export class TrustValidationEngine {
  static evaluate(): TrustValidationRow[] {
    const rel = ReliabilityOrchestrator.snapshot();
    const hardening = HardeningOrchestrator.snapshot();
    const claims = useProductionConfigStore.getState().claims;
    const security = SecurityOrchestrator.snapshot(claims);

    const trend = (score: number): TrustValidationRow["trend"] =>
      score >= 85 ? "up" : score >= 65 ? "stable" : "down";

    return [
      {
        dimension: "Execution confidence",
        score: rel.execution.reconciliationHealth,
        trend: trend(rel.execution.reconciliationHealth),
        detail: `${rel.execution.failedOrderCount} failed · retry ${rel.execution.retrySafetyScore}`,
      },
      {
        dimension: "Information trust",
        score: rel.data.qualityScore,
        trend: trend(rel.data.qualityScore),
        detail: `${rel.data.staleFeedCount} stale feeds`,
      },
      {
        dimension: "Alert trust",
        score: Math.max(0, 100 - rel.data.conflictCount * 15),
        trend: trend(100 - rel.data.conflictCount * 15),
        detail: rel.volatility.highVolMode ? "High-vol throttle active" : "Normal",
      },
      {
        dimension: "Operational reliability",
        score: hardening.launchReadinessScore,
        trend: trend(hardening.launchReadinessScore),
        detail: hardening.launchApproved ? "Launch gates pass" : "Hardening hold",
      },
      {
        dimension: "Workflow continuity",
        score: hardening.workflowScore,
        trend: trend(hardening.workflowScore),
        detail: `${hardening.blockers.length} blockers`,
      },
      {
        dimension: "Security perception",
        score: security.trustScore,
        trend: trend(security.trustScore),
        detail: `Session ${security.sessionHealth}`,
      },
    ];
  }
}
