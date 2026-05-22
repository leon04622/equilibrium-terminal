# Unified Market Knowledge Graph (Phase 18)

## Mission alignment

Bloomberg-class **interconnected discovery** — relationships between assets, events, flows, narratives, and macro. AI summarizes and links; **traders decide**.

## Architecture

```
Live stores (terminal, atmosphere, agentic, execution)
              │
              ▼
     GraphIngestPipeline (4s incremental)
              │
              ▼
     MarketKnowledgeGraph (entities + links)
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
GraphQuery  AssetHub  CrossMarket
 Engine     Builder    Engine
     │        │        │
     └────────┴────────┘
              ▼
   KnowledgeGraphConsole + OmniBar /graph
```

## Entity types

`asset`, `exchange`, `wallet`, `narrative`, `sector`, `event`, `liquidity_zone`, `macro_event`, `signal`, `intelligence`, `funding_regime`, `volatility_regime`, `summary`

## Relations

`affects`, `correlates_with`, `flows_to`, `targets`, `belongs_to`, `exhibits`, `impacts`, `linked_macro`, `concentrated_in`, …

## Query examples (OmniBar)

```
/graph AI sector accumulation
/graph negative funding
/graph ETH narratives
/graph whale
/graph macro
```

Or natural language in the Knowledge Graph panel search box.

## Asset intelligence hub

Per-asset aggregated view inside the graph panel:

- Price & structure
- Order flow & liquidity
- Macro & regime
- Related entities + timeline
- Informational AI summary (no trade advice)

## Performance

- Incremental ingest (no full rebuild)
- Caps: 2k entities, 8k links
- Query cache (64 entries)
- Neighbor traversal depth 1–2 for subgraphs

## Roadmap

### 18b

- [ ] On-chain stablecoin flow entities
- [ ] Multi-exchange nodes + divergence edges
- [ ] Persistent graph snapshot API
- [ ] WebWorker graph ingest

### 18c

- [ ] Force-directed graph WebGL renderer
- [ ] Historical analog edges from quant library
- [ ] Alert → entity auto-linking
