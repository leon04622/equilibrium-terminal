import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { AssetIntelligenceProfile } from "@/types/market-intelligence";

export class AssetIntelligenceEngine {
  static profiles(limit = 12): AssetIntelligenceProfile[] {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const watchlist = useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin);
    const active = terminal.selectedCoin ?? terminal.selectedAsset?.coin;
    const coins = Array.from(new Set([active, ...watchlist].filter(Boolean))) as string[];

    return coins.slice(0, limit).map((coin) => {
      const isActive = coin === active;
      const spread = isActive ? terminal.book?.spreadBps : null;
      const mid = terminal.mids.mids[coin];
      const intel = terminal.intelligence.filter((i) => i.coin === coin);
      const wire = atmosphere.wire.filter((w) => w.coin === coin);

      const liquidityShift: AssetIntelligenceProfile["liquidityShift"] =
        spread != null && spread > 18
          ? "stressed"
          : spread != null && spread > 12
            ? "thinning"
            : spread != null && spread < 6
              ? "deepening"
              : "stable";

      const volSignals = intel.filter((i) => i.severity !== "info").length + wire.length;
      const volatilityChange: AssetIntelligenceProfile["volatilityChange"] =
        volSignals >= 3
          ? "spiking"
          : volSignals >= 1
            ? "rising"
            : atmosphere.stress.velocityRatio < 0.8
              ? "compressing"
              : "flat";

      const whale = intel.find((i) => i.channel === "on-chain" && (i.notionalUsd ?? 0) > 100_000);
      const whaleFlowSignal: AssetIntelligenceProfile["whaleFlowSignal"] = whale
        ? whale.title.toLowerCase().includes("out")
          ? "distribution"
          : "accumulation"
        : "neutral";

      const buys = terminal.trades.filter((t) => t.coin === coin && t.side === "buy").length;
      const sells = terminal.trades.filter((t) => t.coin === coin && t.side === "sell").length;
      const orderFlowBias: AssetIntelligenceProfile["orderFlowBias"] =
        buys > sells + 2 ? "buy" : sells > buys + 2 ? "sell" : "balanced";

      const narrativeActivity = Math.min(100, wire.length * 18 + intel.length * 12);

      return {
        coin,
        liquidityShift,
        volatilityChange,
        fundingCondition: atmosphere.regime.narrativeAcceleration > 20 ? "long_pays" : "neutral",
        narrativeActivity,
        whaleFlowSignal,
        orderFlowBias,
        macroExposure: coin === "BTC" || coin === "ETH" ? "high" : "moderate",
        headline: `${coin} · ${liquidityShift} liquidity · ${volatilityChange} vol`,
        updatedAt: Date.now(),
      };
    });
  }
}
