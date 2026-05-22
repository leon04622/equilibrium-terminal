import type { SessionClockSnapshot, TradingSessionId } from "@/types/daily-operations";

const SESSION_LABELS: Record<TradingSessionId, string> = {
  asia: "ASIA",
  europe: "EUROPE",
  us: "US",
  overlap: "OVERLAP",
  weekend_crypto: "WEEKEND CRYPTO",
};

function utcParts(now = new Date()): { hour: number; dow: number } {
  return { hour: now.getUTCHours(), dow: now.getUTCDay() };
}

function resolveSession(hour: number, dow: number): TradingSessionId {
  if (dow === 0 || dow === 6) return "weekend_crypto";
  const inAsia = hour >= 0 && hour < 8;
  const inEurope = hour >= 7 && hour < 16;
  const inUs = hour >= 13 && hour < 22;
  if (inEurope && inUs) return "overlap";
  if (inUs) return "us";
  if (inEurope) return "europe";
  if (inAsia) return "asia";
  return "asia";
}

function liquidityPhase(session: TradingSessionId, hour: number): SessionClockSnapshot["liquidityPhase"] {
  if (session === "weekend_crypto") return "thin";
  if (session === "overlap") return "peak";
  if (session === "us" && hour >= 14 && hour <= 17) return "peak";
  if (session === "europe" && hour >= 8 && hour <= 11) return "peak";
  if (session === "asia" && hour >= 1 && hour <= 4) return "peak";
  if (hour >= 22 || hour < 1) return "fading";
  return "building";
}

function nextTransition(hour: number, dow: number): { label: string; at: number } {
  const now = Date.now();
  const boundaries = [
    { h: 0, label: "Asia active" },
    { h: 7, label: "Europe open" },
    { h: 13, label: "US open" },
    { h: 22, label: "US fade" },
  ];
  if (dow === 0 || dow === 6) {
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() + ((8 - dow) % 7));
    monday.setUTCHours(7, 0, 0, 0);
    return { label: "Weekday Europe open", at: monday.getTime() };
  }
  for (const b of boundaries) {
    if (hour < b.h) {
      const t = new Date(now);
      t.setUTCHours(b.h, 0, 0, 0);
      return { label: b.label, at: t.getTime() };
    }
  }
  const t = new Date(now);
  t.setUTCDate(t.getUTCDate() + 1);
  t.setUTCHours(0, 0, 0, 0);
  return { label: "Asia open", at: t.getTime() };
}

export class SessionClockEngine {
  static snapshot(now = new Date()): SessionClockSnapshot {
    const { hour, dow } = utcParts(now);
    const activeSession = resolveSession(hour, dow);
    const next = nextTransition(hour, dow);
    return {
      utcHour: hour,
      activeSession,
      label: SESSION_LABELS[activeSession],
      liquidityPhase: liquidityPhase(activeSession, hour),
      nextTransitionLabel: next.label,
      nextTransitionAt: next.at,
      updatedAt: Date.now(),
    };
  }
}
