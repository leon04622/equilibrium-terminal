const seen = new Map<string, number>();
const WINDOW_MS = 30_000;
let suppressedTotal = 0;

export class IngestDeduplicator {
  static key(sourceId: string, eventType: string, asset: string | null, fingerprint: string): string {
    return `${sourceId}:${eventType}:${asset ?? "*"}:${fingerprint}`;
  }

  static accept(key: string): boolean {
    const now = Date.now();
    const last = seen.get(key);
    if (last != null && now - last < WINDOW_MS) {
      suppressedTotal += 1;
      return false;
    }
    seen.set(key, now);
    if (seen.size > 8000) {
      seen.forEach((ts, k) => {
        if (now - ts > WINDOW_MS * 3) seen.delete(k);
      });
    }
    return true;
  }

  static suppressedCount(): number {
    return suppressedTotal;
  }
}
