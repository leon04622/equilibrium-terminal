#!/usr/bin/env node
const base = process.env.EQ_ALPHA_URL ?? "http://localhost:3000";

async function main() {
  const url = `${base.replace(/\/$/, "")}/api/alpha/vitals`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Alpha operational score: ${data.operationalScore}`);
  console.log(`Rollout: ${data.rolloutPct}%`);
  console.log(`Dependency: ${data.retention?.dependencySignal}`);
  const met = (data.successIndicators ?? []).filter((s) => s.met).length;
  console.log(`Success conditions met: ${met}/${(data.successIndicators ?? []).length}`);
  process.exit(data.operationalScore >= 50 ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
