# Pre-Launch Hardening Checklist

## Integration (no new features)

- [ ] All 13 integration domains ≥ 80 on LAUNCH tab
- [ ] WebSocket reconnect validated (`docs/runbooks/STREAM_RECONNECT.md`)
- [ ] Workspace snapshot persist/recover tested
- [ ] OmniBar commands resolve without errors

## Performance

- [ ] FPS ≥ 50 under normal load (PERF strip)
- [ ] Stress mode stable during replay (`data-eq-stress`)
- [ ] Large workspace (EXPAND) without long-frame spikes

## Security

- [ ] `EQUILIBRIUM_JWT_SECRET` set in production
- [ ] RBAC execution denials logged (TRUST tab)
- [ ] API rate limits active on ops/commercial routes

## Data quality

- [ ] Zero stale feeds under normal conditions
- [ ] Conflict resolution verified on L2/trades
- [ ] Message freshness &lt; 5s when connected

## Operations

- [ ] `npm run ops:health` pass
- [ ] `npm run ops:readiness` pass
- [ ] Incident runbooks reviewed

## Documentation

- [ ] Operator runbooks in `docs/runbooks/`
- [ ] Enterprise setup: `docs/ENTERPRISE_SETUP.md`
- [ ] Onboarding: `docs/ONBOARDING.md`

## Controlled launch

1. Deploy to staging (`NEXT_PUBLIC_EQ_ENV=staging`)
2. Run readiness probe
3. Promote to production only on approval
4. Monitor RELIABILITY → LAUNCH for 24h post-ship
