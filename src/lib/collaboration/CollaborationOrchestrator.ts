import { CollaborationPermissionEngine } from "@/lib/collaboration/CollaborationPermissionEngine";
import { TeamPresenceEngine } from "@/lib/collaboration/TeamPresenceEngine";
import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import { TeamCommunicationEngine } from "@/lib/collaboration/TeamCommunicationEngine";
import { ResearchDistributionEngine } from "@/lib/collaboration/ResearchDistributionEngine";
import { TeamAlertEngine } from "@/lib/collaboration/TeamAlertEngine";
import { SharedWorkspaceEngine } from "@/lib/collaboration/SharedWorkspaceEngine";
import { ActivityTimelineEngine } from "@/lib/collaboration/ActivityTimelineEngine";
import { OrganizationalMemoryEngine } from "@/lib/collaboration/OrganizationalMemoryEngine";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { CollaborationAuditEntry, CollaborationSnapshot } from "@/types/collaboration";

export class CollaborationOrchestrator {
  static snapshot(): CollaborationSnapshot {
    const t0 = performance.now();
    const net = useNetworkGraphStore.getState();
    const desk = net.desks.find((d) => d.id === net.activeDeskId);
    const platformRole = useProductionConfigStore.getState().primaryRole();
    const permissions = CollaborationPermissionEngine.resolve(platformRole, net.localRole);

    const presence = TeamPresenceEngine.members();
    const annotations = DeskAnnotationEngine.list();
    const communications = TeamCommunicationEngine.feed();
    const research = ResearchDistributionEngine.publications();
    const teamAlerts = TeamAlertEngine.alerts();
    const sharedWorkspace = SharedWorkspaceEngine.state();
    const activity = ActivityTimelineEngine.entries();
    const memory = OrganizationalMemoryEngine.archive();

    const auditTrail: CollaborationAuditEntry[] = [
      {
        id: "audit-01",
        action: "layout_sync",
        actorId: net.localTraderId,
        actorHandle: net.getProfile(net.localTraderId)?.displayHandle ?? "LOCAL",
        resource: `desk:${net.activeDeskId}`,
        timestamp: Date.now() - 120_000,
        allowed: permissions.canShareLayout,
      },
      {
        id: "audit-02",
        action: "signal_publish",
        actorId: net.localTraderId,
        actorHandle: net.getProfile(net.localTraderId)?.displayHandle ?? "LOCAL",
        resource: "signal:team",
        timestamp: Date.now() - 300_000,
        allowed: permissions.canPublishSignals,
      },
    ];

    const activeMembers = presence.filter((p) => p.status !== "offline").length;
    const collaborationScore = Math.round(
      Math.min(
        100,
        activeMembers * 12 +
          annotations.length * 3 +
          communications.length * 2 +
          research.length * 4 +
          (sharedWorkspace.layoutVersion > 1 ? 10 : 0),
      ),
    );

    return {
      deskId: net.activeDeskId,
      deskName: desk?.name ?? "DESK",
      permissions,
      presence,
      annotations,
      communications,
      research,
      teamAlerts,
      sharedWorkspace,
      activity,
      memory,
      auditTrail,
      syncLatencyMs: Math.round(performance.now() - t0),
      collaborationScore,
      updatedAt: Date.now(),
    };
  }
}
