# Security, Authorization & Trust (Phase 37)

Institutional security is core product infrastructure — not an add-on.

## Layers

| Layer | Module | Responsibility |
|-------|--------|----------------|
| Authentication | `AuthEngine` + SIWE routes | Wallet sign-in, JWT access + refresh |
| RBAC | `RbacEngine` | Fine-grained permissions (trader, analyst, admin, researcher, compliance, operations) |
| Execution auth | `ExecutionAuthorizationEngine` | Isolated from config APIs; gates order signing |
| API guard | `ApiSecurityGuard` | Rate limits, trace IDs, session + permission checks |
| Audit | `auditStore` + `AuditLogEngine` | Server + client forensic logs |
| Threats | `threatStore` | Brute-force, rate-limit, stuffing signals |
| Devices | `deviceSessionStore` | Multi-device session registry |
| Secrets | `SecretsVault` | Env-isolated JWT / vault keys |
| WebSocket | `WebSocketSecurityGate` | Session-bound subscriptions, reconnect validation |

## API routes

| Route | Purpose |
|-------|---------|
| `GET/POST /api/auth/siwe` | Challenge + verify (rate limited, audited) |
| `POST /api/auth/refresh` | JWT rotation |
| `POST /api/auth/logout` | Revoke session + devices |
| `GET /api/security/vitals` | Trust snapshot |
| `GET /api/security/audit` | Audit log (requires `audit.read`) |

## Production requirements

Set in Vercel / host environment:

- `EQUILIBRIUM_JWT_SECRET` — minimum 32 characters
- `EQUILIBRIUM_JWT_ROTATED_AT` — ISO date of last rotation (optional)

## UI

- **RELIABILITY** panel → **TRUST** tab: trust score, session, WS binding, security audit tail
- Execution denials logged client-side when RBAC or market guards block orders

## Execution boundary

- Platform JWT authorizes workspace, APIs, entitlements
- Hyperliquid agent keys remain **ephemeral client-side** — never sent to config APIs
- `authorizeWorkspaceAction` rejects `agentKeyFingerprint` on server routes

## Extension

- Persist audit/threat stores to durable DB
- Hardware security module / KMS for agent policies
- Signed API requests (`x-eq-signature`) for institutional feeds
