import type { OperatorGuideTelemetry } from "@/types/operator-guide";

let explainSessions = 0;
let replaysStarted = 0;

export class OperatorGuideTelemetryEngine {
  static recordExplainSession(): void {
    explainSessions += 1;
  }

  static recordReplay(): void {
    replaysStarted += 1;
  }

  static snapshot(input: {
    registrySize: number;
    scenarioCount: number;
    workflowCount: number;
    explainActive: boolean;
    replayActive: boolean;
  }): OperatorGuideTelemetry {
    const coverage =
      (Math.min(input.registrySize, 40) / 40) * 35 +
      (Math.min(input.scenarioCount, 9) / 9) * 25 +
      (Math.min(input.workflowCount, 6) / 6) * 20 +
      (input.explainActive ? 10 : 0) +
      (input.replayActive ? 10 : 0);

    const guideScore = Math.round(
      Math.min(100, coverage + Math.min(explainSessions, 20) * 0.5 + Math.min(replaysStarted, 10)),
    );

    return {
      registrySize: input.registrySize,
      scenarioCount: input.scenarioCount,
      workflowCount: input.workflowCount,
      explainSessions,
      replaysStarted,
      guideScore,
    };
  }
}
