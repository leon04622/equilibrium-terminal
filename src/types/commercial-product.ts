/** Phase 39 — commercial packaging, onboarding, entitlements, release readiness. */

import type { SubscriptionTier } from "@/types/production-platform";

export type CommercialProductTier =
  | "professional"
  | "desk"
  | "institutional"
  | "enterprise_infra";

export type ReleaseChannel = "stable" | "beta" | "canary" | "enterprise";

export type OnboardingStepId =
  | "welcome"
  | "workspace_template"
  | "exchange_connect"
  | "start_operator_mode"
  | "start_learning"
  | "keyboard_shortcuts"
  | "omnibar"
  | "intel_feed"
  | "execution_desk"
  | "expand_workspace"
  | "complete";

export interface ProductTierPackage {
  id: CommercialProductTier;
  label: string;
  headline: string;
  subscriptionTier: SubscriptionTier;
  monthlyUsd: number | null;
  seatIncluded: number;
  modules: string[];
  positioning: string;
}

export interface WorkspaceTemplate {
  id: string;
  label: string;
  description: string;
  deskFocus: boolean;
  panelIds: string[];
}

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  detail: string;
  required: boolean;
  completed: boolean;
  completedAt: number | null;
}

export interface SubscriptionSnapshot {
  tier: CommercialProductTier;
  subscriptionTier: SubscriptionTier;
  status: "active" | "trial" | "past_due" | "enterprise_contract";
  seatsUsed: number;
  seatsLicensed: number;
  apiCallsToday: number;
  apiLimitDaily: number;
  billingCycleEnd: number | null;
}

export interface UsageMeterRow {
  metric: string;
  used: number;
  limit: number;
  unit: string;
}

export interface ReleaseSnapshot {
  channel: ReleaseChannel;
  version: string;
  buildId: string;
  rolloutPct: number;
  canaryEnabled: boolean;
  changelogUrl: string;
  lastRollbackAt: number | null;
}

export interface ProductAnalyticsSnapshot {
  onboardingCompletionPct: number;
  workspaceDepthScore: number;
  featureAdoptionScore: number;
  retentionSignal: "strong" | "moderate" | "at_risk";
  sessions7d: number;
  panelsEngaged: number;
}

export interface CustomerSupportTicket {
  id: string;
  subject: string;
  severity: "low" | "medium" | "high";
  status: "open" | "investigating" | "resolved";
  createdAt: number;
}

export interface AdminPlatformRow {
  domain: string;
  status: "operational" | "degraded" | "offline";
  detail: string;
}

export interface CommercialProductSnapshot {
  productTier: CommercialProductTier;
  subscription: SubscriptionSnapshot;
  tiers: ProductTierPackage[];
  onboarding: OnboardingStep[];
  usageMeters: UsageMeterRow[];
  templates: WorkspaceTemplate[];
  release: ReleaseSnapshot;
  analytics: ProductAnalyticsSnapshot;
  supportTickets: CustomerSupportTicket[];
  adminRows: AdminPlatformRow[];
  marketReadinessScore: number;
  trustScore: number;
  updatedAt: number;
}
