/** Plain-English operational translation layer. */

export interface GlossaryTerm {
  id: string;
  /** Display name, e.g. "Spread". */
  term: string;
  /** Lowercase strings that should resolve to this term in free text. */
  aliases: string[];
  /** WHAT IT MEANS — plain English, no unexplained jargon. */
  simple: string;
  /** Concise professional definition for experienced operators. */
  professional: string;
  /** WHY IT MATTERS. */
  whyItMatters: string;
  /** WHAT TO CHECK NEXT. */
  checkNext: string;
  /** WHAT MISTAKE TO AVOID. */
  beginnerMistake: string;
  /** Panels where this concept is observed. */
  relatedPanels: string[];
}

/** A four-part expansion of a piece of trader shorthand. */
export interface PlainTranslation {
  /** The original technical phrase. */
  technical: string;
  /** WHAT IT MEANS. */
  meaning: string;
  /** WHY IT MATTERS. */
  whyMatters: string;
  /** WHAT TO CHECK NEXT. */
  checkNext: string;
  /** WHAT MISTAKE TO AVOID. */
  mistake: string;
  /** Glossary term this maps to, if any. */
  termId?: string;
}
