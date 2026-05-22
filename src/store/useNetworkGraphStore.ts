import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { filterSignalsForViewer, filterPublicGraphSignals } from "@/lib/network/NetworkSandbox";
import { reputationEngine } from "@/lib/network/ReputationEngine";
import { hashSharedSignalPayload } from "@/lib/network/SignalHasher";
import type {
  ChartAnnotation,
  CrdtOperation,
  DeskRole,
  DeskWorkspace,
  GraphQueryResult,
  PeerConnection,
  SharedSignal,
  TraderProfile,
} from "@/types/network";

const DEFAULT_DESK_ID = "desk-eq-alpha";

function seedProfiles(): TraderProfile[] {
  const deskId = DEFAULT_DESK_ID;
  return [
    {
      id: "trader-01",
      walletAddress: "0x1111111111111111111111111111111111111111",
      displayHandle: "MACRO_LEAD",
      verificationKey: "eqvk-macro-01",
      assetTags: ["BTC", "ETH", "HYPE"],
      trust: {
        precision: 0.71,
        drift: 0.04,
        maxDrawdown: 0.12,
        isolationIndex: 0.08,
        communityFlags: 0,
        validatedSignals: 42,
      },
      reputationScore: 0.78,
      reputationTier: "gold",
      role: "lead",
      deskId,
      lastActiveAt: Date.now(),
    },
    {
      id: "trader-02",
      walletAddress: "0x2222222222222222222222222222222222222222",
      displayHandle: "PERP_DESK_A",
      verificationKey: "eqvk-perp-02",
      assetTags: ["HYPE", "PURR", "SOL"],
      trust: {
        precision: 0.64,
        drift: 0.06,
        maxDrawdown: 0.18,
        isolationIndex: 0.14,
        communityFlags: 0,
        validatedSignals: 28,
      },
      reputationScore: 0.62,
      reputationTier: "silver",
      role: "analyst",
      deskId,
      lastActiveAt: Date.now() - 8_000,
    },
    {
      id: "trader-03",
      walletAddress: "0x3333333333333333333333333333333333333333",
      displayHandle: "FLOW_SCOUT",
      verificationKey: "eqvk-flow-03",
      assetTags: ["BTC", "PURR"],
      trust: {
        precision: 0.58,
        drift: 0.09,
        maxDrawdown: 0.22,
        isolationIndex: 0.21,
        communityFlags: 1,
        validatedSignals: 15,
      },
      reputationScore: 0.51,
      reputationTier: "bronze",
      role: "analyst",
      deskId,
      lastActiveAt: Date.now() - 22_000,
    },
  ];
}

function seedDesk(): DeskWorkspace {
  return {
    id: DEFAULT_DESK_ID,
    name: "EQ ALPHA DESK",
    teamId: "team-eq-01",
    memberIds: ["trader-01", "trader-02", "trader-03"],
    sharedWatchlist: ["BTC", "HYPE", "ETH"],
    layoutVersion: 1,
    sandboxKey: "sandbox-eq-alpha-v1",
    createdAt: Date.now() - 86_400_000,
    updatedAt: Date.now(),
  };
}

export interface NetworkGraphState {
  activeDeskId: string;
  localPeerId: string;
  localTraderId: string;
  localRole: DeskRole;
  privateRoutingEnabled: boolean;
  peers: PeerConnection[];
  desks: DeskWorkspace[];
  profiles: TraderProfile[];
  signals: SharedSignal[];
  signalsVersion: number;
  annotations: Record<string, ChartAnnotation[]>;
  lastGraphQuery: GraphQueryResult | null;
  crdtLog: CrdtOperation[];
  reputationVersion: number;

  setPrivateRouting: (enabled: boolean) => void;
  setActiveDesk: (deskId: string) => void;
  upsertPeer: (peer: PeerConnection) => void;
  publishSignal: (
    input: Omit<
      SharedSignal,
      "id" | "contentHash" | "timestamp" | "outcome" | "realizedPx" | "outcomeAt"
    >,
  ) => void;
  resolveSignalOutcome: (signalId: string, realizedPx: number) => void;
  visibleSignals: () => SharedSignal[];
  publicGraphSignals: () => SharedSignal[];
  applySharedWatchlist: (deskId: string, coins: string[]) => void;
  upsertAnnotation: (deskId: string, ann: ChartAnnotation) => void;
  removeAnnotation: (deskId: string, id: string) => void;
  recordOperation: (op: CrdtOperation) => void;
  setGraphQueryResult: (result: GraphQueryResult) => void;
  recomputeReputation: (marketTicks: { coin: string; px: number; timestamp: number }[]) => void;
  getProfile: (id: string) => TraderProfile | undefined;
}

