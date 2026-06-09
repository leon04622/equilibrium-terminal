import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { RealTimeAlertDeliveryEngine } from "@/lib/mobile-desk/RealTimeAlertDeliveryEngine";
import type { WatchlistAsset } from "@/types/mobile-operational";

export class WatchlistMonitoringEngine {
  static assets(primary: string): WatchlistAsset[] {
    const watchlist = useInformationDiscoveryStore.getState().watchlist;
    const alerts = RealTimeAlertDeliveryEngine.alerts(primary);
    const coins =
      watchlist.length > 0
        ? watchlist.map((w) => w.coin)
        : [primary, "ETH", "SOL"];

    return coins.slice(0, 8).map((coin) => {
      const alertCount = alerts.filter((a) => a.coin?.toUpperCase() === coin.toUpperCase()).length;
      return {
        coin: coin.toUpperCase(),
        change24hPct: 0,
        volRegime: alertCount >= 2 ? "elevated" : "normal",
        alertCount,
      };
    });
  }
}
