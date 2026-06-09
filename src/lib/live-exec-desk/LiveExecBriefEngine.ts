import type { LiveExecSnapshot } from "@/types/live-execution";

export class LiveExecBriefEngine {
  static brief(
    snapshot: Pick<LiveExecSnapshot, "asset" | "context" | "rapidResponse" | "telemetry">,
  ): string {
    const tier = snapshot.context.find((c) => c.metric === "slippage");
    const critical = snapshot.rapidResponse.filter((r) => r.severity === "critical").length;
    if (critical > 0) {
      return `${snapshot.asset} LIVE · ${critical} response trigger(s) · ${tier?.value ?? "—"} · score ${snapshot.telemetry.liveExecScore}`;
    }
    return `${snapshot.asset} floor · ${tier?.value ?? "spread ok"} · ${snapshot.telemetry.openPositions} pos · score ${snapshot.telemetry.liveExecScore}`;
  }
}
