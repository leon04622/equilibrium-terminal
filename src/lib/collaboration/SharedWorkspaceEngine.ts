import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { SharedWorkspaceState } from "@/types/collaboration";

export class SharedWorkspaceEngine {
  static state(): SharedWorkspaceState {
    const net = useNetworkGraphStore.getState();
    const desk = net.desks.find((d) => d.id === net.activeDeskId);

    return {
      deskId: desk?.id ?? net.activeDeskId,
      deskName: desk?.name ?? "DESK",
      sharedWatchlist: desk?.sharedWatchlist ?? [],
      layoutVersion: desk?.layoutVersion ?? 1,
      templateId: "tpl-institutional-v1",
      syncedAt: desk?.updatedAt ?? Date.now(),
      memberCount: desk?.memberIds.length ?? net.profiles.length,
    };
  }
}
