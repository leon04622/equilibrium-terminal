import { useTerminalStore } from "@/store/terminalStore";
import type { CoverageVenue, VenueStatus } from "@/types/market-coverage";

const BASE_VENUES: Omit<CoverageVenue, "status" | "latencyMs" | "lastEventAt" | "assetsTracked">[] = [
  { id: "hl-perp", name: "HYPERLIQUID PERP", kind: "derivatives" },
  { id: "hl-spot", name: "HYPERLIQUID SPOT", kind: "cex" },
  { id: "binance", name: "BINANCE (STAGED)", kind: "cex" },
  { id: "coinbase", name: "COINBASE (STAGED)", kind: "cex" },
  { id: "uniswap", name: "UNISWAP (STAGED)", kind: "dex" },
  { id: "deribit", name: "DERIBIT OPTIONS (STAGED)", kind: "options" },
  { id: "usdt", name: "USDT ECOSYSTEM", kind: "stablecoin" },
  { id: "usdc", name: "USDC ECOSYSTEM", kind: "stablecoin" },
  { id: "btc-etf", name: "BTC ETF FLOWS", kind: "etf" },
  { id: "eth-etf", name: "ETH ETF FLOWS", kind: "etf" },
  { id: "eth-l1", name: "ETHEREUM ON-CHAIN", kind: "on_chain" },
  { id: "btc-l1", name: "BITCOIN ON-CHAIN", kind: "on_chain" },
  { id: "bridges", name: "CROSS-CHAIN BRIDGES", kind: "bridge" },
  { id: "staking", name: "STAKING / VALIDATORS", kind: "staking" },
  { id: "gov", name: "GOVERNANCE FEEDS", kind: "governance" },
];

function connectionStatus(): VenueStatus {
  const s = useTerminalStore.getState().connectionStatus;
  if (s === "connected") return "live";
  if (s === "reconnecting") return "degraded";
  if (s === "connecting") return "degraded";
  return "offline";
}

export class MarketCoverageRegistry {
  static list(): CoverageVenue[] {
    const terminal = useTerminalStore.getState();
    const hlStatus = connectionStatus();
    const assetCount = terminal.assets.length;
    const lastMsg = terminal.lastMessageAt;
    const lat =
      lastMsg != null ? Math.max(0, Date.now() - lastMsg) : null;

    return BASE_VENUES.map((v, i) => {
      const isHl = v.id.startsWith("hl");
      const status: VenueStatus = isHl
        ? hlStatus
        : v.name.includes("STAGED")
          ? "staged"
          : "degraded";
      return {
        ...v,
        status,
        assetsTracked: isHl ? assetCount : Math.round(assetCount * (0.3 + (i % 5) * 0.1)),
        latencyMs: isHl ? lat : null,
        lastEventAt: isHl ? lastMsg : null,
      };
    });
  }
}