export const useNetworkGraphStore = create<NetworkGraphState>()(
  subscribeWithSelector((set, get) => ({
    activeDeskId: DEFAULT_DESK_ID,
    localPeerId: "peer-local",
    localTraderId: "trader-01",
    localRole: "lead",
    privateRoutingEnabled: true,
    peers: [
      {
        peerId: "peer-02",
        walletAddress: "0x2222222222222222222222222222222222222222",
        status: "connected",
        rttMs: 14,
        lastSeenAt: Date.now(),
      },
      {
        peerId: "peer-03",
        walletAddress: "0x3333333333333333333333333333333333333333",
        status: "connected",
        rttMs: 19,
        lastSeenAt: Date.now() - 4_000,
      },
    ],
    desks: [seedDesk()],
    profiles: seedProfiles(),
    signals: [],
    signalsVersion: 0,
    annotations: {},
    lastGraphQuery: null,
    crdtLog: [],
    reputationVersion: 0,

    setPrivateRouting: (enabled) => set({ privateRoutingEnabled: enabled }),

    setActiveDesk: (deskId) => set({ activeDeskId: deskId }),

    upsertPeer: (peer) =>
      set((s) => {
        const peers = s.peers.filter((p) => p.peerId !== peer.peerId);
        peers.push(peer);
        return { peers };
      }),

    publishSignal: (input) => {
      const timestamp = Date.now();
      const contentHash = hashSharedSignalPayload({
        publisherWallet: input.publisherWallet,
        coin: input.coin,
        stance: input.stance,
        thesis: input.thesis,
        timestamp,
        deskId: input.deskId,
      });
      const signal: SharedSignal = {
        ...input,
        id: `sig-${timestamp}`,
        contentHash,
        timestamp,
        outcome: "pending",
        realizedPx: null,
        outcomeAt: null,
      };
      set((s) => ({
        signals: [signal, ...s.signals].slice(0, 500),
        signalsVersion: s.signalsVersion + 1,
      }));
    },

    resolveSignalOutcome: (signalId, realizedPx) =>
      set((s) => ({
        signals: s.signals.map((sig) =>
          sig.id === signalId
            ? {
                ...sig,
                realizedPx,
                outcomeAt: Date.now(),
                outcome:
                  sig.targetPx === null
                    ? "expired"
                    : sig.stance === "bullish"
                      ? realizedPx > sig.targetPx
                        ? "hit"
                        : "miss"
                      : realizedPx < sig.targetPx
                        ? "hit"
                        : "miss",
              }
            : sig,
        ),
        signalsVersion: s.signalsVersion + 1,
      })),

    visibleSignals: () => {
      const s = get();
      return filterSignalsForViewer(
        s.signals,
        s.activeDeskId,
        s.localRole,
        s.localTraderId,
      );
    },

    publicGraphSignals: () => filterPublicGraphSignals(get().signals),

    applySharedWatchlist: (deskId, coins) =>
      set((s) => ({
        desks: s.desks.map((d) =>
          d.id === deskId
            ? {
                ...d,
                sharedWatchlist: coins,
                updatedAt: Date.now(),
                layoutVersion: d.layoutVersion + 1,
              }
            : d,
        ),
      })),

    upsertAnnotation: (deskId, ann) =>
      set((s) => {
        const list = s.annotations[deskId] ?? [];
        const next = [...list.filter((a) => a.id !== ann.id), ann];
        return { annotations: { ...s.annotations, [deskId]: next } };
      }),

    removeAnnotation: (deskId, id) =>
      set((s) => {
        const list = s.annotations[deskId] ?? [];
        return {
          annotations: {
            ...s.annotations,
            [deskId]: list.filter((a) => a.id !== id),
          },
        };
      }),

    recordOperation: (op) =>
      set((s) => ({
        crdtLog: [op, ...s.crdtLog].slice(0, 100),
      })),

    setGraphQueryResult: (result) => set({ lastGraphQuery: result }),

    recomputeReputation: (marketTicks) => {
      const s = get();
      const evals = reputationEngine.evaluateAll(s.signals, marketTicks, s.profiles);
      set((state) => ({
        profiles: state.profiles.map((p) => {
          const ev = evals.get(p.walletAddress.toLowerCase());
          if (!ev) return p;
          return {
            ...p,
            reputationScore: ev.score,
            reputationTier: ev.tier,
            trust: ev.metrics,
          };
        }),
        reputationVersion: state.reputationVersion + 1,
      }));
    },

    getProfile: (id) => get().profiles.find((p) => p.id === id),
  })),
);
