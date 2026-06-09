import { FeedbackIterationEngine } from "@/lib/alpha/FeedbackIterationEngine";
import type { FeedbackLoopRow } from "@/types/live-deployment";

export class InstitutionalFeedbackEngine {
  static loops(): FeedbackLoopRow[] {
    const pains = FeedbackIterationEngine.painPoints();

    const rows: FeedbackLoopRow[] = pains.map((p) => ({
      id: p.id,
      channel: p.category,
      priority: p.priority,
      summary: p.summary,
    }));

    rows.push({
      id: "fb-desk",
      channel: "desk_interview",
      priority: "p1",
      summary: "Structured trader interviews — friction + dependency mapping",
    });
    rows.push({
      id: "fb-replay",
      channel: "workflow_replay",
      priority: "p1",
      summary: "Telemetry replay for session reconstruction",
    });

    return rows.slice(0, 8);
  }
}
