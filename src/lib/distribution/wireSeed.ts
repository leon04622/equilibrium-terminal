import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";

/** Bootstrap tactical wire from live HL intelligence — no synthetic headlines. */
export function ensureWireSeeded(): void {
  const store = useMarketAtmosphereStore.getState();
  if (store.wire.length > 0) return;

  const intel = useTerminalStore.getState().intelligence;
  if (intel.length === 0) return;

  for (const item of intel.slice(0, 8)) {
    store.ingestIntelligenceWire({
      id: item.id,
      coin: item.coin,
      headline: item.title,
      channel:
        item.channel === "on-chain"
          ? "on-chain"
          : item.channel === "social"
            ? "social"
            : "market",
      severity: item.severity,
      notionalUsd: item.notionalUsd,
      timestamp: item.timestamp,
    });
  }
}
