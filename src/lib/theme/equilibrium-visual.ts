/** Institutional visual identity — chart, panels, live energy (Phase 61 maturity pass). */

import type { MarketRegime } from "@/types/market-atmosphere";
import type { PanelEmphasis } from "@/store/useAdaptiveWorkspaceStore";

/** Trading-platform chart palette (TradingView-style greens/reds on dark canvas). */
export const EQ_CHART = {
  background: "#0d1117",
  text: "rgba(180, 187, 198, 0.85)",
  grid: "rgba(42, 46, 57, 0.65)",
  gridAccent: "rgba(54, 58, 69, 0.45)",
  border: "rgba(42, 46, 57, 0.9)",
  crosshair: "rgba(120, 123, 134, 0.55)",
  crosshairLabel: "rgba(19, 23, 34, 0.95)",
  up: "#089981",
  upWick: "#089981",
  down: "#f23645",
  downWick: "#f23645",
  volumeUp: "rgba(8, 153, 129, 0.45)",
  volumeDown: "rgba(242, 54, 69, 0.45)",
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
