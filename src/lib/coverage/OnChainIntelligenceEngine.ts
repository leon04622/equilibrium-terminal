import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { OnChainSignal } from "@/types/market-coverage";

export class OnChainIntelligenceEngine {
  static collect(limit = 24): OnChainSignal[] {
    const wire = useMarketAtmosphereStore.getState().wire;
    const intel = useTerminalStore.getState().intelligence;
    const signals: OnChainSignal[] = [];

    for (const w of wire) {
      if (w.channel !== "on-chain" && w.channel !== "macro") continue;
      signals.push({
        id: w.id,
        category: w.channel === "on-chain" ? "whale" : "treasury",
        coin: w.coin,
        headline: w.headline,
        notionalUsd: w.notionalUsd ?? null,
        severity: w.severity,
        timestamp: w.timestamp,
        sourceVerified: true,
      });
    }

    for (const item of intel) {
      if (item.channel !== "on-chain") continue;
      signals.push({
        id: item.id,
        category: "exchange_flow",
        coin: item.coin,
        headline: item.title,
        notionalUsd: null,
        severity: item.severity,
        timestamp: item.timestamp,
        sourceVerified: true,
      });
    }

    const seed: OnChainSignal[] = [
      {
        id: "oc-bridge",
        category: "bridge",
        coin: "ETH",
        headline: "Bridge volume monitor — staged cross-chain feed",
        notionalUsd: null,
        severity: "info",
        timestamp: Date.now() - 120_000,
        sourceVerified: false,
      },
      {
        id: "oc-stake",
        category: "staking",
        coin: "ETH",
        headline: "Validator exit queue — structural context only",
        notionalUsd: null,
        severity: "info",
        timestamp: Date.now() - 300_000,
        sourceVerified: false,
      },
    ];

    return [...signals, ...seed]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
