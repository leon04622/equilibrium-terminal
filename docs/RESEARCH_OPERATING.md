# Institutional Research, Annotation & Market Journaling (Phase 48)

Intellectual workspace layer — research continuity, journaling, annotations, thesis tracking, and market memory integration.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Research workspace | `ResearchWorkspaceEngine` — notebooks, collections, saved views |
| Market journal | `MarketJournalEngine` — workflow journal + observations |
| Annotations | `AnnotationInfrastructureEngine` — persistent chart/event notes |
| Thesis tracking | `ThesisTrackingEngine` — lifecycle + narrative phase |
| Research linking | `ResearchLinkingEngine` — intel, history, narrative |
| Collaboration | `CollaborativeAnalystEngine` — desk commentary (COLLAB panel) |
| Memory integration | `MarketMemoryIntegrationEngine` — replay, analogs, regimes |
| Search | `ResearchSearchEngine` — cross-note retrieval |
| AI assistance | `AiResearchAssistanceEngine` — organize/summarize only |

## Terminal UI

- **RESEARCH DESK** (`researchdesk`) — unified research operating console
- **RESEARCH WORKSPACE** / **TRADER JOURNAL** — existing panels (Phase 19)
- Experience bar: `J{researchScore}`

## APIs

- `GET /api/research/vitals?asset=BTC&q=funding`

## Persistence

- Trader workflow: journal, theses, saved views (`SessionContinuity`)
- Annotations: `eq-research-annotations-v1`
- Observations: `eq-market-observations-v1`

## Philosophy

Human analyst remains central. AI organizes — never replaces judgment or generates trade calls.
