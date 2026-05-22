import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { DeskCommunication } from "@/types/collaboration";

export class TeamCommunicationEngine {
  static feed(): DeskCommunication[] {
    const net = useNetworkGraphStore.getState();
    const deskId = net.activeDeskId;
    const now = Date.now();

    const fromSignals: DeskCommunication[] = net.signals
      .filter((s) => s.deskId === deskId && s.visibility !== "private")
      .slice(0, 8)
      .map((s) => {
        const profile = net.getProfile(s.publisherId);
        return {
          id: `comms-sig-${s.id}`,
          deskId,
          kind: "market_update" as const,
          authorId: s.publisherId,
          authorHandle: profile?.displayHandle ?? s.publisherId,
          headline: `${s.coin} ${s.stance.toUpperCase()} — desk signal`,
          body: s.thesis,
          coin: s.coin,
          severity: s.stance === "neutral" ? "info" as const : "watch" as const,
          visibility: s.visibility === "public" ? "org" as const : "team" as const,
          timestamp: s.timestamp,
          replyCount: 0,
        };
      });

    const seeded: DeskCommunication[] = [
      {
        id: "comms-brief-01",
        deskId,
        kind: "briefing",
        authorId: "trader-01",
        authorHandle: "MACRO_LEAD",
        headline: "Morning desk briefing — risk-on bias intact",
        body: "Funding normalized across majors. Watch HYPE perp OI build and BTC ETF flow headline risk.",
        coin: "BTC",
        severity: "info",
        visibility: "team",
        timestamp: now - 7200_000,
        replyCount: 3,
      },
      {
        id: "comms-exec-01",
        deskId,
        kind: "execution_alert",
        authorId: "trader-02",
        authorHandle: "PERP_DESK_A",
        headline: "Slippage elevated on HYPE market orders",
        body: "Spread widened 8bps — route via limit ladder until depth recovers.",
        coin: "HYPE",
        severity: "watch",
        visibility: "team",
        timestamp: now - 1800_000,
        replyCount: 1,
      },
      {
        id: "comms-thread-01",
        deskId,
        kind: "research_thread",
        authorId: "trader-03",
        authorHandle: "FLOW_SCOUT",
        headline: "Stablecoin flow rotation thread",
        body: "USDT dominance tick lower — alt beta window may extend 24–48h if BTC holds structure.",
        coin: null,
        severity: "info",
        visibility: "team",
        timestamp: now - 5400_000,
        replyCount: 5,
      },
    ];

    return [...fromSignals, ...seeded].sort((a, b) => b.timestamp - a.timestamp);
  }
}
