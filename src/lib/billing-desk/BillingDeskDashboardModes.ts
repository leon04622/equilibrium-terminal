import type { BillingDeskDashboardMode } from "@/types/billing-commercial";

export const BILLING_DESK_DASHBOARD_MODES: BillingDeskDashboardMode[] = [
  {
    id: "subscription_ops",
    label: "Subscription ops",
    description: "Plans, invoices, payment providers, reliability.",
    panels: ["billingdesk", "commercial", "opscommand"],
  },
  {
    id: "entitlement_admin",
    label: "Entitlement admin",
    description: "Module gating, seats, workspace permissions.",
    panels: ["billingdesk", "commercial", "enterpriseops"],
  },
  {
    id: "enterprise_licensing",
    label: "Enterprise licensing",
    description: "Contracts, dedicated infra, negotiated pricing.",
    panels: ["billingdesk", "enterpriseops", "globalstrategy"],
  },
  {
    id: "usage_metering",
    label: "Usage metering",
    description: "API, streams, webhooks, quotas.",
    panels: ["billingdesk", "platformdesk", "commercial"],
  },
  {
    id: "billing_support",
    label: "Billing support",
    description: "Customer entitlement diagnostics.",
    panels: ["billingdesk", "commercial", "opscommand"],
  },
];
