import { EnterpriseReliabilityEngine } from "@/lib/enterprise/EnterpriseReliabilityEngine";
import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import { ExecutionAnalyticsEngine } from "@/lib/ecosystem/ExecutionAnalyticsEngine";
import type { TrustPillarRow } from "@/types/global-infrastructure";

export class InstitutionalTrustEngine {
  static pillars(): TrustPillarRow[] {
    const reliability = ReliabilityOrchestrator.snapshot();
    const enterprise = EnterpriseReliabilityEngine.state();
    const exec = ExecutionAnalyticsEngine.analytics();
    const avgSlip =
      exec.length > 0
        ? exec.reduce((s, r) => s + r.avgSlippageBps, 0) / exec.length
        : 8;

    const execQuality = Math.max(0, Math.min(100, 100 - avgSlip * 4));

    return [
      {
        pillar: "Uptime",
        score: Math.round(enterprise.uptimePct),
        trend: enterprise.uptimePct > 98 ? "up" : "flat",
      },
      {
        pillar: "Reliability",
        score: Math.round(reliability.trustScore),
        trend: "up",
      },
      {
        pillar: "Execution Quality",
        score: Math.round(execQuality),
        trend: avgSlip < 6 ? "up" : "flat",
      },
      {
        pillar: "Information Accuracy",
        score: 86,
        trend: "flat",
      },
      {
        pillar: "Operational Consistency",
        score: 82,
        trend: "up",
      },
      {
        pillar: "Workflow Superiority",
        score: 88,
        trend: "up",
      },
    ];
  }
}
