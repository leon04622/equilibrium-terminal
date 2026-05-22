# Institutional Terminal Experience (Phase 26)

Equilibrium transitions from powerful infrastructure to a **cohesive institutional product experience** — mission-critical financial software that feels calm, intentional, and professionally trustworthy.

## UX philosophy

**Avoid:** visual chaos, over-animation, retail aesthetics, gradients, dashboard clutter, information overload

**Prioritize:** operational clarity, hierarchy, typography, spacing, workflow continuity, calm professionalism

## Design system (`src/lib/theme/`)

| Token layer | Purpose |
|-------------|---------|
| `theme.ts` | Core colors, typography, layout geometry, skin bundles |
| `institutional.ts` | Spacing, density presets, mode chrome, status indicators, interaction patterns |

### Density scaling

| Mode | Grid row | Use case |
|------|----------|----------|
| COMPACT | 22px | Maximum information density |
| STANDARD | 24px | Default institutional balance |
| COMFORT | 26px | Extended sessions, readability |

Header control: density selector in **TerminalExperienceBar**

### Calm mode

Suppresses aggressive price flashes. Enabled by default. Toggle: **CALM** in header.

### Reduced motion

Disables flash/pulse animations. Toggle: **MOTION** in header. Respects `prefers-reduced-motion`.

## Panel cohesion

`PanelShell` provides unified:

- Status indicator dot (live / watch / critical / offline / idle)
- Consistent toolbar buttons (`INSTITUTIONAL_INTERACTION.panelButton`)
- Loading state (`PanelLoadingState`)
- Emphasis rings (high priority / muted adaptive states)

## Workspace modes

Each terminal mode applies subtle **mode chrome** on the header border and accent label:

- EXECUTION DESK, RESEARCH DESK, MACRO COMMAND, QUANT LAB, etc.
- Purpose-built feel without layout chaos

## Execution UX

- `ExecutionContextStrip` — spread, slippage, regime, stress, exec pipeline
- `ExecutionWarningBanner` — pre-submit liquidity warnings
- Institutional flat styling on `TradeTicket` (no rounded retail buttons)
- Clear **ORDER SUBMITTING** confirmation state

## Trust signals

Header displays:

- Stream connection status
- **OPERATIONAL / DEGRADED / ATTENTION** trust label
- Latency readout
- Active asset symbol

## Performance UX

- Density-aware grid row height
- Calm flash animations (reduced opacity)
- Unified loading skeletons across panels

## Multi-monitor (roadmap)

- Detached windows
- Synchronized layouts
- Persistent cross-screen context
- Institutional desk presets

## Long-term identity

Target feel: Bloomberg · Reuters Eikon · institutional execution systems — **crypto-native and modern**.
