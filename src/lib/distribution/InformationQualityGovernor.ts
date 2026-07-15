import type { InformationQualityReport, NewswireItem } from "@/types/information-distribution";
import { useTerminalStore } from "@/store/terminalStore";

function normalizeHeadline(h: string): string {
  return h.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
}

function preferItem(current: NewswireItem, candidate: NewswireItem): NewswireItem {
  const curUrl = Boolean(current.articleUrl);
  const candUrl = Boolean(candidate.articleUrl);
  if (candUrl && !curUrl) return candidate;
  if (curUrl && !candUrl) return current;
  return candidate.compositeScore > current.compositeScore ? candidate : current;
}

/**
 * Institutional trust controls: dedupe within each refresh, verification ratio, timestamp integrity.
 */
export class InformationQualityGovernor {
  static audit(items: NewswireItem[]): {
    quality: InformationQualityReport;
    filtered: NewswireItem[];
  } {
    const now = Date.now();

    const batchBest = new Map<string, NewswireItem>();
    for (const item of items) {
      const key = normalizeHeadline(item.headline);
      if (!key) continue;
      const existing = batchBest.get(key);
      batchBest.set(key, existing ? preferItem(existing, item) : item);
    }

    const filtered = Array.from(batchBest.values()).sort(
      (a, b) => b.compositeScore - a.compositeScore || b.timestamp - a.timestamp,
    );
    const suppressed = Math.max(0, items.length - filtered.length);

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
      falsePositiveEstimate: Math.max(2, Math.round(12 - (verified / Math.max(filtered.length, 1)) * 8)),
      timestampIntegrity,
      lastValidationAt: now,
    };

    return { quality, filtered };
  }
}
