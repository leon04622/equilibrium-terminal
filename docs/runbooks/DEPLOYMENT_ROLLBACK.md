# Runbook: Deployment Rollback

## When to use

- Production error rate spike after deploy
- Critical regression in execution or market stream
- Failed smoke test on `/api/ops/health`

## Steps

1. Confirm incident in **INFRA → LIVE OPS** (operational score drop, open incidents).
2. Vercel dashboard → Deployments → select last known-good deployment → **Promote to Production**.
3. Or CLI: `npx vercel rollback` (interactive) on linked project.
4. Verify: `curl https://equilibrium-terminal-three.vercel.app/api/ops/health`
5. Post in incident channel: version rolled back, root cause TBD.
6. Document in audit log / postmortem.

## Prevention

- Run `npm run ci` before merge
- Use manual `deploy-production` workflow with smoke step
- Keep `EQ_PREVIOUS_RELEASE` env for manifest tracking
