import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NewswireItem, PersonalizedDeliveryItem } from "@/types/information-distribution";

export class PersonalizedDeliveryEngine {
  static filter(newswire: NewswireItem[], limit = 16): PersonalizedDeliveryItem[] {
    const watchlist = new Set(
      useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin),
    );
    const activeCoin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      null;

    const out: PersonalizedDeliveryItem[] = [];

    for (const item of newswire) {
      if (!item.coin) continue;
      const onWatchlist = watchlist.has(item.coin);
      const isActive = item.coin === activeCoin;
      if (!onWatchlist && !isActive) continue;

      let reason = "Watchlist match";
      if (isActive && onWatchlist) reason = "Active asset · watchlist";
      else if (isActive) reason = "Active asset context";
      else if (item.category === "volatility" || item.category === "liquidation") {
        reason = "Volatility on watchlist asset";
      } else if (item.category === "liquidity") {
        reason = "Liquidity warning · watchlist";
      }

      out.push({
        id: `personal-${item.id}`,
        coin: item.coin,
        headline: item.headline,
        reason,
        severity: item.severity,
        timestamp: item.timestamp,
      });
    }

    return out
      .sort((a, b) => {
        const sev = { critical: 3, watch: 2, info: 1 };
        return sev[b.severity] - sev[a.severity] || b.timestamp - a.timestamp;
      })
      .slice(0, limit);
  }
}
