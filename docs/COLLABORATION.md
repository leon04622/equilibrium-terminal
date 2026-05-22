# Institutional Collaboration & Team Workflows (Phase 27)

Equilibrium transitions from single-user terminal experience to **multi-user operational market infrastructure** — shared financial infrastructure where trading teams, research desks, and portfolio managers collaborate inside the terminal daily.

## Architecture

```
types/collaboration.ts          — schemas
lib/collaboration/              — engines + CollaborationOrchestrator
store/useCollaborationStore.ts  — UI state
hooks/useCollaboration.ts       — tick, sync, layout CRDT, auth bridge
components/.../CollaborationConsole.tsx
api/collaboration/sync          — desk activity sync
api/collaboration/vitals        — collaboration health
```

Extends Phase 9 network layer (`useNetworkGraphStore`, `CrdtWorkspaceCoordinator`, `NetworkTransport`) rather than replacing it.

## Panel

| ID | Commands | Shortcut |
|----|----------|----------|
| `collab` | `/collab`, `/teamroom`, `/deskops`, `/focus collab` | `Ctrl+Shift+T` |
| `teamdesk` | `/team`, `/teamdesk`, `/desk`, `/net` | `Ctrl+T` |

Entitlement: `teamNetEnabled` (team / enterprise tiers)

## Subsystems

### Shared workspace
- Shared watchlists via CRDT (`watchlist_add/remove`)
- Layout sync via debounced `publishLayoutPatch` (8s interval when entitled)
- Team templates and layout version tracking

### Team intelligence
- Desk signals (Phase 9 `SharedSignal`)
- Internal communications feed (briefings, execution alerts, research threads)
- Intelligence event → annotation bridge (high-score intel auto-annotates when permitted)

### Market annotation layer
- Chart, liquidity, event, thesis, macro, execution annotations
- CRDT-persisted across tabs via `BroadcastChannel`
- Pinned annotations archived to organizational memory

### Research distribution
- Thesis boards, sector reports, macro briefings, market recaps
- Versioned publications with desk/org visibility

### Role-based workflows
- Platform roles (`analyst`, `trader`, `admin`) bridged to desk roles
- `CollaborationPermissionEngine` resolves publish/annotate/layout/research/alert permissions

### Team alerts
- Desk-wide and org-scoped shared alerts
- Subscriber counts and trigger history

### Activity & organizational memory
- Unified activity timeline (signals, annotations, research, alerts, CRDT ops)
- Archived research, event analysis, thesis evolution, market reaction archives

## Real-time sync

| Layer | Mechanism |
|-------|-----------|
| Same-browser tabs | `BroadcastChannel` (`eq-network-${deskId}`) |
| Layout / watchlist / annotations | LWW CRDT (`CrdtWorkspaceCoordinator`) |
| Server desk cache | POST `/api/collaboration/sync` every 15s |
| Presence | Derived from peer mesh + profile activity |

## Event bus

- `collaboration:presence` — member status updates
- `collaboration:annotation` — new annotation published
- `collaboration:briefing` — desk briefing distributed
- `network:crdt` / `network:layout` — CRDT ops (Phase 9)

## Security & permissions

| Capability | viewer | analyst | trader | pm/admin |
|------------|--------|---------|--------|----------|
| Publish signals | — | ✓ | ✓ | ✓ |
| Annotate | — | ✓ | ✓ | ✓ |
| Share layout | — | — | ✓ | ✓ |
| Publish research | — | ✓ | — | ✓ |
| Manage alerts | — | ✓ | ✓ | ✓ |
| Manage desk | — | — | — | ✓ |
| View audit | — | — | — | ✓ |

Audit trail logged in collaboration snapshot.

## Roadmap

- WebSocket desk relay (replace BroadcastChannel for cross-machine sync)
- SIWE-linked desk membership enforcement
- Chart annotation rendering in `ChartWidget`
- Entitlement gate on panel render path
- Multi-tenant feed partitioning for team-only newswire items

## Long-term objective

Equilibrium becomes the **shared operational environment** for crypto trading organizations — where teams collaborate, monitor markets, distribute intelligence, and execute workflows together.
