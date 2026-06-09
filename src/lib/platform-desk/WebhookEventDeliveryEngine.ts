import type { WebhookSubscription } from "@/types/platform-extensibility";

export class WebhookEventDeliveryEngine {
  static subscriptions(): WebhookSubscription[] {
    const now = Date.now();
    return [
      {
        id: "wh-critical-alerts",
        eventType: "alert.critical",
        targetUrl: "/api/distribution/webhook",
        status: "active",
        deliveries24h: 42,
        lastDeliveryAt: now - 120_000,
      },
      {
        id: "wh-intel-digest",
        eventType: "intelligence.digest",
        targetUrl: "https://desk.internal/hooks/intel",
        status: "active",
        deliveries24h: 18,
        lastDeliveryAt: now - 3_600_000,
      },
      {
        id: "wh-execution-fill",
        eventType: "execution.fill",
        targetUrl: "https://oms.internal/eq/fills",
        status: "active",
        deliveries24h: 156,
        lastDeliveryAt: now - 45_000,
      },
      {
        id: "wh-regime-shift",
        eventType: "memory.regime_shift",
        targetUrl: "https://research.internal/regime",
        status: "staged",
        deliveries24h: 0,
        lastDeliveryAt: null,
      },
      {
        id: "wh-workflow-trigger",
        eventType: "workflow.session_review",
        targetUrl: "https://ops.internal/triggers/review",
        status: "paused",
        deliveries24h: 2,
        lastDeliveryAt: now - 86_400_000,
      },
    ];
  }
}
