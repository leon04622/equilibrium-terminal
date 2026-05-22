import { TeamCommunicationEngine } from "@/lib/collaboration/TeamCommunicationEngine";
import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import { ResearchDistributionEngine } from "@/lib/collaboration/ResearchDistributionEngine";
import { TeamAlertEngine } from "@/lib/collaboration/TeamAlertEngine";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { ActivityTimelineEntry } from "@/types/collaboration";

export class ActivityTimelineEngine {
  static entries(): ActivityTimelineEntry[] {
    const net = useNetworkGraphStore.getState();
    const deskId = net.activeDeskId;
    const entries: ActivityTimelineEntry[] = [];

    for (const sig of net.signals.filter((s) => s.deskId === deskId).slice(0, 6)) {
      const profile = net.getProfile(sig.publisherId);
      entries.push({
        id: `act-sig-${sig.id}`,
        deskId,
        category: "signal",
        summary: `${sig.coin} ${sig.stance} signal published`,
        actorHandle: profile?.displayHandle ?? sig.publisherId,
        coin: sig.coin,
        timestamp: sig.timestamp,
      });
    }

    for (const ann of DeskAnnotationEngine.list().slice(0, 4)) {
      entries.push({
        id: `act-ann-${ann.id}`,
        deskId,
        category: "annotation",
        summary: `${ann.kind} annotation — ${ann.label}`,
        actorHandle: ann.authorHandle,
        coin: ann.coin,
        timestamp: ann.timestamp,
      });
    }

    for (const pub of ResearchDistributionEngine.publications().slice(0, 3)) {
      entries.push({
        id: `act-res-${pub.id}`,
        deskId,
        category: "research",
        summary: `Published ${pub.kind.replace("_", " ")}: ${pub.title}`,
        actorHandle: pub.authorHandle,
        coin: pub.coins[0] ?? null,
        timestamp: pub.publishedAt,
      });
    }

    for (const alert of TeamAlertEngine.alerts().filter((a) => a.lastTriggeredAt).slice(0, 2)) {
      entries.push({
        id: `act-alert-${alert.id}`,
        deskId,
        category: "alert",
        summary: `Team alert triggered — ${alert.condition}`,
        actorHandle: alert.createdBy,
        coin: alert.coin,
        timestamp: alert.lastTriggeredAt!,
      });
    }

    for (const comm of TeamCommunicationEngine.feed().slice(0, 3)) {
      entries.push({
        id: `act-comms-${comm.id}`,
        deskId,
        category: "comms",
        summary: comm.headline,
        actorHandle: comm.authorHandle,
        coin: comm.coin,
        timestamp: comm.timestamp,
      });
    }

    for (const op of net.crdtLog.slice(0, 4)) {
      entries.push({
        id: `act-crdt-${op.opId}`,
        deskId,
        category: op.type.startsWith("layout") ? "layout" : "annotation",
        summary: `CRDT ${op.type.replace("_", " ")}`,
        actorHandle: op.peerId,
        coin: String(op.payload.coin ?? "") || null,
        timestamp: op.timestamp,
      });
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp).slice(0, 24);
  }
}
