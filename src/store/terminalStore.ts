import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { terminalBus } from "@/store/eventBus";
import { resolveAssetIndex } from "@/lib/hyperliquid/asset-index";
import {
  normalizeClearinghouseToWebData,
  normalizeL2Book,
  normalizeTradesBatch,
  tradeToIntelligence,
} from "@/lib/hyperliquid/normalize";
import type { HlClearinghouseState } from "@/types/account";
import type { WsBook, WsTrade } from "@/types/hyperliquid";
import type {
  AiSessionState,
  ConnectionStatus,
  IntelligenceItem,
  NormalizedCandle,
  NormalizedMidSnapshot,
  NormalizedOrderBook,
  NormalizedPosition,
  NormalizedTrade,
  NormalizedWebData,
  TerminalAsset,
  WalletAuthStatus,
  WorkspaceWidget,
} from "@/types/terminal-schema";
import { FALLBACK_ASSETS } from "@/lib/assets";

const DEFAULT_WIDGETS: WorkspaceWidget[] = [
  { id: "hyperbook", type: "hyperbook", title: "HyperBook" },
  { id: "chart", type: "chart", title: "Chart" },
  { id: "intelligence", type: "intelligence", title: "Intelligence" },
  { id: "copilot", type: "copilot", title: "Omni + AI" },
  { id: "alerts", type: "alerts", title: "Alerts" },
  { id: "proactive", type: "proactive", title: "Agentic Ops" },
  { id: "teamdesk", type: "teamdesk", title: "Team Net" },
  { id: "macro", type: "macro", title: "Macro Matrix" },
];

export interface TerminalState {
  widgets: WorkspaceWidget[];
  selectedCoin: string;
  selectedAsset: TerminalAsset | null;
  assets: TerminalAsset[];
  assetsLoaded: boolean;
  connectionStatus: ConnectionStatus;
  lastMessageAt: number | null;

  book: NormalizedOrderBook | null;
  bookVersion: number;
  midFlash: "up" | "down" | null;
  trades: NormalizedTrade[];
  candles: NormalizedCandle[];
  candleVersion: number;
  mids: NormalizedMidSnapshot;
  webData: NormalizedWebData | null;
  intelligence: IntelligenceItem[];
  intelligenceVersion: number;

  ai: AiSessionState;
  omniOpen: boolean;

  walletAddress: `0x${string}` | null;
  agentAddress: `0x${string}` | null;
  authStatus: WalletAuthStatus;
  oneClickEnabled: boolean;
  accountValue: number | null;
  withdrawable: number | null;
  positions: NormalizedPosition[];
  positionsVersion: number;
  orderError: string | null;
  orderPending: boolean;
  /** @deprecated */ recentTrades: NormalizedTrade[];
  tradeTicketDraft: import("@/types/terminal-schema").TradeTicketDraft | null;

  selectAssetByCoin: (coin: string, source?: string) => void;
  applyTradeTicketDraft: (
    draft: Omit<import("@/types/terminal-schema").TradeTicketDraft, "version">,
  ) => void;
  setSelectedAsset: (asset: TerminalAsset) => void;
  setWalletAddress: (address: `0x${string}` | null) => void;
  setAgentAddress: (address: `0x${string}` | null) => void;
  setAuthStatus: (status: WalletAuthStatus) => void;
  setOneClickEnabled: (enabled: boolean) => void;
  setOrderError: (error: string | null) => void;
  setOrderPending: (pending: boolean) => void;
  clearPositionPnlFlash: (coin: string) => void;
  resetAccount: () => void;
  setAssets: (assets: TerminalAsset[]) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  touchMessage: () => void;
  applyBook: (raw: WsBook) => void;
  pushTrades: (raw: WsTrade[]) => void;
  applyCandles: (candles: NormalizedCandle[]) => void;
  applyMids: (snapshot: NormalizedMidSnapshot) => void;
  applyClearinghouse: (state: HlClearinghouseState, user: string | null) => Promise<void>;
  pushIntelligence: (item: IntelligenceItem) => void;
  setOmniOpen: (open: boolean) => void;
  submitAiPrompt: (prompt: string, source: "omnibar" | "copilot") => void;
  clearMidFlash: () => void;
  removeWidget: (id: string) => void;
}

const defaultAsset = FALLBACK_ASSETS[0];

