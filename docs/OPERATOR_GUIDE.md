# Phase 62 — Contextual Explain Mode & Replay-Based Learning

Institutional operational education layer — not retail tutorials.

## Console

- **Widget:** `explaindesk` — OPERATOR GUIDE
- **Experience bar:** `W{guideScore}` · **EXPLAIN** toggle
- **API:** `GET /api/operator-guide/vitals`
- **Shortcut:** `?` toggles explain mode · **Ctrl+K** → `/guide`

## Architecture

| Module | Role |
|--------|------|
| `ComponentRegistryEngine` | Panel glossary — operational, professional, metrics |
| `ScenarioLibraryEngine` | Categorized replay scenarios (9 event types) |
| `ReplayLearningEngine` | Synthetic candle replay + intel seed + chart sync |
| `EducationalOverlayEngine` | Progress-based replay annotations |
| `WorkflowWalkthroughEngine` | Guided multi-step desk workflows |
| `OperatorGuideOrchestrator` | Unified snapshot |

## Phases delivered

1. **Global explain mode** — header EXPLAIN · `?` · `/guide`
2. **Component overlays** — `?` button on every panel header when explain ON
3. **Explain side panel** — operational copy, metrics, workflows, replay annotations
4. **Replay learning** — SCENARIOS → SHOW REAL EXAMPLE
5. **Dynamic overlays** — annotations during replay progress
6. **Scenario library** — liq cascade, vol spike, funding squeeze, depeg, etc.
7. **Workflow learning** — liquidity, order flow, funding, vol, execution, alerts

## UI tabs

GLOSSARY · SCENARIOS · WORKFLOWS · REPLAY · MODES

## Event bus

| Event | Purpose |
|-------|---------|
| `guide:select` | Open side panel for component |
| `guide:explain-toggle` | Explain mode state |
| `guide:replay-start` | Scenario replay began |
| `guide:replay-stop` | Return to live |
| `chart:replay` | Sync replay progress |

## Philosophy

Human trader remains central. Guidance explains structure and professional practice — no trade signals.
