import { platformWebSocketGateway } from "@/lib/infrastructure/WebSocketGateway";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  DataSourceCategory,
  DataSourceDescriptor,
  IngestTransport,
  SourceHealth,
} from "@/types/data-ingestion";

interface SourceTemplate {
  id: string;
  name: string;
  category: DataSourceCategory;
  transport: IngestTransport;
  staged?: boolean;
}

const SOURCE_CATALOG: SourceTemplate[] = [
  { id: "hl-perp", name: "Hyperliquid Perp", category: "exchange", transport: "websocket" },
  { id: "hl-spot", name: "Hyperliquid Spot", category: "exchange", transport: "websocket" },
  { id: "binance", name: "Binance", category: "exchange", transport: "websocket", staged: true },
  { id: "bybit", name: "Bybit", category: "exchange", transport: "websocket", staged: true },
  { id: "okx", name: "OKX", category: "exchange", transport: "websocket", staged: true },
  { id: "coinbase", name: "Coinbase", category: "exchange", transport: "websocket", staged: true },
  { id: "kraken", name: "Kraken", category: "exchange", transport: "rest_poll", staged: true },
  { id: "deribit", name: "Deribit", category: "exchange", transport: "websocket", staged: true },
  { id: "alchemy", name: "Alchemy", category: "on_chain", transport: "websocket", staged: true },
  { id: "quicknode", name: "QuickNode", category: "on_chain", transport: "websocket", staged: true },
  { id: "defillama", name: "DefiLlama", category: "on_chain", transport: "rest_poll", staged: true },
  { id: "dune", name: "Dune", category: "on_chain", transport: "rest_poll", staged: true },
  { id: "arkham", name: "Arkham Index", category: "on_chain", transport: "rest_poll", staged: true },
  { id: "bridges", name: "Bridge Monitor", category: "on_chain", transport: "rest_poll", staged: true },
  { id: "validators", name: "Validator Activity", category: "on_chain", transport: "rest_poll", staged: true },
  { id: "fred", name: "FRED", category: "macro", transport: "rest_poll", staged: true },
  { id: "trading-econ", name: "TradingEconomics", category: "macro", transport: "rest_poll", staged: true },
  { id: "etf-flows", name: "ETF Flows", category: "macro", transport: "rest_poll", staged: true },
  { id: "macro-cal", name: "Macro Calendar", category: "macro", transport: "internal" },
  { id: "exchange-news", name: "Exchange Announcements", category: "news", transport: "rest_poll", staged: true },
  { id: "governance", name: "Governance Proposals", category: "news", transport: "rest_poll", staged: true },
  { id: "sec-filings", name: "SEC Filings", category: "news", transport: "rest_poll", staged: true },
  { id: "protocol-news", name: "Protocol Announcements", category: "news", transport: "rest_poll", staged: true },
  { id: "x-narrative", name: "X / Twitter", category: "social", transport: "rest_poll", staged: true },
  { id: "reddit", name: "Reddit", category: "social", transport: "rest_poll", staged: true },
  { id: "telegram", name: "Telegram", category: "social", transport: "rest_poll", staged: true },
  { id: "discord", name: "Discord", category: "social", transport: "rest_poll", staged: true },
  { id: "github", name: "GitHub Activity", category: "social", transport: "rest_poll", staged: true },
  { id: "eq-internal", name: "Equilibrium Internal", category: "internal", transport: "internal" },
];

function hlHealth(): SourceHealth {
  const s = useTerminalStore.getState().connectionStatus;
  if (s === "connected") return "live";
  if (s === "reconnecting" || s === "connecting") return "degraded";
  return "offline";
}

export class DataSourceRegistry {
  static list(): DataSourceDescriptor[] {
    const terminal = useTerminalStore.getState();
    const gateway = platformWebSocketGateway.getMetrics();
    const hl = hlHealth();
    const lastMsg = terminal.lastMessageAt;
    const lat = lastMsg != null ? Math.max(0, Date.now() - lastMsg) : null;
    const eps = gateway.messagesPerSecond * 60;

    return SOURCE_CATALOG.map((src) => {
      const isHl = src.id.startsWith("hl");
      const isInternal = src.category === "internal" || src.transport === "internal";
      let health: SourceHealth = "staged";
      let latencyMs: number | null = null;
      let lastEventAt: number | null = null;
      let eventsPerMinute = 0;

      if (isHl) {
        health = hl;
        latencyMs = lat;
        lastEventAt = lastMsg;
        eventsPerMinute = Math.round(eps);
      } else if (isInternal) {
        health = "live";
        lastEventAt = Date.now();
        eventsPerMinute = Math.round(eps * 0.4);
        latencyMs = lat != null ? Math.min(lat, 120) : 80;
      } else if (!src.staged) {
        health = "degraded";
      }

      return {
        id: src.id,
        name: src.name,
        category: src.category,
        transport: src.transport,
        health,
        latencyMs,
        lastEventAt,
        eventsPerMinute,
        rateLimitRemaining: src.staged ? null : 1000,
        verified: isHl || isInternal,
      };
    });
  }

  static liveCount(): number {
    return DataSourceRegistry.list().filter((s) => s.health === "live").length;
  }
}
