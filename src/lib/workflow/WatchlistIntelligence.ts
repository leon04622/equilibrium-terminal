import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useAlertStore } from "@/store/useAlertStore";
import type { WatchlistIntelRow } from "@/types/trader-workflow";

export class WatchlistIntelligence {
  static enrich(): WatchlistIntelRow[] {
    const watchlist = useInformationDiscoveryStore.getState().watchlist;
    const mids = useTerminalStore.getState().mids.mids;
    const atmosphere = useMarketAtmosphereStore.getState();
    const triggers = useAlertStore.getState().triggers;
    const execution = useExecutionIntelligenceStore.getState();

    const rows: WatchlistIntelRow[] = watchlist.map((w) => {
      const coin = w.coin;
      const mid = mids[coin];
      const coinAlerts = triggers.filter((t) => t.coin === coin).length;
      const volScore = atmosphere.stress.velocityRatio * 50;
      const spread = useTerminalStore.getState().book?.coin === coin
        ? useTerminalStore.getState().book?.spreadBps ?? 10
        : 10;

      return {
        coin,
        volatilityRank: Math.min(100, Math.round(volScore + (coin.charCodeAt(0) % 8))),
        liquidityRank: Math.max(0, Math.min(100, Math.round(100 - spread * 3))),
        narrativeShift:
          Math.abs(atmosphere.regime.narrativeAcceleration) > 20
            ? `Pulse ${atmosphere.regime.narrativeAcceleration > 0 ? "+" : ""}${atmosphere.regime.narrativeAcceleration.toFixed(0)}`
            : "Stable",
        fundingNote: execution.coin === coin ? `Slip ${execution.slippage.riskTier}` : "—",
        alertCount: coinAlerts,
        execReadiness:
          execution.coin === coin ? execution.executionConfidence : 50,
        summary:
          mid != null
            ? `${coin} mid ${mid} · ${coinAlerts} alert(s) · regime ${atmosphere.regime.regime}`
            : `${coin} · monitoring`,
      };
    });

    return rows.sort((a, b) => b.alertCount - a.alertCount || b.volatilityRank - a.volatilityRank);
  }
}
