import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { TeamAlert } from "@/types/collaboration";

export class TeamAlertEngine {
  static alerts(): TeamAlert[] {
    const net = useNetworkGraphStore.getState();
    const deskId = net.activeDeskId;
    const watchlist = net.desks.find((d) => d.id === deskId)?.sharedWatchlist ?? [];

    const seeded: TeamAlert[] = [
      {
        id: "talert-funding-01",
        deskId,
        scope: "desk",
        coin: "HYPE",
        condition: "Funding rate > 0.08% / 8h",
        severity: "watch",
        createdBy: "MACRO_LEAD",
        active: true,
        subscriberCount: 3,
        lastTriggeredAt: Date.now() - 3600_000,
      },
      {
        id: "talert-liq-01",
        deskId,
        scope: "desk",
        coin: "BTC",
        condition: "Liquidation cluster > $50M within 2%",
        severity: "critical",
        createdBy: "PERP_DESK_A",
        active: true,
        subscriberCount: 4,
        lastTriggeredAt: null,
      },
      {
        id: "talert-spread-01",
        deskId,
        scope: "org",
        coin: "ETH",
        condition: "Spread > 12bps sustained 5m",
        severity: "watch",
        createdBy: "FLOW_SCOUT",
        active: true,
        subscriberCount: 6,
        lastTriggeredAt: Date.now() - 7200_000,
      },
    ];

    const watchlistAlerts: TeamAlert[] = watchlist.slice(0, 2).map((coin, i) => ({
      id: `talert-wl-${coin}`,
      deskId,
      scope: "desk" as const,
      coin,
      condition: `Shared watchlist monitor — ${coin} volatility spike`,
      severity: "info" as const,
      createdBy: "DESK SYNC",
      active: true,
      subscriberCount: net.profiles.filter((p) => p.deskId === deskId).length,
      lastTriggeredAt: i === 0 ? Date.now() - 900_000 : null,
    }));

    return [...seeded, ...watchlistAlerts];
  }
}
