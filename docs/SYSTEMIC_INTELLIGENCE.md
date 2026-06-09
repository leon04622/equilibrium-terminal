# Knowledge Graph, Market Relationships & Systemic Intelligence (Phase 46)

Connected institutional market intelligence — extends Phase 18 `MarketKnowledgeGraph` with systemic relationship, risk, narrative, and cascade analytics.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Entity graph | `MarketEntityGraphEngine` — venues, stables, protocols, treasury, MM, pools |
| Relationships | `RelationshipEngine` — correlations, dependencies, sector rotation |
| Systemic risk | `SystemicRiskEngine` — concentration, contagion, fragmentation |
| Narratives | `NarrativePropagationEngine` — emergence, acceleration, sector spread |
| Liquidity flows | `LiquidityFlowMappingEngine` — stablecoin, bridge, exchange flows |
| Event cascade | `EventCascadeEngine` — macro, liquidation, regulatory propagation |
| Context enrichment | `ContextualEnrichmentEngine` — related assets/sectors for intel events |
| Knowledge memory | `KnowledgeMemoryEngine` — local regime / contagion history |
| AI context | `AiContextualizationEngine` — organized summary (human review) |

## Terminal UI

- **KNOWLEDGE GRAPH** (`knowledgegraph`) — query + mini graph (Phase 18)
- **SYSTEMIC INTEL** (`systemicintel`) — unified systemic console (Phase 46)
- Experience bar: `K{systemicScore}`

## APIs

- `GET /api/systemic/vitals?asset=BTC`

## Pipeline

```
Terminal stores → GraphIngestPipeline → marketKnowledgeGraph
Portfolio / Derivatives snapshots → SystemicIntelligenceOrchestrator
```

## Philosophy

Systems thinking for the human trader — AI organizes relationships; no autonomous decisions.
