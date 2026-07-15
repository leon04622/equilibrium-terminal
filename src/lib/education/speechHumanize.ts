/**
 * ACADEMY FRAMEWORK V1 — sanitize lesson strings before TTS.
 * Strips arrow symbols (→ reads as "arrow" on Windows) and UI label noise.
 */

export function combineNarration(...parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(" ");
}

const SPEECH_LABEL_PREFIXES = [
  /^Market outlook:\s*/i,
  /^Risk outlook:\s*/i,
  /^Opportunity outlook:\s*/i,
  /^Operational guidance:\s*/i,
  /^Recommendations:\s*/i,
  /^Live briefing items:\s*/i,
  /^DAILY BRIEFING\s*(?:→|->)\s*/i,
  /^Compare\s+/i,
  /\s+and\s+.+\.\s+Which is better\?\s*$/i,
];

const ARROW_GLYPH =
  /\u2190|\u2191|\u2192|\u2193|\u21D2|\u2794|\u279C|\u27A1|\u27A4|\u2B95|\u27F6|➔|➜|➞|➝|➡️?|->|=>|<-/g;

function neutralizeArrows(text: string): string {
  // State transitions: CALM→ACTIVE or CALM → ACTIVE
  text = text.replace(
    new RegExp(`(\\b[A-Za-z][A-Za-z0-9]*)\\s*(?:${ARROW_GLYPH.source})\\s*([A-Za-z][A-Za-z0-9]*\\b)`, "g"),
    "$1 to $2",
  );

  // Leading arrow at phrase start (e.g. "→ Live terminal bridge")
  text = text.replace(new RegExp(`^\\s*(?:${ARROW_GLYPH.source})\\s*`, "g"), "");

  // Navigation / cause-effect chains — TTS reads → as "arrow" on Windows
  text = text.replace(new RegExp(`\\s*(?:${ARROW_GLYPH.source})\\s*`, "g"), " then ");

  // Literal arrow words from accessibility fallbacks or broken icon labels
  text = text.replace(/\b(right|left)\s+arrow\b/gi, "");
  text = text.replace(/\barrow\s+(right|left)\b/gi, "");
  text = text.replace(/\bnext\s+arrow\b/gi, "next");

  return text;
}

/** Strip UI labels and robotic formatting before TTS. */
export function humanizeForSpeech(...parts: (string | null | undefined)[]): string {
  let text = combineNarration(...parts);
  if (!text) return "";

  text = neutralizeArrows(text);
  text = text.replace(/\s*·\s*/g, ". ");
  text = text.replace(/\s*—\s*/g, ", ");

  for (const prefix of SPEECH_LABEL_PREFIXES) {
    text = text.replace(prefix, "");
  }

  // Numbered workflow dumps ("1. Read summary: ...") → flowing list
  if (/\d+\.\s/.test(text)) {
    text = text
      .split(/\d+\.\s+/)
      .filter(Boolean)
      .map((s) => s.replace(/:\s*/g, ", ").trim())
      .join(". ");
  }

  // Soften shouted tokens (CALM, HIGH, ELEVATED) for natural speech
  text = text.replace(/\b([A-Z]{2,})\b/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());

  text = text
    .replace(/\bthen\s+then\b/gi, "then")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  if (text && !/[.!?]$/.test(text)) text += ".";
  return text;
}
