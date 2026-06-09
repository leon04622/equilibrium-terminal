import { ContextualMarketAssistantEngine } from "@/lib/operator-ai-desk/ContextualMarketAssistantEngine";
import { IntelligenceSummarizationDeskEngine } from "@/lib/operator-ai-desk/IntelligenceSummarizationDeskEngine";
import { NaturalLanguageRetrievalEngine } from "@/lib/operator-ai-desk/NaturalLanguageRetrievalEngine";
import { ResearchAssistanceDeskEngine } from "@/lib/operator-ai-desk/ResearchAssistanceDeskEngine";
import { AiSafetyBoundariesEngine } from "@/lib/operator-ai-desk/AiSafetyBoundariesEngine";
import { OperationalBriefingDeskEngine } from "@/lib/operator-ai-desk/OperationalBriefingDeskEngine";
import { useTerminalStore } from "@/store/terminalStore";

/** Institutional operator assistant — summarize & retrieve only; never trade. */
export class OperatorAiResponseEngine {
  static answer(prompt: string): string {
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const lower = prompt.toLowerCase().trim();
    const disclaimer = `\n\n— ${AiSafetyBoundariesEngine.disclaimer()}`;

    if (lower.includes("research") || lower.includes("thesis") || lower.includes("journal")) {
      const rows = ResearchAssistanceDeskEngine.assist(asset);
      return `${rows[0]?.detail ?? "No research context."}${disclaimer}`;
    }

    if (lower.includes("brief") || lower.includes("overnight") || lower.includes("daily")) {
      const bullets = OperationalBriefingDeskEngine.briefings()
        .slice(0, 4)
        .map((b) => `• [${b.category}] ${b.headline}`)
        .join("\n");
      return `Operational briefing (${asset}):\n${bullets || "Quiet session — no elevated bullets."}${disclaimer}`;
    }

    if (lower.includes("summarize") || lower.includes("intel") || lower.includes("news")) {
      const sums = IntelligenceSummarizationDeskEngine.summaries(asset).slice(0, 5);
      const lines = sums.map((s) => `• [${s.category}] ${s.headline} (${s.severity})`).join("\n");
      return `Intelligence compression for ${asset}:\n${lines || "No elevated wire items."}${disclaimer}`;
    }

    const hits = NaturalLanguageRetrievalEngine.retrieve(asset, prompt);
    if (hits.length > 0) {
      const lines = hits
        .slice(0, 4)
        .map((h) => `• [${h.source}] ${h.snippet} (rel ${h.relevance})`)
        .join("\n");
      return `Retrieval for "${prompt.slice(0, 60)}":\n${lines}${disclaimer}`;
    }

    if (lower.includes("funding") || lower.includes("open interest") || lower.includes("oi")) {
      const ctx = ContextualMarketAssistantEngine.insights(asset).find((i) => i.domain === "derivatives");
      return `${ctx?.summary ?? "Review derivatives desk for funding/OI."} Confidence ~${ctx?.confidence ?? 55}%.${disclaimer}`;
    }

    if (lower.includes("liquidation") || lower.includes("whale") || lower.includes("volatility")) {
      const ctx = ContextualMarketAssistantEngine.insights(asset).filter(
        (i) => i.domain === "liquidity" || i.domain === "intelligence",
      );
      return ctx.map((c) => `• ${c.summary}`).join("\n") + disclaimer;
    }

    const primary = ContextualMarketAssistantEngine.insights(asset)[0];
    return `${primary?.summary ?? `Monitoring ${asset}.`} Use /ai with summarize, brief, research, or funding for deeper context.${disclaimer}`;
  }
}
