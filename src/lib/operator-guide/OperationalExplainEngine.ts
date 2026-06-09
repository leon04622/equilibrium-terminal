import { useAlertStore } from "@/store/useAlertStore";
import { OperationalPlaybooks } from "@/lib/operator-guide/OperationalPlaybooks";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  ComponentGuideEntry,
  ExplainAudience,
  OperationalExplanation,
  ProAction,
} from "@/types/operator-guide";

function trendFromTrades(): "bullish" | "bearish" | "neutral" {
  const trades = useTerminalStore.getState().trades.slice(0, 12);
  if (trades.length < 3) return "neutral";
  const buy = trades.filter((t) => t.side === "buy").length;
  const sell = trades.length - buy;
  if (buy - sell >= 3) return "bullish";
  if (sell - buy >= 3) return "bearish";
  return "neutral";
}

function liveReading(panelId: string, symbol: string): string {
  const t = useTerminalStore.getState();
  const alerts = useAlertStore.getState().triggers.slice(0, 3);
  const spread = t.book?.spreadBps;
  const spreadTxt = spread != null ? `${spread.toFixed(2)} bps` : "spread n/a";
  const trend = trendFromTrades();
  const latestTrade = t.trades[0];
  const latestIntel = t.intelligence[0];

  switch (panelId) {
    case "hyperbook":
    case "domladder":
      return `Right now on ${symbol}: ${spreadTxt}, tape ${trend}. ${
        spread != null && spread > 1.5
          ? "Spread is wide — treat market orders as expensive."
          : spread != null && spread < 0.5
            ? "Spread is tight — limits at walls are viable."
            : "Check whether depth is reloading or pulling at your level."
      }`;
    case "slippageradar":
      return `${spreadTxt} on ${symbol}. ${
        spread != null && spread > 1.2
          ? "Impact likely elevated — cut size or use limits."
          : "Impact likely acceptable for small clips — still confirm on hyperbook."
      }`;
    case "alerts": {
      const a = alerts[0];
      return a
        ? `Latest rule: ${a.title} (${a.severity}) on ${a.coin}. Open chart + book before acting.`
        : `No triggers firing. Engine is watching OI, funding, whales (≥$75k), liq clusters on ${symbol}.`;
    }
    case "intelligence":
      return latestIntel
        ? `Top vector: ${latestIntel.title} · ${latestIntel.severity}${
            latestIntel.notionalUsd != null
              ? ` · $${Math.round(latestIntel.notionalUsd).toLocaleString()}`
              : ""
          }. Confirm on hyperbook before size.`
        : `No fresh vectors on ${symbol}. When one hits, read severity then book.`;
    case "ticket": {
      const n =
        latestTrade?.notionalUsd != null
          ? `$${Math.round(latestTrade.notionalUsd).toLocaleString()}`
          : "n/a";
      return `Stream ${t.connectionStatus}. Last print: ${
        latestTrade ? `${latestTrade.side} ${n}` : "none yet"
      }. ${spreadTxt} — check slippage radar before market.`;
    }
    case "positions":
      return `Active symbol ${symbol}. ${spreadTxt}, tape ${trend}. If PnL red and spread widening, trim with reduce-only limits — do not add.`;
    case "chart":
    case "surveillance":
      return `${symbol}: tape ${trend}, ${spreadTxt}, feed ${t.connectionStatus}. ${
        trend === "bearish"
          ? "Bias defensive until book shows absorption."
          : trend === "bullish"
            ? "Bias long only if spread stays contained on pullbacks."
            : "No clear tape edge — wait for book + structure alignment."
      }`;
    case "derivdesk":
      return `Watch funding + OI on ${symbol}. Extreme funding with rising OI = crowded trade — size down or wait for flip.`;
    default:
      return `${symbol} · ${spreadTxt} · tape ${trend} · ${t.connectionStatus}. Use this desk for its role, then confirm on hyperbook + chart.`;
  }
}

function audienceAction(base: ProAction, audience: ExplainAudience): ProAction {
  if (audience === "beginner") {
    return {
      action: base.action === "avoid_market" ? "use_limit" : base.action,
      detail: `${base.detail} (Beginner: one step at a time — book, then radar, then ticket.)`,
    };
  }
  if (audience === "scalp") {
    return {
      ...base,
      detail: `${base.detail} Scalp: react to spread within seconds; do not hold through spread blowouts.`,
    };
  }
  if (audience === "swing") {
    return {
      ...base,
      detail: `${base.detail} Swing: weight regime + funding more than single prints.`,
    };
  }
  return base;
}

export class OperationalExplainEngine {
  static explain(
    entry: ComponentGuideEntry,
    audience: ExplainAudience,
  ): OperationalExplanation {
    const playbook = OperationalPlaybooks.get(entry.id);
    const symbol = useTerminalStore.getState().selectedCoin ?? "BTC";
    const live = liveReading(entry.id, symbol);

    return {
      panelRole: playbook.panelRole,
      lookFirst: playbook.lookFirst,
      whatChangesMatter: playbook.whatChangesMatter,
      liveReading: live,
      bullish: playbook.bullish,
      bearish: playbook.bearish,
      confirms: playbook.confirms,
      invalidates: playbook.invalidates,
      dangerZone: playbook.dangerZone,
      proMonitors: playbook.proMonitors,
      proDoesNext: audienceAction(playbook.proDoesNext, audience),
      beginnerMistakes: playbook.beginnerMistakes,
      workflowSteps: playbook.workflowSteps,
      visualCues: playbook.visualCues,
      connectedPanels: entry.relatedSystems.length > 0 ? entry.relatedSystems : playbook.focusPanelsOnReplay,
      replayScenarioId: playbook.replayScenarioId,
    };
  }
}
