#!/usr/bin/env node
/** Pre-launch readiness probe — hits /api/hardening/readiness */

const base = process.env.EQ_READINESS_URL ?? "http://localhost:3000";

async function main() {
  const url = `${base.replace(/\/$/, "")}/api/hardening/readiness`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${res.status} ${url}`);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`Launch readiness: ${data.launchReadinessScore}%`);
  console.log(`Approved: ${data.launchApproved}`);
  if (data.blockers?.length) {
    console.log("Blockers:");
    for (const b of data.blockers) console.log(`  - ${b}`);
  }
  process.exit(data.launchApproved ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
