# Real-Time Market Intelligence Engine (Phase 25)

Transforms normalized market data into **operational intelligence** — not automated trading decisions. Human traders remain central; AI organizes and contextualizes only.

## Philosophy

Raw data is not valuable by itself. Value comes from organization, contextualization, prioritization, relationship mapping, and operational visibility.

## Architecture

| Module | Role |
|--------|------|
| `EventDetectionEngine` | Detects liquidations, vol spikes, funding skew, spread widening, exchange stress, whale prints |
| `EventEnrichmentEngine` | Links related entities and cross-signal context |
| `IntelligencePrioritizer` | Urgency · impact · relevance · composite scoring |
| `IntelligenceMarketStateEngine` | Volatility, liquidity, leverage, breadth, sentiment, macro risk |
| `AssetIntelligenceEngine` | Per-asset liquidity, vol, funding, whale flow, order flow |
| `NarrativeSectorEngine` | Sector rotation velocity (L1, meme, AI, stablecoin, ETF, governance) |
| `AnomalyDetectionEngine` | Stream anomaly flags from ingest layer |
| `AiIntelligenceSummarizer` | Organizational summaries — no trade directives |
| `IntelligenceOrchestrator` | Unified snapshot |

## Intelligence object model

```typescript
IntelligenceEvent {
  category: liquidity | volatility | macro | narrative | funding | positioning | ...
  severity, confidence, compositeScore
  affectedAssets[], summary, relatedEntities[]
}
```

## UI

- **MARKET INTELLIGENCE** panel (`intelengine`) — EVENTS · STATE · ASSETS · SECTORS · AI BRIEF
- Commands: `/intelengine`, `/mktintel`, `/intelligence-engine`
- Shortcut: `Ctrl+Shift+I` · `/focus intelengine`

## Terminal integration

| Consumer | Integration |
|----------|-------------|
| Intelligence tape | High-score events → `ingestIntelligenceWire` |
| Event bus | `intelligence:engine` for cross-panel linking |
| Alerts | Alert triggers feed detection pipeline |
| Ingest layer | Trade/book events trigger refresh |
| Newswire | Downstream ranked distribution |

## AI assistance boundaries

AI **may**: summarize, contextualize, reduce noise, explain anomalies, connect events  
AI **must not**: replace trader judgment or emit trade directives

## Roadmap

1. **Now** — Detection, enrichment, prioritization, market state, asset profiles, sectors, AI brief
2. **Next** — Correlation matrix, exchange divergence monitor, stablecoin flow tracker
3. **Next** — LLM-assisted enrichment queue (facts-only, human-reviewed)
4. **Long-term** — Fund-desk intelligence profiles, custom scoring weights
