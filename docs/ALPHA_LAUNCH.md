# Controlled Institutional Alpha Launch (Phase 41)

Real-world operational deployment for selected professional operators — not mass retail.

## Target cohorts

- Hyperliquid power users
- Professional scalpers
- Liquidity-focused traders
- Small trading desks
- Execution-heavy workflows

## Invite-only access

Production requires invite validation when `NEXT_PUBLIC_EQ_ALPHA_INVITE_REQUIRED` is not `false`.

Default codes (override with `NEXT_PUBLIC_EQ_ALPHA_CODES`):

- `EQ-ALPHA-2026`
- `EQ-HL-DESK`
- `EQ-EXEC`

Storage: `localStorage` key `eq-alpha-invite-v1`

## Feature flags & kill switches

`src/lib/alpha/AlphaFeatureFlags.ts`

| Flag | Purpose |
|------|---------|
| execution | Trade ticket / agent |
| intelligence_feed | Tape & intel |
| alerts | Alert engine |
| advanced_panels | EXPAND museum panels |
| stress_replay | Volatility stress |
| collaboration | Team Net |

Kill switch disables a flag immediately without redeploy.

## Operational console

**PRODUCT · COMMERCIAL** → **ALPHA** tab:

- Retention & dependency signals
- Success conditions
- Workflow observations
- Feature flags
- Iteration focus (refinement only — no vision expansion)

## APIs

- `GET /api/alpha/vitals`
- `GET/POST /api/alpha/feedback`

```bash
EQ_ALPHA_URL=https://equilibrium-terminal-three.vercel.app npm run ops:alpha
```

## Success conditions

- Daily return likelihood ≥ 70%
- Habit formation emerging or forming
- Execution trust ≥ 75%
- Workflow depth ≥ 60
- Launch hardening approved

## Post-alpha priority

Refinement · stabilization · performance · workflow quality · trust — **not** massive new features.
