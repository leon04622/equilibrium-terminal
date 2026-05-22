/** Phase 27 — Institutional Collaboration & Team Workflows. */

export type CollaborationRole = "viewer" | "analyst" | "trader" | "researcher" | "pm" | "admin";

export type DeskVisibility = "private" | "team" | "org";

export type AnnotationKind =
  | "chart"
  | "liquidity"
  | "event"
  | "thesis"
  | "macro"
  | "execution";

export type CommunicationKind =
  | "desk_commentary"
  | "market_update"
  | "execution_alert"
  | "briefing"
  | "research_thread";

export type ResearchPublicationKind =
  | "thesis"
  | "sector_report"
  | "event_summary"
  | "macro_briefing"
  | "market_recap";

export type TeamAlertScope = "personal" | "desk" | "org";

export type PresenceStatus = "offline" | "idle" | "active" | "focused";

export interface CollaborationPermissionSet {
  role: CollaborationRole;
  canPublishSignals: boolean;
  canAnnotate: boolean;
  canShareLayout: boolean;
  canPublishResearch: boolean;
  canManageAlerts: boolean;
  canManageDesk: boolean;
  canViewAudit: boolean;
}

export interface TeamPresenceMember {
  memberId: string;
  displayHandle: string;
  role: CollaborationRole;
  status: PresenceStatus;
  focusedPanel: string | null;
  activeCoin: string | null;
  lastSeenAt: number;
  rttMs: number;
}

export interface MarketAnnotation {
  id: string;
  deskId: string;
  kind: AnnotationKind;
  coin: string;
  price: number | null;
  label: string;
  body: string;
  authorId: string;
  authorHandle: string;
  visibility: DeskVisibility;
  tags: string[];
  timestamp: number;
  pinned: boolean;
}

export interface DeskCommunication {
  id: string;
  deskId: string;
  kind: CommunicationKind;
  authorId: string;
  authorHandle: string;
  headline: string;
  body: string;
  coin: string | null;
  severity: "info" | "watch" | "critical";
  visibility: DeskVisibility;
  timestamp: number;
  replyCount: number;
}

export interface ResearchPublication {
  id: string;
  deskId: string;
  kind: ResearchPublicationKind;
  title: string;
  summary: string;
  authorId: string;
  authorHandle: string;
  sectors: string[];
  coins: string[];
  visibility: DeskVisibility;
  publishedAt: number;
  version: number;
}

export interface TeamAlert {
  id: string;
  deskId: string;
  scope: TeamAlertScope;
  coin: string;
  condition: string;
  severity: "info" | "watch" | "critical";
  createdBy: string;
  active: boolean;
  subscriberCount: number;
  lastTriggeredAt: number | null;
}

export interface SharedWorkspaceState {
  deskId: string;
  deskName: string;
  sharedWatchlist: string[];
  layoutVersion: number;
  templateId: string | null;
  syncedAt: number;
  memberCount: number;
}

export interface ActivityTimelineEntry {
  id: string;
  deskId: string;
  category: "signal" | "annotation" | "research" | "alert" | "layout" | "presence" | "comms";
  summary: string;
  actorHandle: string;
  coin: string | null;
  timestamp: number;
}

export interface OrganizationalMemoryItem {
  id: string;
  kind: "research" | "annotation" | "event_analysis" | "thesis_evolution" | "market_reaction";
  title: string;
  summary: string;
  coin: string | null;
  archivedAt: number;
  authorHandle: string;
  tags: string[];
}

export interface CollaborationAuditEntry {
  id: string;
  action: string;
  actorId: string;
  actorHandle: string;
  resource: string;
  timestamp: number;
  allowed: boolean;
}

export interface CollaborationSnapshot {
  deskId: string;
  deskName: string;
  permissions: CollaborationPermissionSet;
  presence: TeamPresenceMember[];
  annotations: MarketAnnotation[];
  communications: DeskCommunication[];
  research: ResearchPublication[];
  teamAlerts: TeamAlert[];
  sharedWorkspace: SharedWorkspaceState;
  activity: ActivityTimelineEntry[];
  memory: OrganizationalMemoryItem[];
  auditTrail: CollaborationAuditEntry[];
  syncLatencyMs: number;
  collaborationScore: number;
  updatedAt: number;
}
