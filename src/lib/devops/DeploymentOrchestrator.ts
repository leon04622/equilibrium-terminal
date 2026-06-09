import type { ReleaseChannel, ReleaseManifest } from "@/types/devops-operations";
import { resolveDeploymentEnvironment } from "@/config/environments";

const PACKAGE_VERSION = process.env.npm_package_version ?? "0.1.0";

export class DeploymentOrchestrator {
  static currentRelease(channel: ReleaseChannel = "stable"): ReleaseManifest {
    const env = resolveDeploymentEnvironment();
    const buildId =
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ??
      "local-dev";

    return {
      channel,
      version: PACKAGE_VERSION,
      buildId,
      deployedAt: Date.now(),
      previousVersion: process.env.EQ_PREVIOUS_RELEASE ?? null,
      rollbackAvailable: env === "production" || env === "enterprise",
    };
  }

  static cicdStatus(): "pass" | "fail" | "running" | "unknown" {
    const status = process.env.CI ?? process.env.GITHUB_ACTIONS;
    if (!status) return "unknown";
    if (process.env.CI_JOB_STATUS === "failure") return "fail";
    if (process.env.CI_JOB_STATUS === "in_progress") return "running";
    return "pass";
  }

  static cicdLastRun(): string | null {
    return process.env.GITHUB_RUN_ID ? `run-${process.env.GITHUB_RUN_ID}` : null;
  }
}
