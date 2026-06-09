/** Phase 52 — Billing, entitlement & institutional commercial infrastructure. */

import type { CommercialProductTier } from "@/types/commercial-product";

export type BillingDeskModeId =
  | "subscription_ops"
  | "entitlement_admin"
  | "enterprise_licensing"
  | "usage_metering"
  | "billing_support";

export type BillingStatus = "active" | "trial" | "past_due" | "enterprise_contract" | "canceled";

export interface SubscriptionPlanRow {
  id: CommercialProductTier;
  label: string;
  monthlyUsd: number | null;
  seats: number;
  billingCycle: "monthly" | "annual" | "contract";
  trialDays: number;
  status: BillingStatus;
}

export interface EntitlementModuleRow {
  id: string;
  module: string;
  enabled: boolean;
  scope: "workspace" | "api" | "intel" | "enterprise";
}

export interface OrgSeatRow {
  orgId: string;
  orgName: string;
  seatsUsed: number;
  seatsLicensed: number;
  adminEmail: string;
  status: BillingStatus;
}

export interface ApiMeterRow {
  metric: string;
  used: number;
  limit: number;
  unit: string;
  overageRisk: "none" | "watch" | "critical";
}

export interface InvoiceRow {
  id: string;
  orgName: string;
  amountUsd: number;
  status: "paid" | "open" | "failed" | "void";
  dueAt: number;
}

export interface PaymentProviderRow {
  id: string;
  provider: string;
  status: "live" | "staged";
  capability: string;
}

export interface EnterpriseLicenseRow {
  id: string;
  orgName: string;
  contractType: string;
  negotiatedUsd: number | null;
  dedicatedInfra: boolean;
  expiresAt: number | null;
}

export interface EntitlementAuditRow {
  id: string;
  action: string;
  actor: string;
  resource: string;
  timestamp: number;
}

export interface CommercialMetricRow {
  metric: string;
  value: string;
  signal: "strong" | "moderate" | "at_risk";
}

export interface BillingReliabilityRow {
  label: string;
  value: string;
  status: "ok" | "watch" | "critical";
}

export interface BillingDeskDashboardMode {
  id: BillingDeskModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface BillingDeskTelemetrySnapshot {
  activeSubscriptions: number;
  pastDueCount: number;
  apiUtilizationPct: number;
  seatUtilizationPct: number;
  computeLatencyMs: number;
  commercialScore: number;
}

export interface BillingDeskSnapshot {
  plans: SubscriptionPlanRow[];
  entitlements: EntitlementModuleRow[];
  orgSeats: OrgSeatRow[];
  apiMeters: ApiMeterRow[];
  invoices: InvoiceRow[];
  paymentProviders: PaymentProviderRow[];
  licenses: EnterpriseLicenseRow[];
  auditLog: EntitlementAuditRow[];
  commercialMetrics: CommercialMetricRow[];
  reliability: BillingReliabilityRow[];
  commercialBrief: string;
  dashboardModes: BillingDeskDashboardMode[];
  activeMode: BillingDeskModeId;
  telemetry: BillingDeskTelemetrySnapshot;
  commercialScore: number;
  updatedAt: number;
}
