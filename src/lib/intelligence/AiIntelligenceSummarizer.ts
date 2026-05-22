import type { IntelligenceEvent, IntelligenceAiBrief } from "@/types/market-intelligence";
import type { IntelligenceMarketState } from "@/types/market-intelligence";

/**
 * AI assistance layer — summarize and contextualize ONLY. No trade directives.
 */
export class AiIntelligenceSummarizer {
  static brief(
    events: IntelligenceEvent[],
    marketState: IntelligenceMarketState,
    coin: string | null,
  ): IntelligenceAiBrief {
    const top = events.slice(0, 5);
    const critical = events.filter((e) => e.severityBand === "critical");

    const summary =
      critical.length > 0
        ? `${critical.length} critical signal(s) active. ${marketState.compositeLabel}. Focus: ${critical[0]?.summary ?? "monitoring"}.`
        : top.length > 0
          ? `Tape organized · ${top.length} ranked events. ${marketState.compositeLabel}. Primary: ${top[0]?.summary ?? "quiet"}.`
          : `Market conditions: ${marketState.compositeLabel}. No elevated intelligence events.`;

    const contextBullets = [
      `Volatility: ${marketState.volatilityEnvironment} · Liquidity: ${marketState.liquidityEnvironment}`,
      `Sentiment: ${marketState.sentimentState} · Breadth: ${marketState.marketBreadth}`,
      `Macro risk: ${marketState.macroRiskLevel} · Leverage: ${marketState.leverageEnvironment}`,
      ...top.slice(0, 3).map((e) => `[${e.category}] ${e.summary}`),
    ];

    return {
      id: `brief-${Date.now()}`,
      scope: coin ? "asset" : critical.length ? "event" : "market",
      coin,
      summary,
      contextBullets,
      relatedEvents: top.map((e) => e.id),
      generatedAt: Date.now(),
    };
  }
}
