import { TeamCommunicationEngine } from "@/lib/collaboration/TeamCommunicationEngine";
import type { CoordinationRow } from "@/types/live-execution";

export class ExecutionCoordinationDeskEngine {
  static feed(): CoordinationRow[] {
    return TeamCommunicationEngine.feed()
      .filter((c) => c.kind === "execution_alert" || c.kind === "desk_commentary")
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        kind: c.kind,
        message: c.headline,
        author: c.authorHandle,
      }));
  }
}
