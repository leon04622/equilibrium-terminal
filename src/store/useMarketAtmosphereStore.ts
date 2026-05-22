import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  MacroCalendarEvent,
  MacroTickerData,
  MarketRegime,
  MarketStressGauge,
  RegimeAtmosphereState,
  TacticalOverlayFrame,
  TacticalWireItem,
  WireDirection,
  WireSeverity,
} from "@/types/market-atmosphere";

const DEFAULT_MACRO: MacroTickerData[] = [
  {
    symbol: "DXY",
    label: "DXY INDEX",
    last: 104.82,
    changePct: 0.12,
    sessionHigh: 105.01,
    sessionLow: 104.55,
    updatedAt: Date.now(),
  },
  {
    symbol: "US10Y",
    label: "US 10Y YIELD",
    last: 4.287,
    changePct: -0.04,
    sessionHigh: 4.312,
    sessionLow: 4.261,
    updatedAt: Date.now(),
  },
  {
    symbol: "ES",
    label: "ES FUT",
    last: 5842.25,
    changePct: 0.18,
    sessionHigh: 5851.0,
    sessionLow: 5828.5,
    updatedAt: Date.now(),
  },
  {
    symbol: "NQ",
    label: "NQ FUT",
    last: 20418.5,
    changePct: 0.22,
    sessionHigh: 20455.0,
    sessionLow: 20372.0,
    updatedAt: Date.now(),
  },
  {
    symbol: "YM",
    label: "YM FUT",
    last: 42105,
    changePct: 0.09,
    sessionHigh: 42188,
    sessionLow: 42042,
    updatedAt: Date.now(),
  },
];

const DEFAULT_CALENDAR: MacroCalendarEvent[] = [
  {
    id: "cal-cpi",
    title: "US CPI MOM",
    region: "US",
    impact: "high",
    scheduledAt: Date.now() + 3_600_000 * 4,
    forecast: "0.3%",
    previous: "0.2%",
  },
  {
    id: "cal-fomc",
    title: "FOMC MINUTES",
    region: "US",
    impact: "high",
    scheduledAt: Date.now() + 3_600_000 * 26,
    forecast: null,
    previous: null,
  },
  {
    id: "cal-claims",
    title: "INITIAL CLAIMS",
    region: "US",
    impact: "med",
    scheduledAt: Date.now() + 3_600_000 * 18,
    forecast: "218K",
    previous: "221K",
  },
];

function defaultStress(): MarketStressGauge {
  return {
    score: 42,
    bookImbalance: 0,
    velocityRatio: 1,
    spreadBps: 0,
    updatedAt: Date.now(),
  };
}

function defaultRegime(): RegimeAtmosphereState {
  return {
    regime: "neutral",
    confidencePulse: 62,
    narrativeAcceleration: 0,
    dominantMacro: "DXY",
    updatedAt: Date.now(),
  };
}

function emptyOverlay(coin: string): TacticalOverlayFrame {
  return {
    coin,
    mid: null,
    priceMin: 0,
    priceMax: 1,
    liquidityBands: [],
    liquidationZones: [],
    executionMarkers: [],
    version: 0,
    updatedAt: Date.now(),
  };
}

export interface MarketAtmosphereState {
  stress: MarketStressGauge;
  macro: MacroTickerData[];
  calendar: MacroCalendarEvent[];
  regime: RegimeAtmosphereState;
  overlay: TacticalOverlayFrame;
  wire: TacticalWireItem[];
  wireVersion: number;
  heartbeatAt: number;

  applyStress: (patch: Partial<MarketStressGauge>) => void;
  applyMacroTick: (symbol: MacroTickerData["symbol"], patch: Partial<MacroTickerData>) => void;
  setRegime: (patch: Partial<RegimeAtmosphereState>) => void;
  pulseConfidence: (delta: number) => void;
  setOverlay: (frame: TacticalOverlayFrame) => void;
  pushWire: (item: Omit<TacticalWireItem, "isNew">) => void;
  clearWireFlash: (id: string) => void;
  ingestIntelligenceWire: (input: {
    id: string;
    coin: string;
    headline: string;
    channel: TacticalWireItem["channel"];
    severity: WireSeverity;
    notionalUsd?: number;
    timestamp: number;
    direction?: WireDirection;
    confidenceIndex?: number;
    acceleration?: number;
  }) => void;
  touchHeartbeat: () => void;
}

export const useMarketAtmosphereStore = create<MarketAtmosphereState>()(
  subscribeWithSelector((set, get) => ({
    stress: defaultStress(),
    macro: DEFAULT_MACRO,
    calendar: DEFAULT_CALENDAR,
    regime: defaultRegime(),
    overlay: emptyOverlay("HYPE"),
    wire: [],
    wireVersion: 0,
    heartbeatAt: Date.now(),

    applyStress: (patch) =>
      set((s) => ({
        stress: { ...s.stress, ...patch, updatedAt: Date.now() },
      })),

    applyMacroTick: (symbol, patch) =>
      set((s) => ({
        macro: s.macro.map((row) =>
          row.symbol === symbol
            ? { ...row, ...patch, updatedAt: Date.now() }
            : row,
        ),
      })),

    setRegime: (patch) =>
      set((s) => ({
        regime: { ...s.regime, ...patch, updatedAt: Date.now() },
      })),

    pulseConfidence: (delta) =>
      set((s) => {
        const next = Math.max(0, Math.min(100, s.regime.confidencePulse + delta));
        return {
          regime: {
            ...s.regime,
            confidencePulse: next,
            updatedAt: Date.now(),
          },
        };
      }),

    setOverlay: (frame) =>
      set({
        overlay: frame,
      }),

    pushWire: (item) =>
      set((s) => ({
        wire: [{ ...item, isNew: true }, ...s.wire].slice(0, 120),
        wireVersion: s.wireVersion + 1,
      })),

    clearWireFlash: (id) =>
      set((s) => ({
        wire: s.wire.map((w) => (w.id === id ? { ...w, isNew: false } : w)),
      })),

    ingestIntelligenceWire: (input) => {
      const direction: WireDirection =
        input.direction ??
        (input.headline.toLowerCase().includes("liq") ||
        input.headline.toLowerCase().includes("flush")
          ? "bearish"
          : input.headline.toLowerCase().includes("build") ||
              input.headline.toLowerCase().includes("surge")
            ? "bullish"
            : "neutral");

      const confidenceIndex =
        input.confidenceIndex ??
        (input.severity === "critical"
          ? 94
          : input.severity === "watch"
            ? 76
            : 58);

      const acceleration =
        input.acceleration ??
        Math.round(
          (input.notionalUsd ? Math.log10(input.notionalUsd + 1) * 8 : 12) *
            (input.severity === "critical" ? 1.4 : 1),
        );

      get().pushWire({
        id: input.id,
        coin: input.coin,
        headline: input.headline,
        channel: input.channel,
        severity: input.severity,
        confidenceIndex,
        direction,
        acceleration,
        notionalUsd: input.notionalUsd,
        timestamp: input.timestamp,
      });
    },

    touchHeartbeat: () => set({ heartbeatAt: Date.now() }),
  })),
);
