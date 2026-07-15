#!/usr/bin/env node
/**
 * Deploy to Vercel production after every successful `npm run build`.
 * Skip with SKIP_POSTBUILD_DEPLOY=1 (used by CI).
 */
import { spawnSync } from "node:child_process";

if (
  process.env.SKIP_POSTBUILD_DEPLOY === "1" ||
  process.env.VERCEL === "1" ||
  process.env.CI === "true" ||
  process.env.CI === "1"
) {
  console.log("[postbuild] Skipping Vercel deploy (remote/CI build)");
  process.exit(0);
}

console.log("[postbuild] Deploying to Vercel production…");

const result = spawnSync("npx", ["vercel", "--prod", "--yes"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
