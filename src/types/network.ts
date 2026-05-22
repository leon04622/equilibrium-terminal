/** Phase 9 — Equilibrium Network Layer schemas. */

export type SignalVisibility = "private" | "team" | "public";

export type DeskRole = "viewer" | "analyst" | "lead" | "admin";

export type PeerConnectionStatus = "offline" | "connecting" | "connected" | "degraded";

export type ReputationTier = "unverified" | "bronze" | "silver" | "gold" | "institutional";

export type SharedSignalOutcome = "pending" | "hit" | "miss" | "expired";

export interface TraderTrustMetrics {
  precision: number;
  drift: number;
  maxDrawdown: number;
  isolationIndex: number;
  communityFlags: number;
  validatedSignals: number;
}

export interface TraderProfile {
  id: string;
  walletAddress: `0x${string}`;
  displayHandle: string;
  verificationKey: string;
  assetTags: string[];
  trust: TraderTrustMetrics;
  reputationScore: number;
  reputationTier: ReputationTier;
  role: DeskRole;
  deskId: string;
  lastActiveAt: number;
}

export interface SharedSignal {
  id: string;
  deskId: string;
  publisherId: string;
  publisherWallet: `0x${string}`;
  contentHash: string;
  coin: string;
  stance: "bullish" | "bearish" | "neutral";
  thesis: string;
  visibility: SignalVisibility;
  encryptedScopeKey: string;
  timestamp: number;
  targetPx: number | null;
  outcome: SharedSignalOutcome;
  realizedPx: number | null;
  outcomeAt: number | null;
}

export interface DeskWorkspace {
  id: string;
  name: string;
  teamId: string;
  memberIds: string[];
  sharedWatchlist: string[];
  layoutVersion: number;
  sandboxKey: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChartAnnotation {
  id: string;
  coin: string;
  price: number;
  label: string;
  authorId: string;
  timestamp: number;
}

export interface PeerConnection {
  peerId: string;
  walletAddress: `0x${string}`;
  status: PeerConnectionStatus;
  rttMs: number;
  lastSeenAt: number;
}

export interface CrdtOperation {
  opId: string;
  deskId: string;
  peerId: string;
  lamport: number;
  type:
    | "watchlist_add"
    | "watchlist_remove"
    | "layout_patch"
    | "annotation_add"
    | "annotation_remove";
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface KnowledgeGraphNode {
  id: string;
  kind: "trader" | "signal" | "asset" | "event";
  label: string;
  metadata: Record<string, string | number>;
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  relation: string;
  weight: number;
}

export interface GraphQueryResult {
  queryId: string;
  query: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  elapsedMs: number;
  cached: boolean;
}
