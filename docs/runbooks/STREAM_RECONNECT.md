# Runbook: WebSocket Stream Reconnect

## Symptoms

- Green dot yellow/red in INTEL header
- Execution blocked: "Market stream offline"
- LIVE OPS: `lastMessageAgeMs` >12000

## Steps

1. Hard refresh browser (Ctrl+Shift+R)
2. Confirm selected asset has liquidity (BTC/ETH)
3. Check HL public status
4. Review console for `[WS Security]` warnings
5. If wallet mismatch on reconnect: re-login SIWE platform session
6. Escalate if reconnect loop >40 attempts (abuse guard)

## Technical path

`useTerminalStreams` → `StreamProcessingEngine` (rAF coalesce) → `terminalStore`

Reconnect counter tracked in `StreamResilienceEngine` for ops vitals.
