/** Hyperliquid / TradingView-style indicator catalog. */

export type IndicatorPane = "overlay" | "pane";

export type IndicatorCategory =
  | "popular"
  | "trend"
  | "momentum"
  | "volatility"
  | "volume"
  | "breadth";

export interface IndicatorDefinition {
  id: string;
  name: string;
  category: IndicatorCategory;
  pane: IndicatorPane;
  /** True when we can compute and render this indicator. */
  implemented: boolean;
  defaultFavorite?: boolean;
  color: string;
  colors?: string[];
  period?: number;
  description?: string;
}

/** Default HL favorites from the platform screenshot. */
export const DEFAULT_FAVORITE_IDS = [
  "ema",
  "rsi",
  "smma",
  "vol_profile_fixed",
  "vol_profile_visible",
  "vwap",
] as const;

export const INDICATOR_CATALOG: IndicatorDefinition[] = [
  // —— Favorites / popular (HL defaults) ——
  {
    id: "ema",
    name: "Moving Average Exponential",
    category: "popular",
    pane: "overlay",
    implemented: true,
    defaultFavorite: true,
    color: "#f59e0b",
    period: 21,
  },
  {
    id: "rsi",
    name: "Relative Strength Index",
    category: "popular",
    pane: "pane",
    implemented: true,
    defaultFavorite: true,
    color: "#a855f7",
    period: 14,
  },
  {
    id: "smma",
    name: "Smoothed Moving Average",
    category: "popular",
    pane: "overlay",
    implemented: true,
    defaultFavorite: true,
    color: "#22d3ee",
    period: 7,
  },
  {
    id: "vol_profile_fixed",
    name: "Volume Profile Fixed Range",
    category: "volume",
    pane: "overlay",
    implemented: true,
    defaultFavorite: true,
    color: "#787b86",
    description: "Volume-at-price for visible history",
  },
  {
    id: "vol_profile_visible",
    name: "Volume Profile Visible Range",
    category: "volume",
    pane: "overlay",
    implemented: true,
    defaultFavorite: true,
    color: "#787b86",
    description: "Volume-at-price for chart viewport",
  },
  {
    id: "vwap",
    name: "VWAP",
    category: "volume",
    pane: "overlay",
    implemented: true,
    defaultFavorite: true,
    color: "#e879f9",
  },

  // —— Alphabetical (TradingView / HL list) ——
  {
    id: "w52_hl",
    name: "52 Week High/Low",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#94a3b8",
    colors: ["#22c55e", "#ef4444"],
  },
  {
    id: "ao",
    name: "Accelerator Oscillator",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#06b6d4",
  },
  {
    id: "ad",
    name: "Accumulation/Distribution",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#84cc16",
  },
  {
    id: "asi",
    name: "Accumulative Swing Index",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#f97316",
  },
  {
    id: "advance_decline",
    name: "Advance/Decline",
    category: "breadth",
    pane: "pane",
    implemented: false,
    color: "#64748b",
    description: "Requires market breadth feed",
  },
  {
    id: "aroon",
    name: "Aroon",
    category: "trend",
    pane: "pane",
    implemented: true,
    color: "#3b82f6",
    colors: ["#3b82f6", "#f43f5e"],
  },
  {
    id: "adx",
    name: "Average Directional Index",
    category: "trend",
    pane: "pane",
    implemented: true,
    color: "#eab308",
  },
  {
    id: "atr",
    name: "Average True Range",
    category: "volatility",
    pane: "pane",
    implemented: true,
    color: "#fb923c",
    period: 14,
  },
  {
    id: "bb",
    name: "Bollinger Bands",
    category: "volatility",
    pane: "overlay",
    implemented: true,
    color: "#6366f1",
    colors: ["#6366f1", "#818cf8", "#6366f1"],
    period: 20,
  },
  {
    id: "cci",
    name: "Commodity Channel Index",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#c084fc",
    period: 20,
  },
  {
    id: "cmo",
    name: "Chande Momentum Oscillator",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#2dd4bf",
    period: 14,
  },
  {
    id: "dpo",
    name: "Detrended Price Oscillator",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#a78bfa",
    period: 21,
  },
  {
    id: "donchian",
    name: "Donchian Channels",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#38bdf8",
    colors: ["#38bdf8", "#7dd3fc", "#38bdf8"],
    period: 20,
  },
  {
    id: "ema_9",
    name: "EMA 9",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#fbbf24",
    period: 9,
  },
  {
    id: "ema_50",
    name: "EMA 50",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#2962ff",
    period: 50,
  },
  {
    id: "hma",
    name: "Hull Moving Average",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#14b8a6",
    period: 21,
  },
  {
    id: "ichimoku",
    name: "Ichimoku Cloud",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#ef4444",
    colors: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7"],
  },
  {
    id: "keltner",
    name: "Keltner Channels",
    category: "volatility",
    pane: "overlay",
    implemented: true,
    color: "#8b5cf6",
    colors: ["#8b5cf6", "#a78bfa", "#8b5cf6"],
    period: 20,
  },
  {
    id: "macd",
    name: "MACD",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#2962ff",
    colors: ["#2962ff", "#f59e0b"],
  },
  {
    id: "mfi",
    name: "Money Flow Index",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#10b981",
    period: 14,
  },
  {
    id: "momentum",
    name: "Momentum",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#0ea5e9",
    period: 10,
  },
  {
    id: "obv",
    name: "On Balance Volume",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#64748b",
  },
  {
    id: "psar",
    name: "Parabolic SAR",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#f472b6",
  },
  {
    id: "roc",
    name: "Rate of Change",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#fcd34d",
    period: 12,
  },
  {
    id: "sma",
    name: "Moving Average",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#cbd5e1",
    period: 20,
  },
  {
    id: "stoch",
    name: "Stochastic",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#5b9cf6",
    colors: ["#5b9cf6", "#f59e0b"],
    period: 14,
  },
  {
    id: "stoch_rsi",
    name: "Stochastic RSI",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#818cf8",
    colors: ["#818cf8", "#f472b6"],
    period: 14,
  },
  {
    id: "supertrend",
    name: "SuperTrend",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#22c55e",
    period: 10,
  },
  {
    id: "trix",
    name: "TRIX",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#e879f9",
    period: 15,
  },
  {
    id: "uo",
    name: "Ultimate Oscillator",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#34d399",
  },
  {
    id: "volume_osc",
    name: "Volume Oscillator",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#94a3b8",
  },
  {
    id: "wma",
    name: "Moving Average Weighted",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#94a3b8",
    period: 20,
  },
  {
    id: "williams_r",
    name: "Williams %R",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#f87171",
    period: 14,
  },
  {
    id: "zigzag",
    name: "Zig Zag",
    category: "trend",
    pane: "overlay",
    implemented: false,
    color: "#64748b",
    description: "Drawing tool — coming soon",
  },

  // —— Extended HL / TradingView catalog ——
  {
    id: "awesome",
    name: "Awesome Oscillator",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#26a69a",
  },
  {
    id: "cmf",
    name: "Chaikin Money Flow",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#22d3ee",
    period: 20,
  },
  {
    id: "chaikin_osc",
    name: "Chaikin Oscillator",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#38bdf8",
  },
  {
    id: "bop",
    name: "Balance of Power",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#f472b6",
  },
  {
    id: "chop",
    name: "Choppiness Index",
    category: "volatility",
    pane: "pane",
    implemented: true,
    color: "#a3e635",
    period: 14,
  },
  {
    id: "hv",
    name: "Historical Volatility",
    category: "volatility",
    pane: "pane",
    implemented: true,
    color: "#fb7185",
    period: 20,
  },
  {
    id: "linreg",
    name: "Linear Regression Curve",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#fcd34d",
    period: 20,
  },
  {
    id: "vwma",
    name: "Volume Weighted Moving Average",
    category: "volume",
    pane: "overlay",
    implemented: true,
    color: "#7dd3fc",
    period: 20,
  },
  {
    id: "tema",
    name: "Triple EMA",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#c4b5fd",
    period: 20,
  },
  {
    id: "dema",
    name: "Double EMA",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#93c5fd",
    period: 20,
  },
  {
    id: "tsi",
    name: "True Strength Index",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#e879f9",
  },
  {
    id: "alligator",
    name: "Williams Alligator",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#3b82f6",
    colors: ["#3b82f6", "#ef4444", "#22c55e"],
  },
  {
    id: "force_index",
    name: "Elder's Force Index",
    category: "volume",
    pane: "pane",
    implemented: true,
    color: "#f97316",
    period: 13,
  },
  {
    id: "elder_ray",
    name: "Elder's Ray Index",
    category: "momentum",
    pane: "pane",
    implemented: true,
    color: "#22c55e",
    colors: ["#22c55e", "#ef4444"],
  },
  {
    id: "envelope",
    name: "Envelope",
    category: "trend",
    pane: "overlay",
    implemented: true,
    color: "#94a3b8",
    colors: ["#94a3b8", "#cbd5e1", "#94a3b8"],
    period: 20,
  },
  {
    id: "alma",
    name: "Arnaud Legoux Moving Average",
    category: "trend",
    pane: "overlay",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "fisher",
    name: "Fisher Transform",
    category: "momentum",
    pane: "pane",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "kst",
    name: "Know Sure Thing",
    category: "momentum",
    pane: "pane",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "mcginley",
    name: "McGinley Dynamic",
    category: "trend",
    pane: "overlay",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "vortex",
    name: "Vortex Indicator",
    category: "trend",
    pane: "pane",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "pivot",
    name: "Pivot Points Standard",
    category: "trend",
    pane: "overlay",
    implemented: false,
    color: "#64748b",
    description: "Coming soon",
  },
  {
    id: "eq_funding",
    name: "Funding Rate Overlay",
    category: "volume",
    pane: "pane",
    implemented: false,
    color: "#5b9cf6",
    description: "Requires funding feed",
  },
  {
    id: "eq_oi",
    name: "Open Interest Flow",
    category: "volume",
    pane: "pane",
    implemented: false,
    color: "#5b9cf6",
    description: "Requires OI feed",
  },
];

export const INDICATOR_BY_ID = Object.fromEntries(
  INDICATOR_CATALOG.map((d) => [d.id, d]),
) as Record<string, IndicatorDefinition>;

export function isImplementedIndicator(id: string): boolean {
  return INDICATOR_BY_ID[id]?.implemented === true;
}

export function indicatorPane(id: string): IndicatorPane {
  return INDICATOR_BY_ID[id]?.pane ?? "overlay";
}

/** Migrate legacy persisted indicator ids. */
export function migrateIndicatorId(id: string): string {
  const map: Record<string, string> = {
    ema9: "ema_9",
    ema21: "ema",
    ema50: "ema_50",
  };
  return map[id] ?? id;
}

export function sortIndicatorsForModal(
  items: IndicatorDefinition[],
  favorites: string[],
  query: string,
): IndicatorDefinition[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((d) => d.name.toLowerCase().includes(q) || d.id.includes(q))
    : items;

  const favSet = new Set(favorites);
  const favs = filtered.filter((d) => favSet.has(d.id));
  const rest = filtered
    .filter((d) => !favSet.has(d.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...favs.sort((a, b) => a.name.localeCompare(b.name)), ...rest];
}
