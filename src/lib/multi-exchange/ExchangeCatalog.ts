import type { ExchangeId, ExchangeVenueDescriptor } from "@/types/multi-exchange";

const BASE: Omit<ExchangeVenueDescriptor, "status" | "latencyMs" | "lastEventAt">[] = [
  {
    id: "hyperliquid",
    label: "HYPERLIQUID",
    kind: "derivatives",
    capabilities: ["trades", "book", "funding", "oi", "liquidations", "perp"],
  },
  {
    id: "binance",
    label: "BINANCE",
    kind: "cex",
    capabilities: ["trades", "book", "funding", "oi", "liquidations", "perp"],
  },
  {
    id: "bybit",
    label: "BYBIT",
    kind: "cex",
    capabilities: ["trades", "book", "funding", "oi", "liquidations", "perp"],
  },
  {
    id: "okx",
    label: "OKX",
    kind: "cex",
    capabilities: ["trades", "book", "funding", "oi", "liquidations", "perp"],
  },
  {
    id: "coinbase",
    label: "COINBASE",
    kind: "cex",
    capabilities: ["trades", "book", "perp"],
  },
  {
    id: "kraken",
    label: "KRAKEN",
    kind: "cex",
    capabilities: ["trades", "book", "perp"],
  },
  {
    id: "deribit",
    label: "DERIBIT",
    kind: "options",
    capabilities: ["options", "oi", "funding"],
  },
  {
    id: "uniswap",
    label: "UNISWAP",
    kind: "dex",
    capabilities: ["book", "trades"],
  },
  {
    id: "curve",
    label: "CURVE / STABLE POOLS",
    kind: "dex",
    capabilities: ["book"],
  },
];

export class ExchangeCatalog {
  static list(
    statusById: Partial<Record<ExchangeId, ExchangeVenueDescriptor["status"]>> = {},
    metaById: Partial<
      Record<ExchangeId, { latencyMs: number | null; lastEventAt: number | null }>
    > = {},
  ): ExchangeVenueDescriptor[] {
    return BASE.map((v) => ({
      ...v,
      status: statusById[v.id] ?? (v.id === "hyperliquid" ? "live" : "staged"),
      latencyMs: metaById[v.id]?.latencyMs ?? null,
      lastEventAt: metaById[v.id]?.lastEventAt ?? null,
    }));
  }
}
