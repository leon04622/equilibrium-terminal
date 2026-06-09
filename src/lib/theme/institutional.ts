/** Phase 26 — Institutional terminal experience tokens. */
import type { TerminalMode } from "@/types/adaptive-workspace";

export type TerminalDensity = "compact" | "standard" | "comfortable";

export const TERMINAL_SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const DENSITY_PRESETS: Record<
  TerminalDensity,
  { rowH: number; gridRowHeight: number; pad: string; label: string }
> = {
  compact: { rowH: 16, gridRowHeight: 22, pad: "p-0.5", label: "COMPACT" },
  standard: { rowH: 18, gridRowHeight: 24, pad: "p-1", label: "STANDARD" },
  comfortable: { rowH: 20, gridRowHeight: 26, pad: "p-1.5", label: "COMFORT" },
};

/** Subtle mode chrome — operational context without visual chaos. */
export const MODE_CHROME: Record<TerminalMode, { border: string; accent: string; label: string }> = {
  balanced: { border: "border-b-cyan-950/80", accent: "text-cyan-400", label: "BALANCED OPS" },
  execution: { border: "border-b-emerald-900/60", accent: "text-[#00ff88]", label: "EXECUTION DESK" },
  research: { border: "border-b-violet-950/70", accent: "text-violet-400", label: "RESEARCH DESK" },
  macro: { border: "border-b-amber-950/60", accent: "text-[#ffaa00]", label: "MACRO COMMAND" },
  scalping: { border: "border-b-rose-950/50", accent: "text-[#ff3366]", label: "SCALP DESK" },
  ai_analyst: { border: "border-b-cyan-900/70", accent: "text-[#00e5ff]", label: "AI ANALYST" },
  portfolio: { border: "border-b-slate-700/60", accent: "text-slate-300", label: "PORTFOLIO DESK" },
  narrative: { border: "border-b-fuchsia-950/50", accent: "text-fuchsia-400", label: "NARRATIVE DESK" },
  quant: { border: "border-b-indigo-950/60", accent: "text-indigo-400", label: "QUANT LAB" },
};

export const STATUS_INDICATOR = {
  live: "bg-[#00ff88] shadow-[0_0_6px_rgb(0_255_136/0.35)]",
  watch: "bg-[#ffaa00] shadow-[0_0_6px_rgb(255_170_0/0.25)]",
  critical: "bg-[#ff3366] shadow-[0_0_6px_rgb(255_51_102/0.35)]",
  offline: "bg-slate-600",
  idle: "bg-slate-700",
} as const;

export type PanelStatus = keyof typeof STATUS_INDICATOR;

export const INSTITUTIONAL_INTERACTION = {
  panelButton:
    "border-[0.5px] border-slate-800 px-1 text-slate-500 hover:bg-slate-900 hover:text-slate-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-700/60",
  tabButton:
    "border border-slate-800 px-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-700/60",
  tabActive: "text-cyan-300 bg-slate-900/80",
  tabIdle: "text-slate-600 hover:text-slate-400",
  input:
    "border-[0.5px] border-slate-800 bg-slate-950 px-2 py-1 text-slate-200 outline-none focus-visible:border-cyan-800/80",
} as const;

export const TRUST_SIGNAL = {
  stable: "OPERATIONAL",
  degraded: "DEGRADED",
  critical: "ATTENTION",
} as const;

/** Phase 59 — alert & loading presentation (calm institutional tone). */
export const ALERT_PRESENTATION = {
  info: "border-slate-800 text-slate-500",
  watch: "border-amber-950/60 text-amber-400/90",
  critical: "border-rose-950/60 text-rose-400/90",
} as const;

export const LOADING_CHROME = {
  skeleton: "animate-pulse bg-slate-900/80",
  label: "text-slate-600",
} as const;

export const TRANSITION_CALM = {
  panel: "transition-colors duration-150 ease-out",
  tab: "transition-colors duration-100",
} as const;
