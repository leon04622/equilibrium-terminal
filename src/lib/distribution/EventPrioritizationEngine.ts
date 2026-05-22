import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NewswireItem } from "@/types/information-distribution";

const CATEGORY_BOOST: Partial<Record<NewswireItem["category"], number>> = {
  exchange: 12,
  stablecoin: 14,
  liquidation: 10,
  volatility: 8,
  whale: 6,
};

function mapCategory(raw: string): NewswireItem["category"] {
  const s = raw.toLowerCase();
  if (s.includes("macro") || s.includes("fomc") || s.includes("cpi")) return "macro";
  if (s.includes("liq") || s.includes("liquidation")) return "liquidation";
  if (s.includes("fund")) return "funding";
  if (s.includes("whale") || s.includes("on-chain") || s.includes("on_chain")) return "whale";
  if (s.includes("stable")) return "stablecoin";
  if (s.includes("etf")) return "etf";
  if (s.includes("vol")) return "volatility";
  if (s.includes("bridge")) return "bridge";
  if (s.includes("chain") || s.includes("congest")) return "chain";
  if (s.includes("exchange") || s.includes("outage") || s.includes("api")) return "exchange";
  if (s.includes("liquidity") || s.includes("spread")) return "liquidity";
  if (s.includes("narrative") || s.includes("social")) return "narrative";
  return "operational";
}

function severityBase(severity: NewswireItem["severity"]): number {
  if (severity === "critical") return 92;
  if (severity === "watch") return 58;
  return 28;
}

/**
 * Scores events for urgency, market impact, and trader-context relevance.
 */
export class EventPrioritizationEngine {
  static score(
    category: NewswireItem["category"],
    headline: string,
    coin: string | null,
    severity: NewswireItem["severity"],
    timestamp: number,
    verified: boolean,
    sourceBoost = 0,
  ): Pick<
    NewswireItem,
    "urgencyScore" | "impactScore" | "relevanceScore" | "compositeScore" | "confidence"
  > {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const watchlist = useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin);
    const activeCoin = terminal.selectedCoin ?? terminal.selectedAsset?.coin ?? null;

    const ageMin = (Date.now() - timestamp) / 60_000;
    const freshness = ageMin < 2 ? 18 : ageMin < 8 ? 10 : ageMin < 20 ? 4 : 0;

    let urgency = severityBase(severity) + freshness + (CATEGORY_BOOST[category] ?? 0);
    if (atmosphere.stress.score > 70 && (category === "volatility" || category === "liquidation")) {
      urgency += 12;
    }
    if (terminal.connectionStatus !== "connected" && category === "exchange") {
      urgency += 15;
    }
    urgency = Math.min(100, urgency);

    let impact = 35 + (severity === "critical" ? 40 : severity === "watch" ? 22 : 8);
    if (category === "stablecoin" || category === "etf" || category === "macro") impact += 15;
    if (category === "exchange" || category === "bridge") impact += 12;
    if (coin === "BTC" || coin === "ETH") impact += 8;
    impact = Math.min(100, impact);

    let relevance = 30;
    if (coin && coin === activeCoin) relevance += 35;
    if (coin && watchlist.includes(coin)) relevance += 25;
    if (!coin && category === "macro") relevance += 20;
    if (atmosphere.regime.regime === "liquidation" && category === "liquidation") relevance += 18;
    relevance = Math.min(100, relevance);

    const composite = Math.round(
      urgency * 0.38 + impact * 0.32 + relevance * 0.22 + sourceBoost + (verified ? 6 : 0),
    );

    const confidence = Math.min(
      100,
      Math.round((verified ? 78 : 52) + (verified ? 12 : 0) - (ageMin > 30 ? 10 : 0)),
    );

    return {
      urgencyScore: Math.min(100, Math.round(urgency)),
      impactScore: Math.min(100, Math.round(impact)),
      relevanceScore: Math.min(100, Math.round(relevance)),
      compositeScore: Math.min(100, composite),
      confidence,
    };
  }

  static mapCategory(raw: string): NewswireItem["category"] {
    return mapCategory(raw);
  }
}
