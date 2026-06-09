import { TeamPresenceEngine } from "@/lib/collaboration/TeamPresenceEngine";
import { ActivityTimelineEngine } from "@/lib/collaboration/ActivityTimelineEngine";
import type { OpsCoordinationRow } from "@/types/desk-operations";

export class OperationalCoordinationEngine {
  static board(): OpsCoordinationRow[] {
    const now = Date.now();
    const presence = TeamPresenceEngine.members();
    const activity = ActivityTimelineEngine.entries().slice(0, 4);

    const shifts: OpsCoordinationRow[] = [
      {
        id: "shift-am",
        label: "AM desk handoff",
        status: "complete",
        owner: "lead",
        updatedAt: now - 3_600_000,
      },
      {
        id: "shift-pm",
        label: "PM coverage window",
        status: "active",
        owner: presence.find((p) => p.status === "focused")?.displayHandle ?? "desk",
        updatedAt: now - 120_000,
      },
      {
        id: "incident-queue",
        label: "Open coordination items",
        status: activity.length > 2 ? "watch" : "clear",
        owner: "ops",
        updatedAt: now - 60_000,
      },
    ];

    const feed = activity.map((a) => ({
      id: a.id,
      label: a.summary.slice(0, 40),
      status: a.category === "alert" ? "escalated" : "logged",
      owner: a.actorHandle,
      updatedAt: a.timestamp,
    }));

    return [...shifts, ...feed];
  }
}
