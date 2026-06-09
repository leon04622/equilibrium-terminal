import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MultiAssetRow } from "@/types/live-execution";

export class MultiAssetMonitoringEngine {
  static scan(): MultiAssetRow[] {
    const rows: MultiAssetRow[] = [];
    const active = useTerminalStore.getState().selectedCoin ?? "BTC";

    for (const w of useTraderWorkflowStore.getState().watchlistIntel.slice(0, 8)) {
      rows.push({
        id: `wl-${w.coin}`,
        asset: w.coin,
        signal: w.summary.slice(0, 40),
        priority:
          w.coin.toUpperCase() === active.toUpperCase()
            ? 90
            : w.alertCount > 2
              ? 85
              : w.execReadiness,
      });
    }

    const mids = useTerminalStore.getState().mids.mids;
    for (const coin of ["BTC", "ETH", "HYPE"]) {
      if (mids[coin] && !rows.some((r) => r.asset === coin)) {
        rows.push({
          id: `mid-${coin}`,
          asset: coin,
          signal: "Venue mid synced",
          priority: coin === active ? 80 : 50,
        });
      }
    }

    return rows.sort((a, b) => b.priority - a.priority);
  }
}
