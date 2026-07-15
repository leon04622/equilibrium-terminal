/**
 * Equilibrium Terminal — institutional visual engine tokens.
 * All widgets import from here for uniform geometry, typography, and signal colors.
 */

export const TERMINAL_COLORS = {
  canvas: "#020617",
  panel: "#020617",
  border: "#1e293b",
  muted: "#64748b",
  label: "#94a3b8",
  /** Up / bid / volume spike */
  up: "#00ff88",
  /** Down / ask / liquidation cascade */
  down: "#ff3366",
  /** System warning / OI divergence */
  warn: "#ffaa00",
  /** AI confidence layer */
  ai: "#00e5ff",
} as const;

export const TERMINAL_LAYOUT = {
  pad: "p-1",
  padX: "px-1",
  padY: "py-0.5",
  gap: "gap-1",
  gapPx: 4,
  rowH: 18,
  rowClass: "h-[18px] min-h-[18px] max-h-[18px]",
  bookRowClass: "py-0.5 leading-none",
  headerH: "h-6",
  panelHeaderH: "h-5",
  gridMargin: [2, 2] as [number, number],
  gridRowHeight: 24,
} as const;

export const TERMINAL_TYPO = {
  root: "font-mono tracking-tight tabular-nums antialiased leading-tight",
  label: "text-[10px] font-semibold uppercase tracking-wide text-slate-400 leading-none",
  micro: "text-[9px] font-medium uppercase tracking-wide text-slate-500 leading-none",
  data: "text-[11px] font-mono tabular-nums tracking-tight leading-snug",
  dataSm: "text-[10px] font-mono tabular-nums tracking-tight leading-snug",
  dataLg: "text-[13px] font-mono font-semibold tabular-nums tracking-tight leading-snug",
} as const;

/** Tailwind class bundles — compose with cn() in components. */
export const terminalSkin = {
  canvas: "bg-slate-950 text-slate-200",
  panel: "bg-slate-950 rounded-none",
  border: "border-[0.5px] border-slate-800",
  borderB: "border-b-[0.5px] border-slate-800",
  borderT: "border-t-[0.5px] border-slate-800",
  borderR: "border-r-[0.5px] border-slate-800",
  borderL: "border-l-[0.5px] border-slate-800",
  header: `${TERMINAL_TYPO.label} ${TERMINAL_LAYOUT.headerH} flex items-center shrink-0`,
  panelHeader: `${TERMINAL_TYPO.label} ${TERMINAL_LAYOUT.panelHeaderH} flex items-center shrink-0 bg-slate-950`,
  row: `${TERMINAL_LAYOUT.rowClass} ${TERMINAL_TYPO.dataSm} flex items-center`,
  flashUp: "animate-flash-up eq-flash",
  flashDown: "animate-flash-down eq-flash",
  textUp: "text-[#00ff88]",
  textDown: "text-[#ff3366]",
  textWarn: "text-[#ffaa00]",
  textAi: "text-[#00e5ff]",
  depthBid: "bg-[#00ff88]/22",
  depthAsk: "bg-[#ff3366]/22",
  execBuy:
    "border-[0.5px] border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88] hover:bg-[#00ff88]/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#00ff88]/40",
  execSell:
    "border-[0.5px] border-[#ff3366]/40 bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366]/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#ff3366]/40",
} as const;

export {
  DEFAULT_PANEL_EMPHASIS,
  EQ_CHART,
  REGIME_VISUAL,
  resolvePanelEmphasis,
} from "@/lib/theme/equilibrium-visual";
export {
  BLOOMBERG,
  isBloombergChrome,
} from "@/lib/theme/bloomberg";
export {
  DENSITY_PRESETS,
  INSTITUTIONAL_INTERACTION,
  MODE_CHROME,
  STATUS_INDICATOR,
  TERMINAL_SPACING,
  TRUST_SIGNAL,
} from "@/lib/theme/institutional";
export type { PanelStatus, TerminalDensity } from "@/lib/theme/institutional";

export function aiConfidencePct(severity: "info" | "watch" | "critical"): number {
  switch (severity) {
    case "critical":
      return 94;
    case "watch":
      return 76;
    default:
      return 58;
  }
}

export function volatilityScore(item: {
  notionalUsd?: number;
  severity: "info" | "watch" | "critical";
}): number {
  const base =
    item.severity === "critical" ? 88 : item.severity === "watch" ? 62 : 38;
  if (!item.notionalUsd) return base;
  const boost = Math.min(12, Math.log10(item.notionalUsd + 1) * 2);
  return Math.min(100, Math.round(base + boost));
}

export function formatTapeTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}
