import type { InformationQualityReport, NewswireItem } from "@/types/information-distribution";
import { useTerminalStore } from "@/store/terminalStore";

const seenHeadlines = new Map<string, number>();
const DEDUPE_WINDOW_MS = 45 * 60_000;

function normalizeHeadline(h: string): string {
  return h.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * Institutional trust controls: dedupe, verification ratio, timestamp integrity.
 */
export class InformationQualityGovernor {
  static audit(items: NewswireItem[]): {
    quality: InformationQualityReport;
    filtered: NewswireItem[];
  } {
    const now = Date.now();
    let suppressed = 0;
    const filtered: NewswireItem[] = [];

    for (const item of items) {
      const key = normalizeHeadline(item.headline);
      const last = seenHeadlines.get(key);
      if (last != null && now - last < DEDUPE_WINDOW_MS) {
        suppressed++;
        continue;
      }
      seenHeadlines.set(key, item.timestamp);
      filtered.push(item);
    }

    if (seenHeadlines.size > 400) {
      seenHeadlines.forEach((ts, k) => {
        if (now - ts > DEDUPE_WINDOW_MS * 2) seenHeadlines.delete(k);
      });
    }

    const verified = filtered.filter((i) => i.verified).length;
    const terminal = useTerminalStore.getState();
    const lag = terminal.lastMessageAt ? now - terminal.lastMessageAt : 99999;
    const timestampIntegrity = lag < 2000 ? 96 : lag < 8000 ? 72 : 40;

    const quality: InformationQualityReport = {
      overallConfidence: Math.round(
        (verified / Math.max(filtered.length, 1)) * 55 +
          timestampIntegrity * 0.35 +
          (suppressed > 0 ? 8 : 0),
      ),
      duplicatesSuppressed: suppressed,
      verifiedSourceRatio: Math.round((verified / Math.max(filtered.length, 1)) * 100),
      falsePositiveEstimate: Math.max(2, Math.round(12 - verified / Math.max(filtered.length, 1) * 8)),
      timestampIntegrity,
      lastValidationAt: now,
    };

    return { quality, filtered };
  }
}
