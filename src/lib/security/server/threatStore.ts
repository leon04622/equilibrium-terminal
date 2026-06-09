import type { ThreatEvent, ThreatKind } from "@/types/security-trust";

const events: ThreatEvent[] = [];
const failures = new Map<string, { count: number; resetAt: number }>();

export function recordThreat(
  kind: ThreatKind,
  severity: ThreatEvent["severity"],
  headline: string,
  detail: string,
): ThreatEvent {
  const ev: ThreatEvent = {
    id: `thr_${Date.now().toString(36)}`,
    kind,
    severity,
    headline,
    detail,
    at: Date.now(),
  };
  events.unshift(ev);
  if (events.length > 500) events.length = 500;
  return ev;
}

export function recordAuthFailure(key: string): number {
  const now = Date.now();
  let bucket = failures.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 300_000 };
    failures.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count >= 6) {
    recordThreat(
      "brute_force",
      "critical",
      "Auth brute-force threshold",
      `${key} · ${bucket.count} failures / 5m`,
    );
  }
  return bucket.count;
}

export function listThreats(limit = 32, sinceMs = 86_400_000): ThreatEvent[] {
  const since = Date.now() - sinceMs;
  return events.filter((e) => e.at >= since).slice(0, limit);
}

export function countThreatsSince(sinceMs: number): number {
  const since = Date.now() - sinceMs;
  return events.filter((e) => e.at >= since).length;
}
