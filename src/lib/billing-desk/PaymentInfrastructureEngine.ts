import type { PaymentProviderRow } from "@/types/billing-commercial";

export class PaymentInfrastructureEngine {
  static providers(): PaymentProviderRow[] {
    return [
      { id: "pay-stripe", provider: "Stripe", status: "staged", capability: "Cards · ACH · subscriptions" },
      { id: "pay-wire", provider: "Wire / institutional", status: "live", capability: "Enterprise invoicing" },
      { id: "pay-tax", provider: "Tax automation", status: "staged", capability: "Multi-currency · VAT" },
      { id: "pay-retry", provider: "Dunning / retry", status: "live", capability: "Failed payment recovery" },
    ];
  }
}
