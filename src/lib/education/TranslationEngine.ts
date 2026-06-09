import { Glossary } from "@/lib/education/Glossary";
import type { GlossaryTerm, PlainTranslation } from "@/types/education";

/**
 * PHASE 2 — Translation System.
 * Turns trader shorthand into a four-part plain-English expansion
 * (what it means / why it matters / what to check / mistake to avoid).
 *
 * Resolution order:
 *   1. A hand-authored phrase map for common shorthand lines.
 *   2. The first glossary term referenced in the phrase.
 *   3. A safe generic fallback so nothing is ever shown raw.
 */
function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[.!]+$/g, "").replace(/\s+/g, " ");
}

interface PhraseEntry {
  match: string[];
  meaning: string;
  whyMatters: string;
  checkNext: string;
  mistake: string;
  termId?: string;
}

const PHRASES: PhraseEntry[] = [
  {
    match: ["spread widening", "spread is widening", "wide spread", "spread expansion", "execution quality deteriorating", "execution deteriorating"],
    meaning: "The gap between the buy price and the sell price is getting bigger.",
    whyMatters: "Entering or exiting a trade right now may cost more, and fills can be unstable.",
    checkNext: "Check liquidity in the order book before trading.",
    mistake: "Avoid rushing in with a market order while the gap is wide.",
    termId: "spread",
  },
  {
    match: ["spread compression", "spread tightening", "spread compressing", "tight spread"],
    meaning: "The gap between the buy price and the sell price is getting smaller.",
    whyMatters: "Trading is cheaper and cleaner, and conditions are calmer.",
    checkNext: "Confirm there is real size resting on both sides, not just a thin top level.",
    mistake: "Do not assume a tight spread means depth — a thin book can still slip.",
    termId: "spread",
  },
  {
    match: ["liquidity pulled from bids", "bids pulled", "liquidity pulled", "bid liquidity removed", "bids disappearing"],
    meaning: "Buy orders are being removed from the order book.",
    whyMatters: "The support underneath price may be weakening.",
    checkNext: "Watch the bid side closely — see if buyers reload or keep leaving.",
    mistake: "Don't assume price is safe; it can drop faster when buyers disappear.",
    termId: "liquidity",
  },
  {
    match: ["funding turning positive", "funding flipped positive", "positive funding", "funding positive"],
    meaning: "Long traders are now paying short traders to keep their positions open.",
    whyMatters: "It can mean the market is becoming more crowded on the long side.",
    checkNext: "Compare funding with open interest to gauge how crowded longs are.",
    mistake: "If too many traders are long, a sharp move down can punish late buyers.",
    termId: "funding",
  },
  {
    match: ["funding turning negative", "funding flipped negative", "negative funding", "funding negative"],
    meaning: "Short traders are now paying long traders to keep their positions open.",
    whyMatters: "It can mean the market is becoming more crowded on the short side.",
    checkNext: "Check open interest — crowded shorts can fuel a squeeze higher.",
    mistake: "Chasing a short into crowded negative funding can get squeezed.",
    termId: "funding",
  },
  {
    match: ["volatility expansion", "volatility expansion beginning", "volatility expanding", "vol expansion", "volatility increasing"],
    meaning: "Price movement is starting to speed up.",
    whyMatters: "Candles may move faster and stop losses can be hit more easily.",
    checkNext: "Look at the book and structure to judge whether the move is clean.",
    mistake: "Reduce size or wait for clearer structure if conditions feel unstable.",
    termId: "volatility",
  },
  {
    match: ["large resting ask removed", "resting ask removed", "ask wall removed", "large ask pulled", "ask wall pulled"],
    meaning: "A large sell order above price has disappeared.",
    whyMatters: "It may be easier for price to move up, since one layer of selling pressure is gone.",
    checkNext: "Confirm with buying volume before assuming a breakout has strength.",
    mistake: "Don't assume removal alone means up — it can be cancelled to mislead.",
    termId: "restingorder",
  },
  {
    match: ["large resting bid removed", "resting bid removed", "bid wall removed", "large bid pulled"],
    meaning: "A large buy order below price has disappeared.",
    whyMatters: "Price may fall more easily, since a layer of support has been removed.",
    checkNext: "Watch whether selling picks up now that the support is gone.",
    mistake: "Don't hold blindly expecting that wall to catch price — it's no longer there.",
    termId: "restingorder",
  },
  {
    match: ["liquidation cascade", "cascade", "forced selling", "liquidations firing"],
    meaning: "Leveraged traders are being force-closed, adding more orders in the same direction.",
    whyMatters: "Price can move violently as forced orders all hit at once.",
    checkNext: "Map where clusters of liquidations sit before the move reaches them.",
    mistake: "Don't try to catch the falling knife too early during a cascade.",
    termId: "liquidation",
  },
  {
    match: ["absorption", "sellers absorbed", "buyers absorbed", "absorbing supply"],
    meaning: "Heavy trading is hitting the market but price is barely moving because the other side soaks it up.",
    whyMatters: "It can mark a turning point as the aggressive side exhausts.",
    checkNext: "Watch whether price holds after the heavy flow, then look for a reaction.",
    mistake: "Don't mistake absorption for weakness — strong hidden buyers may be present.",
    termId: "absorption",
  },
  {
    match: ["stop hunt", "liquidity sweep", "sweep", "stop run"],
    meaning: "Price made a fast move to grab orders just beyond an obvious level.",
    whyMatters: "It often traps traders right before reversing.",
    checkNext: "See if price quickly reclaims the level — that often confirms the trap.",
    mistake: "Avoid entering exactly at obvious highs or lows where stops get hunted.",
    termId: "sweep",
  },
];

function fromTerm(term: GlossaryTerm, technical: string): PlainTranslation {
  return {
    technical,
    meaning: term.simple,
    whyMatters: term.whyItMatters,
    checkNext: term.checkNext,
    mistake: term.beginnerMistake,
    termId: term.id,
  };
}

export class TranslationEngine {
  /** Translate a single technical phrase into plain English. */
  static translate(phrase: string): PlainTranslation {
    const n = norm(phrase);

    for (const p of PHRASES) {
      if (p.match.some((m) => n.includes(norm(m)))) {
        return {
          technical: phrase,
          meaning: p.meaning,
          whyMatters: p.whyMatters,
          checkNext: p.checkNext,
          mistake: p.mistake,
          termId: p.termId,
        };
      }
    }

    const term = Glossary.firstMatch(phrase);
    if (term) return fromTerm(term, phrase);

    return {
      technical: phrase,
      meaning: phrase,
      whyMatters: "This describes a change in market conditions worth understanding before acting.",
      checkNext: "Open the order book and recent activity to see what is driving it.",
      mistake: "Avoid acting on a phrase you don't fully understand — confirm it first.",
    };
  }

  /**
   * PHASE 3 — Voiceover script style.
   * A calm-mentor line: short, plain, and useful.
   */
  static voiceLine(phrase: string): string {
    const tr = TranslationEngine.translate(phrase);
    return `${tr.meaning} ${tr.whyMatters} ${tr.checkNext}`;
  }

  /** Glossary terms referenced in a block of guidance text. */
  static termsIn(text: string): GlossaryTerm[] {
    return Glossary.matchesIn(text);
  }
}
