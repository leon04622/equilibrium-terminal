# Proprietary Market Intelligence & Network Effects (Phase 30)

Equilibrium transitions from advanced infrastructure to a **defensible crypto market operating system** — differentiated through proprietary analytics, workflow embedding, and privacy-preserving network intelligence.

## Architecture

```
types/proprietary-intelligence.ts
lib/proprietary/                         — 9 engines + orchestrator
store/useProprietaryIntelligenceStore.ts
hooks/useProprietaryIntelligence.ts
components/.../ProprietaryIntelligenceConsole.tsx
api/proprietary/sync                     — moat & metrics sync
api/proprietary/metrics                  — institutional EQ metric export
```

Extends Phase 25 (`intelengine`), Phase 27 (`collab`), Phase 28 (`enterpriseops`), Phase 29 (`integrations`).

## Panel

| ID | Commands | Shortcut |
|----|----------|----------|
| `propintel` | `/propintel`, `/proprietary`, `/moat`, `/eqintel` | `Ctrl+Shift+P` |

Entitlement: **`proprietaryIntelEnabled`** (team + enterprise tiers)

## Signature EQ metrics

| Metric | Unit | Purpose |
|--------|------|---------|
| EQ Liquidity Stress Index | EQ-LSI | Cross-venue liquidity pressure |
| EQ Exchange Risk Index | EQ-ERI | Operational & structure risk |
| EQ Leverage Saturation | EQ-LSAT | Positioning crowding |
| EQ Stablecoin Confidence | EQ-SCI | Depeg / system confidence |
| EQ Volatility Regime Index | EQ-VRI | Vol regime classification |
| EQ Narrative Acceleration | EQ-NAR | Sector narrative velocity |
| EQ Execution Quality Index | EQ-EQI | Slippage & spread quality |
| EQ Market Breadth | EQ-BRD | Beta participation breadth |
| EQ Liquidity Fragmentation | EQ-LFR | Order flow fragmentation |

## Subsystems

### Market structure analytics
Cross-exchange liquidity, order flow fragmentation, stablecoin circulation, leverage concentration, macro sensitivity, sector rotations.

### Institutional benchmarking
Exchange reliability, liquidity quality, execution quality, market depth, volatility stability rankings.

### Network-driven intelligence
Privacy-preserving aggregated desk signals — no wallet/PII exposure. Sources: aggregated desks, workflow patterns, anomaly clusters.

### Workflow embedding (moat)
Operational continuity, team collaboration, organizational memory, external integration dependency scores.

### Signature terminal features
- Unified Liquidity Radar
- Crypto Market Stress Monitor
- Stablecoin System Map
- Narrative Acceleration Engine
- Institutional Execution Monitor
- Cross-Market Intelligence Graph

### Operational intelligence memory
Historical events, volatility analogs, narrative evolution, liquidity regime history, macro reaction archives.

### Intelligence distribution
Market state dashboards, volatility monitors, liquidity summaries, ecosystem health, operational briefings.

## Scores

- **Differentiation Score** — depth of proprietary analytics surface
- **Moat Score** — workflow embedding + network effects + signature features

## Console tabs

**METRICS · STRUCTURE · BENCH · NETWORK · EMBED · SIGNATURE · MEMORY · DIST**

## Event bus

- `proprietary:metric` — critical EQ metric threshold crossed (feeds tactical wire path)

## API

- `GET /api/proprietary/metrics` — export EQ metrics for embed/partners
- `POST /api/proprietary/sync` — sync moat scores server-side

## Roadmap

- Historical metric time-series storage
- Custom benchmark universes per institution
- Federated network intelligence with differential privacy
- Signature metric licensing for external distribution
- Vol analog ML matching engine

## Long-term objective

Equilibrium becomes the **operational intelligence layer** institutional crypto markets depend on — defensible infrastructure with proprietary visibility, embedded workflows, and market-wide operational relevance.
