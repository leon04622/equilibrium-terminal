# Market Coverage & Proprietary Data (Phase 21)

Equilibrium expands from terminal software toward **crypto market infrastructure** — institutional visibility, proprietary metrics, and cross-market awareness. Human traders remain central; data organizes context, not trade calls.

## Architecture

| Module | Role |
|--------|------|
| `MarketCoverageRegistry` | Venue matrix: CEX, DEX, derivatives, options, stablecoins, ETF, on-chain, bridges, staking, governance |
| `ProprietaryMetricsEngine` | EQ liquidity index, fragmentation, narrative velocity, vol score, exchange stress, exec quality, regime index |
| `OnChainIntelligenceEngine` | Whale, treasury, flows, bridge, staking, unlock, governance signals |
| `MarketHealthEngine` | Liquidity health, exchange stress, stablecoin confidence, leverage saturation, breadth, systemic risk |
| `InstitutionalMonitorEngine` | ETF complexes, market makers, stablecoin issuers, exchange reserves |
| `EventIngestPipeline` | Ranked real-time events from alerts, surveillance, wire, intel |
| `DataQualityGovernor` | Feed trust, staleness, online counts |
| `MarketCoverageOrchestrator` | Unified snapshot |

## UI

- **MARKET COVERAGE** panel (`marketcoverage`) — tabs: VENUES · EQ METRICS · ON-CHAIN · HEALTH · EVENTS
- Command: `/coverage` or `/markets`
- Focus: `/focus coverage`

## Data philosophy

- **Live**: Hyperliquid streams (book, mids, intel, wire)
- **Staged**: Additional venues marked for feed expansion — infrastructure visible, not fake-live
- **Proprietary**: Derived scores competitors do not expose raw from a single terminal stack
- **Trust**: Data quality audit surfaces stale/degraded sources

## Extension path

1. Connect Binance/Coinbase/DEX WebSocket feeds into `MarketCoverageRegistry`
2. On-chain indexer → replace staged bridge/staking seeds
3. ETF flow API → institutional watch live updates
4. Conflict resolution when sources disagree (`DataQualityGovernor.conflictCount`)
