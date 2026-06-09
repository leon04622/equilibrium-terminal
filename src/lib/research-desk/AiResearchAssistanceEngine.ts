import { ResearchLinkingEngine } from "@/lib/research-desk/ResearchLinkingEngine";
import { MarketJournalEngine } from "@/lib/research-desk/MarketJournalEngine";
import { ThesisTrackingEngine } from "@/lib/research-desk/ThesisTrackingEngine";
import { MarketMemoryIntegrationEngine } from "@/lib/research-desk/MarketMemoryIntegrationEngine";

/** Phase 9 — AI organizes research context; analyst retains judgment. */
export class AiResearchAssistanceEngine {
  static brief(asset: string): string {
    const journal = MarketJournalEngine.entries(asset);
    const theses = ThesisTrackingEngine.theses(asset);
    const links = ResearchLinkingEngine.links(asset);
    const memory = MarketMemoryIntegrationEngine.context(asset);

    const parts = [
      `${asset} research brief — ${journal.length} journal rows, ${theses.length} active theses.`,
      `Linked evidence: ${links.length} items · memory regime ${memory.regimeLabel}.`,
    ];

    if (theses[0]) {
      parts.push(`Primary thesis: ${theses[0].thesis.slice(0, 120)} (status ${theses[0].hypothesisStatus}).`);
    }
    if (journal[0]) {
      parts.push(`Latest note: ${journal[0].title} — ${journal[0].body.slice(0, 100)}.`);
    }
    if (memory.analogCount > 0) {
      parts.push(`${memory.analogCount} historical analogs available in market memory.`);
    }

    parts.push("AI-assisted organization only — all trade decisions remain with the human analyst.");

    return parts.join(" ");
  }
}
