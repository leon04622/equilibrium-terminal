import type { DeskRole, SharedSignal, SignalVisibility } from "@/types/network";

const ROLE_RANK: Record<DeskRole, number> = {
  viewer: 0,
  analyst: 1,
  lead: 2,
  admin: 3,
};

export function canAccessDesk(
  viewerDeskId: string,
  signalDeskId: string,
  viewerRole: DeskRole,
): boolean {
  if (viewerDeskId !== signalDeskId) return false;
  return ROLE_RANK[viewerRole] >= ROLE_RANK.viewer;
}

export function canViewSignal(
  signal: SharedSignal,
  viewerDeskId: string,
  viewerRole: DeskRole,
  viewerId: string,
): boolean {
  if (signal.visibility === "public") return true;
  if (!canAccessDesk(viewerDeskId, signal.deskId, viewerRole)) return false;
  if (signal.visibility === "private") {
    return signal.publisherId === viewerId || ROLE_RANK[viewerRole] >= ROLE_RANK.lead;
  }
  return signal.visibility === "team";
}

export function filterSignalsForViewer(
  signals: SharedSignal[],
  viewerDeskId: string,
  viewerRole: DeskRole,
  viewerId: string,
): SharedSignal[] {
  return signals.filter((s) => canViewSignal(s, viewerDeskId, viewerRole, viewerId));
}

export function filterPublicGraphSignals(signals: SharedSignal[]): SharedSignal[] {
  return signals.filter((s) => s.visibility === "public");
}

export function assertNoSandboxBleed(
  signal: SharedSignal,
  target: "public_graph" | "global_feed",
  viewerDeskId: string,
): boolean {
  if (target === "public_graph" && signal.visibility !== "public") return false;
  if (signal.visibility === "team" && signal.deskId !== viewerDeskId) return false;
  if (signal.visibility === "private") return false;
  return true;
}

export function visibilityLabel(v: SignalVisibility): string {
  switch (v) {
    case "private":
      return "PRV";
    case "team":
      return "TEAM";
    default:
      return "PUB";
  }
}
