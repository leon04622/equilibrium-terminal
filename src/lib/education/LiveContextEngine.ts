import { TranslationEngine } from "@/lib/education/TranslationEngine";
import type {
  CoachSeverity,
  CoachSource,
  EducationalAlert,
} from "@/types/live-coach";
import type { MarketEventType, TriggeredAlert } from "@/types/alerts";
import type { ExplainAudience } from "@/types/operator-guide";

/**
 * PHASE 1–3 — Live Operational Mentor.
 * Builds a plain-English educational alert from any raw live event by routing
 * the technical phrase through the TranslationEngine, then attaching severity,
 * the panel to highlight, and a suppression key.
 */

let seq = 0;
function uid(): string {
  seq += 1;
  return `coach-${Date.now().toString(36)}-${seq.toString(36)}`;
}

export interface LiveContextInput {
  /** Raw shorthand / headline line, e.g. "Spread widening on BTC". */
  technical: string;
  source: CoachSource;
  severity?: CoachSeverity;
  coin?: string;
  /** Panel to spotlight when this surfaces. */
  focusPanel?: string;
  /** Override suppression key (defaults to source + termId/technical). */
  dedupeKey?: string;
}

/** Sensible default panel to highlight for each source (visual sync). */
const FOCUS_BY_SOURCE: Record<CoachSource, string | undefined> = {
  alert: "alerts",
  intelligence: "intelligence",
  execution: "slippageradar",
  funding: "derivdesk",
  volatility: "chart",
  liquidity: "hyperbook",
  spread: "hyperbook",
  behavioral: "operatorjournal",
  replay: "chart",
  coaching: undefined,
};

export class LiveContextEngine {
  /** Build a four-part educational alert from a raw event. */
  static build(input: LiveContextInput): EducationalAlert {
    const tr = TranslationEngine.translate(input.technical);
    const severity = input.severity ?? "info";
    const focusPanel = input.focusPanel ?? FOCUS_BY_SOURCE[input.source];
    const dedupeKey =
      input.dedupeKey ??
      `${input.source}:${tr.termId ?? input.technical.toLowerCase().slice(0, 40)}`;

    return {
      id: uid(),
      ts: Date.now(),
      source: input.source,
      severity,
      coin: input.coin,
      focusPanel,
      technical: input.technical,
      meaning: tr.meaning,
      whyMatters: tr.whyMatters,
      checkNext: tr.checkNext,
      mistake: tr.mistake,
      termId: tr.termId,
      dedupeKey,
    };
  }

  /**
   * PHASE 1 / PHASE 8 — turn a raw alert-engine trigger into an educational
   * alert. Shared by the live-coach hook and the AlertPanel so alert copy is
   * always expanded into plain English the same way.
   */
  static fromAlert(alert: TriggeredAlert): EducationalAlert {
    const type = alert.event.type as MarketEventType;
    let technical: string;
    let source: CoachSource;
    switch (type) {
      case "HL_FUNDING_FLIP":
        technical =
          alert.event.metrics.fundingRate != null && alert.event.metrics.fundingRate < 0
            ? "Funding turning negative"
            : "Funding turning positive";
        source = "funding";
        break;
      case "HL_OPEN_INTEREST_SPIKE":
        technical = "Open interest rising";
        source = "intelligence";
        break;
      case "ON_CHAIN_WHALE_TRANSFER":
        technical = "Whale order detected";
        source = "intelligence";
        break;
      case "LIQUIDATION_CLUSTER_HIT":
        technical = "Liquidation cascade";
        source = "liquidity";
        break;
      default:
        technical = alert.title;
        source = "alert";
    }
    return LiveContextEngine.build({
      technical,
      source,
      severity: alert.severity,
      coin: alert.coin,
      dedupeKey: `alert:${alert.ruleId}:${alert.coin}`,
    });
  }

  /**
   * PHASE 6 / PHASE 7 — audience shaping.
   * Beginner mode expands everything; Pro mode compresses to a single dense line.
   */
  static headline(alert: EducationalAlert, audience: ExplainAudience): string {
    if (audience === "beginner") return alert.meaning;
    // Pro: keep the original shorthand, it's faster to scan.
    return alert.technical;
  }

  static isBeginner(audience: ExplainAudience): boolean {
    return audience === "beginner";
  }

  /**
   * PHASE 4 — the calm-mentor voice line.
   * Beginner gets the full guided line; Pro gets just the essentials.
   */
  static voiceText(alert: EducationalAlert, audience: ExplainAudience): string {
    if (audience === "beginner") {
      return `${alert.meaning} ${alert.whyMatters} ${alert.checkNext}`;
    }
    return `${alert.meaning} ${alert.checkNext}`;
  }
}
