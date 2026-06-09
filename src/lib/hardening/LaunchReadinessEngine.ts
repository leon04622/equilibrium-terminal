import type { HardeningStatus, LaunchGate } from "@/types/launch-hardening";

function gateStatus(score: number, threshold: number): HardeningStatus {
  if (score >= threshold) return "pass";
  if (score >= threshold - 15) return "watch";
  return "fail";
}

export class LaunchReadinessEngine {
  static gates(input: {
    integrationScore: number;
    workflowScore: number;
    dataQualityScore: number;
    securityScore: number;
    performanceScore: number;
    commercialScore: number;
    uxCohesionScore: number;
  }): LaunchGate[] {
    return [
      {
        id: "integration",
        label: "System integration",
        score: input.integrationScore,
        status: gateStatus(input.integrationScore, 80),
        required: true,
      },
      {
        id: "workflow",
        label: "Workflow continuity",
        score: input.workflowScore,
        status: gateStatus(input.workflowScore, 70),
        required: true,
      },
      {
        id: "data",
        label: "Data quality",
        score: input.dataQualityScore,
        status: gateStatus(input.dataQualityScore, 85),
        required: true,
      },
      {
        id: "security",
        label: "Security hardening",
        score: input.securityScore,
        status: gateStatus(input.securityScore, 75),
        required: true,
      },
      {
        id: "performance",
        label: "Performance",
        score: input.performanceScore,
        status: gateStatus(input.performanceScore, 70),
        required: true,
      },
      {
        id: "commercial",
        label: "Commercial readiness",
        score: input.commercialScore,
        status: gateStatus(input.commercialScore, 65),
        required: false,
      },
      {
        id: "ux",
        label: "UX cohesion",
        score: input.uxCohesionScore,
        status: gateStatus(input.uxCohesionScore, 75),
        required: false,
      },
    ];
  }

  static composite(gates: LaunchGate[]): number {
    const required = gates.filter((g) => g.required);
    const optional = gates.filter((g) => !g.required);
    const reqAvg =
      required.length > 0
        ? required.reduce((a, g) => a + g.score, 0) / required.length
        : 0;
    const optAvg =
      optional.length > 0
        ? optional.reduce((a, g) => a + g.score, 0) / optional.length
        : 0;
    return Math.round(reqAvg * 0.85 + optAvg * 0.15);
  }

  static blockers(gates: LaunchGate[]): string[] {
    return gates
      .filter((g) => g.required && g.status === "fail")
      .map((g) => `${g.label} below threshold (${g.score})`);
  }

  static approved(gates: LaunchGate[]): boolean {
    return gates.filter((g) => g.required).every((g) => g.status !== "fail");
  }
}
