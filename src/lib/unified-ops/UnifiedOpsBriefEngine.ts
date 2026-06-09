import type { UnifiedOpsSnapshot } from "@/types/unified-operations";

export class UnifiedOpsBriefEngine {
  static brief(
    snapshot: Pick<
      UnifiedOpsSnapshot,
      "globalContext" | "workflowCoordination" | "activeTerminalMode" | "telemetry"
    >,
  ): string {
    const asset = snapshot.globalContext.find((c) => c.key === "asset")?.value ?? "—";
    const phase = snapshot.globalContext.find((c) => c.key === "workflow")?.value ?? "—";
    const adapt = snapshot.workflowCoordination.find((w) => w.id === "wf-adapt");
    return `Unified OS · ${asset} · ${phase} · mode ${snapshot.activeTerminalMode} · ${adapt?.status ?? "sync"} · score ${snapshot.telemetry.unifiedScore}`;
  }
}
