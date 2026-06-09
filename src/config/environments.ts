import type { DeploymentEnvironment } from "@/types/devops-operations";

export interface EnvironmentProfile {
  id: DeploymentEnvironment;
  label: string;
  apiBase: string;
  wsUrl: string;
  hlNetwork: "mainnet" | "testnet";
  logLevel: "debug" | "info" | "warn" | "error";
  traceSampleRate: number;
  rateLimitMultiplier: number;
  secretsVault: "local" | "vercel" | "enterprise";
}

const PRODUCTION_API =
  process.env.NEXT_PUBLIC_EQ_API_BASE ?? "https://equilibrium-terminal-three.vercel.app";

export const ENVIRONMENT_PROFILES: Record<DeploymentEnvironment, EnvironmentProfile> = {
  local: {
    id: "local",
    label: "Local",
    apiBase: "http://localhost:3000",
    wsUrl: "wss://api.hyperliquid.xyz/ws",
    hlNetwork: "mainnet",
    logLevel: "debug",
    traceSampleRate: 1,
    rateLimitMultiplier: 10,
    secretsVault: "local",
  },
  staging: {
    id: "staging",
    label: "Staging",
    apiBase: process.env.NEXT_PUBLIC_EQ_STAGING_URL ?? PRODUCTION_API,
    wsUrl: "wss://api.hyperliquid.xyz/ws",
    hlNetwork: "testnet",
    logLevel: "info",
    traceSampleRate: 0.5,
    rateLimitMultiplier: 5,
    secretsVault: "vercel",
  },
  qa: {
    id: "qa",
    label: "QA",
    apiBase: process.env.NEXT_PUBLIC_EQ_QA_URL ?? PRODUCTION_API,
    wsUrl: "wss://api.hyperliquid.xyz/ws",
    hlNetwork: "testnet",
    logLevel: "info",
    traceSampleRate: 0.25,
    rateLimitMultiplier: 3,
    secretsVault: "vercel",
  },
  production: {
    id: "production",
    label: "Production",
    apiBase: PRODUCTION_API,
    wsUrl: "wss://api.hyperliquid.xyz/ws",
    hlNetwork: "mainnet",
    logLevel: "warn",
    traceSampleRate: 0.1,
    rateLimitMultiplier: 1,
    secretsVault: "vercel",
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    apiBase: process.env.NEXT_PUBLIC_EQ_ENTERPRISE_URL ?? PRODUCTION_API,
    wsUrl: "wss://api.hyperliquid.xyz/ws",
    hlNetwork: "mainnet",
    logLevel: "warn",
    traceSampleRate: 0.2,
    rateLimitMultiplier: 2,
    secretsVault: "enterprise",
  },
};

export function resolveDeploymentEnvironment(): DeploymentEnvironment {
  const explicit = process.env.NEXT_PUBLIC_EQ_ENV as DeploymentEnvironment | undefined;
  if (explicit && explicit in ENVIRONMENT_PROFILES) return explicit;

  if (process.env.NODE_ENV === "development") return "local";
  if (process.env.VERCEL_ENV === "preview") return "staging";
  if (process.env.VERCEL_ENV === "production") return "production";
  return "local";
}
