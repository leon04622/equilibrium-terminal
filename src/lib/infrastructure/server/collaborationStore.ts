import type { ActivityTimelineEntry, MarketAnnotation } from "@/types/collaboration";

const cache: {
  deskId: string;
  activity: ActivityTimelineEntry[];
  annotations: MarketAnnotation[];
  updatedAt: number;
} = {
  deskId: "",
  activity: [],
  annotations: [],
  updatedAt: 0,
};

export function syncCollaborationDesk(payload: {
  deskId: string;
  activity: ActivityTimelineEntry[];
  annotations: MarketAnnotation[];
}): void {
  cache.deskId = payload.deskId;
  cache.activity = payload.activity.slice(0, 32);
  cache.annotations = payload.annotations.slice(0, 32);
  cache.updatedAt = Date.now();
}

export function getCollaborationVitals(): {
  deskId: string;
  activityCount: number;
  annotationCount: number;
  updatedAt: number;
  syncReady: boolean;
} {
  return {
    deskId: cache.deskId || "desk-eq-alpha",
    activityCount: cache.activity.length,
    annotationCount: cache.annotations.length,
    updatedAt: cache.updatedAt || Date.now(),
    syncReady: true,
  };
}

export function getCollaborationActivity(limit = 16): ActivityTimelineEntry[] {
  return cache.activity.slice(0, limit);
}
