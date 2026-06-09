# Runbook: High-Volatility Infrastructure

## Triggers

- FOMC / CPI / liquidation cascade
- Stream EPS >90/s (auto stress mode)
- Operational score <70 with STR active

## Automatic mitigations (Phase 36–38)

- **Stress mode** — coalesced WS, reduced intel tape writes
- **Stream caps** — trade batch limits per frame
- **Incident SEV3** — auto-open in ops orchestrator

## Manual actions

1. Enable **STR** in header if not auto-active
2. Reduce open panels (stay on HL desk wedge)
3. Monitor **PERF** HUD and LIVE OPS stream age
4. Avoid full workspace EXPAND during event unless required
5. After event: confirm heap stable, no incident backlog

## Exchange outage

If Hyperliquid WS fails independently:

- Terminal shows disconnected / stale guards block execution
- Do not bypass execution authorization
- Wait for HL status; reconnect is automatic with backoff
