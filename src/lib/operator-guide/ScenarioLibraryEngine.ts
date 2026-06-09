import type { ScenarioCategory, ScenarioLibraryEntry } from "@/types/operator-guide";

function scenario(
  id: string,
  category: ScenarioCategory,
  title: string,
  headline: string,
  asset: string,
  durationSec: number,
  severity: ScenarioLibraryEntry["severity"],
  professionalContext: string,
  focusPanels: string[],
): ScenarioLibraryEntry {
  return {
    id,
    category,
    title,
    headline,
    asset,
    durationSec,
    severity,
    professionalContext,
    focusPanels,
    replayReady: true,
  };
}

export class ScenarioLibraryEngine {
  static all(): ScenarioLibraryEntry[] {
    return [
      scenario(
        "sc-liq-cascade-btc",
        "liquidation_cascade",
        "BTC liquidation cascade",
        "Three large sell clusters · $280k in 45s · book vacuum",
        "BTC",
        90,
        "critical",
        "Professionals reduce size and widen limits when cascade rules fire; they do not fade the first leg blind.",
        ["chart", "hyperbook", "alerts", "surveillance"],
      ),
      scenario(
        "sc-vol-fomc-eth",
        "volatility_spike",
        "FOMC volatility expansion",
        "ETH spreads widen 3x · stress critical · regime shift",
        "ETH",
        120,
        "critical",
        "Macro events demand pre-defined size caps. Vol expansion without liquidity = stand aside or hedge.",
        ["chart", "macro", "surveillance", "slippageradar"],
      ),
      scenario(
        "sc-trend-hype",
        "trend_continuation",
        "Trend continuation · HYPE",
        "Sustained bid absorption · funding positive · OI building",
        "HYPE",
        100,
        "watch",
        "Continuation desks add on pullbacks to prior value area, not at extension highs.",
        ["chart", "hyperbook", "derivdesk", "execintel"],
      ),
      scenario(
        "sc-gamma-sol",
        "gamma_squeeze",
        "Short squeeze environment · SOL",
        "Funding deeply negative · aggressive buy sweeps · OI flush",
        "SOL",
        110,
        "watch",
        "Squeeze environments punish late shorts; professionals map liquidation levels before entry.",
        ["derivdesk", "chart", "intelligence", "domladder"],
      ),
      scenario(
        "sc-stable-depeg",
        "stablecoin_stress",
        "Stablecoin depeg stress",
        "USDC basis −35 bps · bridge incident · systemic watch",
        "BTC",
        80,
        "critical",
        "Depeg events trigger cross-asset risk-off. Professionals check treasury and stable exposure first.",
        ["systemicintel", "newswire", "ecosystem", "portfoliodesk"],
      ),
      scenario(
        "sc-etf-btc",
        "macro_event",
        "ETF flow announcement",
        "Spot ETF headline · BTC gap · vol crush then expansion",
        "BTC",
        95,
        "watch",
        "Headline gaps often mean-revert short term; institutions wait for book stabilization.",
        ["macro", "chart", "intelligence", "memorydesk"],
      ),
      scenario(
        "sc-exchange-outage",
        "exchange_failure",
        "Exchange API instability",
        "HL reconnecting · latency spike · execution halted",
        "BTC",
        60,
        "critical",
        "Never submit size on degraded stream. Reliability desk confirms truth before resuming.",
        ["reliability", "diagnostics", "ticket", "opscommand"],
      ),
      scenario(
        "sc-funding-squeeze",
        "funding_squeeze",
        "Funding squeeze · crowded longs",
        "Funding +0.08% · flip watch · long crowding",
        "ETH",
        85,
        "watch",
        "Extreme funding + flat price = carry unwind risk. Professionals reduce long bias or hedge.",
        ["derivdesk", "alerts", "surveillance", "portfoliodesk"],
      ),
      scenario(
        "sc-cex-divergence",
        "cross_venue_divergence",
        "Cross-venue basis divergence",
        "HL vs CEX mark −12 bps · arb stress",
        "BTC",
        75,
        "watch",
        "Divergence signals arb friction or venue-specific stress — size down until basis normalizes.",
        ["execintel", "hyperbook", "marketcoverage", "slippageradar"],
      ),
    ];
  }

  static get(id: string): ScenarioLibraryEntry | null {
    return ScenarioLibraryEngine.all().find((s) => s.id === id) ?? null;
  }

  static byCategory(category: ScenarioCategory): ScenarioLibraryEntry[] {
    return ScenarioLibraryEngine.all().filter((s) => s.category === category);
  }
}
