# Decision Engine & Actionable Intelligence (Phase 16)

## Objective

Convert raw terminal intelligence into **actionable trader decisions** — structured theses, ranked directives, risk explanations, and execution readiness.

## Architecture

```
Terminal / Execution / Atmosphere / Agentic stores
                    │
                    ▼
        DecisionContextAggregator
                    │
                    ▼
          DecisionSignalBridge (+ mode weights)
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
 ConflictResolver  MarketStateSynthesizer  RiskReasoningEngine
        │           │           │
        └───────────┼───────────┘
                    ▼
     ThesisGenerator + ExecutionReadinessScorer
                    │
                    ▼
      ActionableIntelligenceRanker + StrategicBriefing
                    │
                    ▼
           useDecisionEngineStore
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 DecisionCommandCenter      AiCopilot briefing
```

## Pipeline steps

| Step | Module |
|------|--------|
| Context aggregation | `DecisionContextAggregator` |
| Signal fusion | `DecisionSignalBridge` + `MODE_DOMAIN_WEIGHTS` |
| Conflict resolution | `ConflictResolver` |
| Thesis generation | `ThesisGenerator` (bull / bear / neutral) |
| Risk reasoning | `RiskReasoningEngine` |
| Market synthesis | `MarketStateSynthesizer` |
| Execution readiness | `ExecutionReadinessScorer` |
| Actionables | `ActionableIntelligenceRanker` |
| Orchestration | `DecisionEngine.evaluate()` |

## Trader decision modes

`balanced`, `scalper`, `swing`, `macro`, `momentum`, `narrative`, `quant`

Each mode reweights signal domains (orderflow, macro, narrative, execution, etc.).

## UI

- **DECISION COMMAND** panel — conviction meter, fused stance, brief, actionables, conflicts, theses, risks
- **AI Copilot** — surfaces strategic briefing when chat is empty
- Mode selector in Decision Command header

## Roadmap

### 16a (shipped)

- [x] Types, engines, store, hook
- [x] Decision Command Center widget
- [x] Copilot briefing integration
- [x] Workspace wiring

### 16b (next)

- [ ] LLM-backed thesis refinement (replace template strings)
- [ ] Funding / OI feeds into positioning domain
- [ ] Push top actionable to alerts bus
- [ ] Persist decision snapshot in workspace API

### 16c

- [ ] Historical analog retrieval from quant backtest library
- [ ] Decision audit log + post-trade attribution
- [ ] Multi-asset portfolio-level decision fusion
