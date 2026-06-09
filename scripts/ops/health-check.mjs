#!/usr/bin/env node
/**
 * Ops health probe — use in CI or cron against deployed /api/ops/health
 * EQ_HEALTH_URL=https://equilibrium-terminal-three.vercel.app node scripts/ops/health-check.mjs
 */
const base = process.env.EQ_HEALTH_URL ?? "http://localhost:3000";
const url = `${base.replace(/\/$/, "")}/api/ops/health`;

const res = await fetch(url, { headers: { accept: "application/json" } });
const body = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error(`Health check failed HTTP ${res.status}`, body);
  process.exit(1);
}

if (body.status !== "ok" && body.status !== "degraded") {
  console.error("Unexpected health payload", body);
  process.exit(1);
}

console.log(`OK · env=${body.environment} score=${body.operationalScore} uptime=${body.uptimeSec}s`);
