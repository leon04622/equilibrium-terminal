# Mobile Companion, Alerting & Continuous Awareness (Phase 50)

Equilibrium transitions from **desktop-centric terminal** to **continuous multi-device operational infrastructure** — mobile optimizes awareness, not full terminal replication.

## Philosophy

- **Desktop primary** — execution and research remain on desk
- **Mobile secondary** — monitoring, alerts, oversight, incident response
- **Institutional tone** — operational alerts, not spam
- **Human central** — no autonomous mobile trading

## Architecture

```
types/mobile-operational.ts       — schemas
lib/mobile-desk/                  — 11 engines + orchestrator
store/useMobileDeskStore.ts
hooks/useMobileDesk.ts
components/.../MobileDeskConsole.tsx
api/mobile/vitals                 — awareness score & telemetry
```

Integrates: `NotificationDeliveryEngine`, `IncidentMonitorEngine`, execution/derivatives/systemic/memory alerts, portfolio desk, information distribution.

## Panel

| ID | Title | Experience |
|----|-------|------------|
| `mobiledesk` | MOBILE OPS | `M{awarenessScore}` |

## Subsystems (Phases 1–9)

1. **Companion architecture** — iOS/Android Expo RN, shared API, APNs/FCM push (beta/staged)
2. **Real-time alerts** — vol, liq, funding, whale, portfolio, execution, exchange incidents
3. **Mobile intel feed** — newswire + terminal intelligence tape
4. **Portfolio/risk oversight** — exposure, leverage, liq proximity, treasury
5. **Execution oversight** — flow, fill quality, slippage tier, emergency reduce (staged)
6. **Watchlist monitoring** — synced surveillance watchlist + alert counts
7. **Cross-device continuity** — desktop/iOS/Android sessions, handoff-ready
8. **Incident mode** — operational summary + action checklist from incident monitor
9. **Performance** — battery saver, WS reconnects, background push, offline queue

## API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/mobile/vitals` | GET | Awareness score, alerts, incident flag |

## Dashboard modes

- Continuous awareness · Alert focus · Portfolio oversight · Incident response · Desk handoff

## Mobile stack (staged)

- React Native + Expo SDK 52
- Equilibrium REST/WebSocket gateway
- Server-side alert router → APNs/FCM

## Extension path

1. Expo companion app repo with SIWE + API key auth
2. Production push certificate pipeline
3. Offline event queue sync on reconnect
4. Deep links into desktop workspace handoff
5. Apple Watch / critical-only glance (optional)
