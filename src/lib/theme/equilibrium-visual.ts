/** Institutional visual identity — chart, panels, live energy (Phase 61 maturity pass). */

import type { MarketRegime } from "@/types/market-atmosphere";
import type { PanelEmphasis } from "@/store/useAdaptiveWorkspaceStore";

/** Proprietary Equilibrium chart palette (not default TradingView greens). */
export const EQ_CHART = {
  background: "transparent",
  text: "rgba(148, 163, 184, 0.72)",
  grid: "rgba(30, 41, 59, 0.85)",
  gridAccent: "rgba(51, 65, 85, 0.45)",
  border: "rgba(51, 65, 85, 0.6)",
  crosshair: "rgba(0, 229, 255, 0.35)",
  crosshairLabel: "rgba(2, 6, 23, 0.92)",
  up: "#0d9f6e",
  upWick: "#14b87a",
  down: "#c42d52",
  downWick: "#e03d66",
  volumeUp: "rgba(13, 159, 110, 0.28)",
  volumeDown: "rgba(196, 45, 82, 0.28)",
} as const;

export const REGIME_VISUAL: Record<
  MarketRegime,
  { label: string; ribbon: string; veil: string }
> = {
  neutral: {
    label: "NEUTRAL",
    ribbon: "rgba(100, 116, 139, 0.35)",
    veil: "rgba(15, 23, 42, 0)",
  },
  "risk-on": {
    label: "RISK-ON",
    ribbon: "rgba(13, 159, 110, 0.22)",
    veil: "rgba(13, 159, 110, 0.04)",
  },
  "risk-off": {
    label: "RISK-OFF",
    ribbon: "rgba(255, 170, 0, 0.2)",
    veil: "rgba(255, 170, 0, 0.05)",
  },
  compression: {
    label: "COMPRESSION",
    ribbon: "rgba(0, 229, 255, 0.18)",
    veil: "rgba(0, 229, 255, 0.04)",
  },
  liquidation: {
    label: "LIQUIDATION",
    ribbon: "rgba(196, 45, 82, 0.28)",
    veil: "rgba(196, 45, 82, 0.07)",
  },
};

/** Static hierarchy when adaptive orchestration has not scored a panel yet. */
export const DEFAULT_PANEL_EMPHASIS: Record<string, PanelEmphasis> = {
  chart: "high",
  hyperbook: "high",
  ticket: "high",
  intelligence: "high",
  alerts: "high",
  domladder: "high",
  slippageradar: "high",
  positions: "medium",
  surveillance: "medium",
  macro: "medium",
  proactive: "medium",
  copilot: "medium",
  decision: "medium",
  marketcmd: "medium",
  liveexec: "medium",
  diagnostics: "muted",
  infra: "muted",
  alphalab: "muted",
  reliability: "low",
  traderjournal: "low",
  research: "low",
};

export function resolvePanelEmphasis(
  panelId: string,
  adaptive?: PanelEmphasis,
): PanelEmphasis {
  return adaptive ?? DEFAULT_PANEL_EMPHASIS[panelId] ?? "medium";
}
