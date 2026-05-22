# Data Ingestion & Normalization (Phase 24)

Equilibrium transitions from terminal interface systems to **true crypto market infrastructure** — aggregating fragmented data into clean, structured, low-latency intelligence.

## Philosophy

We do **not** attempt to own all raw market data. We aggregate fragmented crypto information and transform it into operationally useful intelligence — the Bloomberg model applied to crypto.

## Architecture

| Module | Role |
|--------|------|
| `DataSourceRegistry` | Catalog: exchanges, on-chain, macro, news, social (live + staged) |
| `HyperliquidIngestBridge` | Live HL trades/books/intel → unified ingest bus |
| `NormalizationLayer` | Cross-venue `UnifiedNormalizedTrade` / `UnifiedNormalizedOrderBook` |
| `UnifiedIngestBus` | Internal pub/sub: market · intelligence · liquidity · macro · narrative |
| `IngestStreamBuffer` | Hot storage — in-memory ring buffer (512 events) |
| `IngestDeduplicator` | Backpressure-friendly dedupe window |
| `TimestampNormalizer` | UTC ms normalization + skew integrity |
| `StreamProcessingEngine` | Volatility, liquidity, spread, funding bias, anomalies |
| `IngestQualityGovernor` | Stale feeds, conflicts, redundancy, latency |
| `StorageLayerRouter` | Hot (active) · warm/cold (TimescaleDB/S3 staged) |
| `IngestOrchestrator` | Unified snapshot |

## Unified event bus streams

| Stream | Content |
|--------|---------|
| `market` | Normalized trades |
| `liquidity` | Order book updates |
| `intelligence` | Intel items |
| `macro` | Macro events (staged adapters) |
| `narrative` | Social/narrative (staged adapters) |

Bus events: `ingest:normalized`, `ingest:trade`, `ingest:book`, `venue:status`, `feed:stale`

## UI

- **DATA INGEST** panel (`ingestion`) — tabs: SOURCES · PIPELINE · EVENTS · PROCESS · QUALITY · STORAGE
- Commands: `/ingest`, `/ingestion`, `/dataplane`, `/pipeline`
- Shortcut: `Ctrl+I`

## APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ingestion/events` | GET | Normalized event feed for institutional consumers |
| `/api/ingestion/events` | POST | Terminal sync of hot buffer |
| `/api/ingestion/vitals` | GET/POST | Pipeline vitals / stale feed reporting |

## Data sources (registry)

**Live:** Hyperliquid perp/spot, Equilibrium internal  
**Staged (adapter-ready):** Binance, Bybit, OKX, Coinbase, Kraken, Deribit, Alchemy, QuickNode, DefiLlama, Dune, FRED, ETF flows, exchange news, governance, SEC, social feeds

## Storage layers

| Tier | Backend | Status |
|------|---------|--------|
| Hot | In-memory ring | Active |
| Warm | TimescaleDB / PostgreSQL | Staged |
| Cold | S3 / object storage | Staged |

## Integration

- `DataQualityGovernor.conflictCount` now reads from `IngestQualityGovernor`
- Distribution newswire consumes normalized terminal intelligence downstream
- `platformWebSocketGateway` metrics feed pipeline health (refactor HL streams → gateway = next step)

## Roadmap

1. **Now** — Unified schemas, HL bridge, hot buffer, processing, quality, APIs
2. **Next** — Refactor `useTerminalStreams` → `WebSocketGateway` multiplexer
3. **Next** — Binance/Coinbase WS adapters + venue normalizers
4. **Next** — TimescaleDB warm tier + Redis hot cache
5. **Next** — On-chain indexer (Alchemy/QuickNode) + macro REST pollers
6. **Long-term** — Horizontal shard ingest workers, millions evt/min
