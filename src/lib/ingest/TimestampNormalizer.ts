/** Normalize timestamps to UTC epoch milliseconds. */
export class TimestampNormalizer {
  static toMs(value: number | string | Date): number {
    if (value instanceof Date) return value.getTime();
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : Date.now();
    }
    if (!Number.isFinite(value)) return Date.now();
    // Hyperliquid trades use ms; candles may use seconds
    if (value < 1_000_000_000_000) return Math.round(value * 1000);
    return Math.round(value);
  }

  static skewMs(eventTs: number, receivedAt: number): number {
    return Math.max(0, receivedAt - eventTs);
  }

  static integrityScore(events: Array<{ timestamp: number; receivedAt: number }>): number {
    if (events.length === 0) return 50;
    const skews = events.map((e) => TimestampNormalizer.skewMs(e.timestamp, e.receivedAt));
    const avg = skews.reduce((a, b) => a + b, 0) / skews.length;
    if (avg < 500) return 98;
    if (avg < 2000) return 82;
    if (avg < 8000) return 58;
    return 32;
  }
}
