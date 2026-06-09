import { AccessGovernanceEngine } from "@/lib/billing-desk/AccessGovernanceEngine";
import { ApiUsageMeteringEngine } from "@/lib/billing-desk/ApiUsageMeteringEngine";
import { BILLING_DESK_DASHBOARD_MODES } from "@/lib/billing-desk/BillingDeskDashboardModes";
import { BillingDeskTelemetry } from "@/lib/billing-desk/BillingDeskTelemetry";
import { BillingOperationsEngine } from "@/lib/billing-desk/BillingOperationsEngine";
import { BillingReliabilityEngine } from "@/lib/billing-desk/BillingReliabilityEngine";
import { CommercialAnalyticsDeskEngine } from "@/lib/billing-desk/CommercialAnalyticsDeskEngine";
import { CommercialBriefEngine } from "@/lib/billing-desk/CommercialBriefEngine";
import { EntitlementEngineDesk } from "@/lib/billing-desk/EntitlementEngineDesk";
import { EnterpriseLicensingEngine } from "@/lib/billing-desk/EnterpriseLicensingEngine";
import { OrgSeatManagementEngine } from "@/lib/billing-desk/OrgSeatManagementEngine";
import { PaymentInfrastructureEngine } from "@/lib/billing-desk/PaymentInfrastructureEngine";
import { SubscriptionArchitectureEngine } from "@/lib/billing-desk/SubscriptionArchitectureEngine";
import type { BillingDeskModeId, BillingDeskSnapshot } from "@/types/billing-commercial";

const MODE_STORAGE = "eq-billing-desk-mode-v1";

function readMode(): BillingDeskModeId {
  if (typeof window === "undefined") return "subscription_ops";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && BILLING_DESK_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as BillingDeskModeId;
    }
  } catch {
    /* ignore */
  }
  return "subscription_ops";
}

export class BillingDeskOrchestrator {
  static snapshot(): BillingDeskSnapshot {
    BillingDeskTelemetry.begin();
    const telemetry = BillingDeskTelemetry.snapshot();

    return {
      plans: SubscriptionArchitectureEngine.plans(),
      entitlements: EntitlementEngineDesk.modules(),
      orgSeats: OrgSeatManagementEngine.organizations(),
      apiMeters: ApiUsageMeteringEngine.meters(),
      invoices: BillingOperationsEngine.invoices(),
      paymentProviders: PaymentInfrastructureEngine.providers(),
      licenses: EnterpriseLicensingEngine.licenses(),
      auditLog: AccessGovernanceEngine.auditLog(),
      commercialMetrics: CommercialAnalyticsDeskEngine.metrics(),
      reliability: BillingReliabilityEngine.rows(),
      commercialBrief: CommercialBriefEngine.brief(),
      dashboardModes: BILLING_DESK_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      commercialScore: telemetry.commercialScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: BillingDeskModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