function findAsset(assets: TerminalAsset[], coin: string): TerminalAsset | null {
  const upper = coin.toUpperCase();
  return (
    assets.find(
      (a) =>
        a.coin.toUpperCase() === upper ||
        a.symbol.toUpperCase() === upper ||
        a.coin.toUpperCase().startsWith(upper),
    ) ?? null
  );
}

function runAiStub(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("open interest") || lower.includes("funding")) {
    return "Scanning Hyperliquid perp OI + funding surfaces… Elevated funding flip detected on HYPE (+12 bps 8h) with OI +4.2% 24h. PURR spot/perp basis widening. Consider hedged basis or reduced leverage until funding mean-reverts.";
  }
  if (lower.includes("whale") || lower.includes("liquidation")) {
    return "Whale flow is concentrated in BTC/ETH perps last 15m. Intelligence panel streams large prints from the public tape; cross-reference with your margin usage before adding delta.";
  }
  return `Acknowledged: "${prompt.slice(0, 120)}". Equilibrium AI is wired to your active asset and L1 book — refine with /ai plus a metric (funding, OI, liquidations).`;
}

export const useTerminalStore = create<TerminalState>()(
  subscribeWithSelector((set, get) => ({
    widgets: DEFAULT_WIDGETS,
    selectedCoin: defaultAsset.coin,
    selectedAsset: defaultAsset,
    assets: FALLBACK_ASSETS,
    assetsLoaded: false,
    connectionStatus: "idle",
    lastMessageAt: null,
    book: null,
    bookVersion: 0,
    midFlash: null,
    trades: [],
    candles: [],
    candleVersion: 0,
    mids: { mids: {}, updatedAt: 0 },
    webData: null,
    intelligence: [],
    intelligenceVersion: 0,
    ai: { messages: [], pendingPrompt: null, isThinking: false },
    omniOpen: false,
    walletAddress: null,
    agentAddress: null,
    authStatus: "disconnected",
    oneClickEnabled: false,
    accountValue: null,
    withdrawable: null,
    positions: [],
    positionsVersion: 0,
    orderError: null,
    orderPending: false,
    recentTrades: [],
    tradeTicketDraft: null,

    setSelectedAsset: (asset) => get().selectAssetByCoin(asset.coin, "picker"),

    applyTradeTicketDraft: (draft) =>
      set((s) => ({
        tradeTicketDraft: {
          ...draft,
          version: (s.tradeTicketDraft?.version ?? 0) + 1,
        },
      })),

    setWalletAddress: (walletAddress) => {
      set({ walletAddress });
      if (walletAddress) {
        set((s) => ({
          webData: s.webData
            ? { ...s.webData, user: walletAddress }
            : { user: walletAddress, margin: null, positions: [], updatedAt: Date.now() },
        }));
      }
    },
    setAgentAddress: (agentAddress) => set({ agentAddress }),
    setAuthStatus: (authStatus) => set({ authStatus }),
    setOneClickEnabled: (oneClickEnabled) => set({ oneClickEnabled }),
    setOrderError: (orderError) => set({ orderError }),
    setOrderPending: (orderPending) => set({ orderPending }),
    clearPositionPnlFlash: (coin) =>
      set((s) => ({
        positions: s.positions.map((p) =>
          p.coin === coin ? { ...p, pnlFlash: null } : p,
        ),
      })),
    resetAccount: () =>
      set({
        walletAddress: null,
        agentAddress: null,
        authStatus: "disconnected",
        oneClickEnabled: false,
        accountValue: null,
        withdrawable: null,
        positions: [],
        positionsVersion: 0,
        webData: null,
        orderError: null,
        orderPending: false,
      }),

    selectAssetByCoin: (coin, source = "manual") => {
      const asset = findAsset(get().assets, coin) ?? get().selectedAsset;
      if (!asset) return;
      if (get().selectedCoin.toUpperCase() === asset.coin.toUpperCase()) return;
      set({
        selectedCoin: asset.coin,
        selectedAsset: asset,
        book: null,
        trades: [],
        candles: [],
        bookVersion: 0,
      });
      terminalBus.emit("asset:select", {
        coin: asset.coin,
        source,
        symbol: asset.symbol,
      });
    },

    setAssets: (assets) => set({ assets, assetsLoaded: true }),

    setConnectionStatus: (connectionStatus) => {
      set({ connectionStatus });
      terminalBus.emit("stream:status", { status: connectionStatus });
    },

    touchMessage: () => set({ lastMessageAt: Date.now() }),

    applyBook: (raw) => {
      const prev = get().book;
      const next = normalizeL2Book(raw);
      let midFlash: "up" | "down" | null = null;
      if (prev?.mid != null && next.mid != null && next.mid !== prev.mid) {
        midFlash = next.mid > prev.mid ? "up" : "down";
      }
      set((s) => ({
        book: next,
        bookVersion: s.bookVersion + 1,
        midFlash,
        lastMessageAt: Date.now(),
      }));
    },

    pushTrades: (raw) => {
      const normalized = normalizeTradesBatch(raw);
      for (const t of normalized) {
        const intel = tradeToIntelligence(t);
        if (intel) get().pushIntelligence(intel);
      }
      set((s) => {
        const trades = [...normalized, ...s.trades].slice(0, 200);
        return { trades, recentTrades: trades, lastMessageAt: Date.now() };
      });
    },

    applyCandles: (candles) =>
      set((s) => ({
        candles,
        candleVersion: s.candleVersion + 1,
        lastMessageAt: Date.now(),
      })),

    applyMids: (snapshot) => set({ mids: snapshot, lastMessageAt: Date.now() }),

    applyClearinghouse: async (state, user) => {
      const mids = get().mids.mids;
      const prev = get().positions;
      const webData = await normalizeClearinghouseToWebData(
        state,
        user,
        mids,
        resolveAssetIndex,
      );
      const positions = webData.positions.map((p) => {
        const old = prev.find((x) => x.coin === p.coin);
        let pnlFlash: "up" | "down" | null = null;
        if (old && old.unrealizedPnl !== p.unrealizedPnl) {
          pnlFlash = p.unrealizedPnl > old.unrealizedPnl ? "up" : "down";
        }
        return { ...p, pnlFlash };
      });
      set((s) => ({
        webData,
        positions,
        positionsVersion: s.positionsVersion + 1,
        accountValue: webData.margin?.accountValue ?? null,
        withdrawable: webData.margin?.withdrawable ?? null,
        lastMessageAt: Date.now(),
      }));
    },

    pushIntelligence: (item) => {
      set((s) => {
        const exists = s.intelligence.some((i) => i.id === item.id);
        if (exists) return s;
        return {
          intelligence: [item, ...s.intelligence].slice(0, 100),
          intelligenceVersion: s.intelligenceVersion + 1,
        };
      });
      terminalBus.emit("intelligence:signal", {
        id: item.id,
        coin: item.coin,
        kind: item.channel === "on-chain" ? "whale" : "social",
      });
    },

    setOmniOpen: (omniOpen) => set({ omniOpen }),

    submitAiPrompt: (prompt, source) => {
      const userMsg = {
        id: `u-${Date.now()}`,
        role: "user" as const,
        content: prompt,
        timestamp: Date.now(),
      };
      set((s) => ({
        ai: {
          ...s.ai,
          isThinking: true,
          pendingPrompt: prompt,
          messages: [...s.ai.messages, userMsg],
        },
      }));
      terminalBus.emit("ai:prompt", { prompt, source });

      window.setTimeout(() => {
        const reply = {
          id: `a-${Date.now()}`,
          role: "assistant" as const,
          content: runAiStub(prompt),
          timestamp: Date.now(),
          status: "complete" as const,
        };
        set((s) => ({
          ai: {
            messages: [...s.ai.messages, reply],
            pendingPrompt: null,
            isThinking: false,
          },
        }));
      }, 600);
    },

    clearMidFlash: () => set({ midFlash: null }),

    removeWidget: (id) =>
      set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),
  })),
);

/** Imperative stream ingress (bypasses React). */
export const terminalIngress = {
  applyBook: (raw: WsBook) => useTerminalStore.getState().applyBook(raw),
  pushTrades: (raw: WsTrade[]) => useTerminalStore.getState().pushTrades(raw),
  setConnectionStatus: (status: ConnectionStatus) =>
    useTerminalStore.getState().setConnectionStatus(status),
  touchMessage: () => useTerminalStore.getState().touchMessage(),
  applyMids: (snapshot: NormalizedMidSnapshot) =>
    useTerminalStore.getState().applyMids(snapshot),
  applyClearinghouse: (state: HlClearinghouseState, user: string | null) =>
    useTerminalStore.getState().applyClearinghouse(state, user),
  applyCandles: (candles: NormalizedCandle[]) =>
    useTerminalStore.getState().applyCandles(candles),
};

// Phase 2 compatibility alias
export const useHyperliquidStore = useTerminalStore;
export const hyperliquidActions = terminalIngress;
