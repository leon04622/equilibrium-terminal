import type {
  DeliveryChannel,
  DeliveryChannelStatus,
  DistributionChannelPrefs,
  NewswireItem,
} from "@/types/information-distribution";
import type { TriggeredAlert } from "@/types/alerts";

const PREFS_KEY = "eq-distribution-channels-v1";
const DELIVERY_LOG_KEY = "eq-distribution-delivery-log-v1";
const WEBHOOK_STATUS_KEY = "eq-webhook-status-v1";
const MAX_LOG = 48;
const MAX_DEDUPE = 512;

export interface WebhookDeliveryStatus {
  at: number;
  ok: boolean;
  message: string;
}

const DEFAULT_PREFS: DistributionChannelPrefs = {
  desktop: true,
  browserPush: false,
  email: false,
  webhook: false,
  telegram: false,
  discord: false,
  webhookUrl: "",
  minSeverity: "watch",
};

const SEVERITY_RANK = { info: 1, watch: 2, critical: 3 };

function loadPrefs(): DistributionChannelPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: DistributionChannelPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota */
  }
}

function appendLog(entry: {
  channel: DeliveryChannel;
  headline: string;
  at: number;
  ok?: boolean;
}): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DELIVERY_LOG_KEY);
    const log: typeof entry[] = raw ? JSON.parse(raw) : [];
    log.unshift(entry);
    localStorage.setItem(DELIVERY_LOG_KEY, JSON.stringify(log.slice(0, MAX_LOG)));
  } catch {
    /* ignore */
  }
}

function lastDelivery(channel: DeliveryChannel): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DELIVERY_LOG_KEY);
    const log: Array<{ channel: DeliveryChannel; at: number }> = raw ? JSON.parse(raw) : [];
    return log.find((e) => e.channel === channel)?.at ?? null;
  } catch {
    return null;
  }
}

function saveWebhookStatus(status: WebhookDeliveryStatus): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEBHOOK_STATUS_KEY, JSON.stringify(status));
  } catch {
    /* ignore */
  }
}

function loadWebhookStatus(): WebhookDeliveryStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WEBHOOK_STATUS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WebhookDeliveryStatus;
  } catch {
    return null;
  }
}

function alertCategory(eventType: string): NewswireItem["category"] {
  if (eventType.includes("LIQUIDATION")) return "liquidation";
  if (eventType.includes("FUNDING")) return "funding";
  if (eventType.includes("SPREAD") || eventType.includes("VOL")) return "volatility";
  if (eventType.includes("WHALE")) return "whale";
  return "operational";
}

function alertToNewswireItem(alert: TriggeredAlert): NewswireItem {
  return {
    id: `alert-${alert.id}`,
    category: alertCategory(alert.event.type),
    headline: alert.title,
    detail: alert.aiExplanation ?? alert.summary,
    coin: alert.coin,
    severity: alert.severity,
    source: "ALERT",
    urgencyScore: alert.severity === "critical" ? 88 : 62,
    impactScore: alert.severity === "critical" ? 82 : 55,
    relevanceScore: 90,
    compositeScore: alert.severity === "critical" ? 85 : 60,
    confidence: 0.92,
    verified: true,
    timestamp: alert.timestamp,
  };
}

/**
 * Cross-channel alert delivery — terminal-native first; webhook + desktop when configured.
 */
export class NotificationDeliveryEngine {
  private static deliveredIds = new Set<string>();

  static loadPrefs(): DistributionChannelPrefs {
    return loadPrefs();
  }

  static savePrefs(prefs: DistributionChannelPrefs): void {
    savePrefs(prefs);
  }

  static getWebhookStatus(): WebhookDeliveryStatus | null {
    return loadWebhookStatus();
  }

  static channelStatus(pendingCount: number): DeliveryChannelStatus[] {
    const prefs = loadPrefs();
    const whStatus = loadWebhookStatus();
    const webhookReady =
      prefs.webhook &&
      prefs.webhookUrl.length > 8 &&
      (whStatus?.ok === true || whStatus === null);
    return [
      {
        channel: "terminal",
        enabled: true,
        label: "Terminal tape",
        lastDeliveryAt: lastDelivery("terminal"),
        pendingCount,
        status: "ready",
      },
      {
        channel: "desktop",
        enabled: prefs.desktop,
        label: "Desktop notifications",
        lastDeliveryAt: lastDelivery("desktop"),
        pendingCount: prefs.desktop ? pendingCount : 0,
        status:
          typeof Notification !== "undefined" && Notification.permission === "granted"
            ? "ready"
            : prefs.desktop
              ? "configured"
              : "disabled",
      },
      {
        channel: "browser_push",
        enabled: prefs.browserPush,
        label: "Browser push",
        lastDeliveryAt: lastDelivery("browser_push"),
        pendingCount: 0,
        status: prefs.browserPush ? "configured" : "disabled",
      },
      {
        channel: "email",
        enabled: prefs.email,
        label: "Email digest",
        lastDeliveryAt: lastDelivery("email"),
        pendingCount: 0,
        status: prefs.email ? "configured" : "disabled",
      },
      {
        channel: "webhook",
        enabled: prefs.webhook && prefs.webhookUrl.length > 8,
        label: "Webhook",
        lastDeliveryAt: lastDelivery("webhook"),
        pendingCount: prefs.webhook ? pendingCount : 0,
        status: !prefs.webhook
          ? "disabled"
          : !prefs.webhookUrl
            ? "error"
            : whStatus?.ok === false
              ? "error"
              : webhookReady
                ? "ready"
                : "configured",
      },
      {
        channel: "telegram",
        enabled: prefs.telegram,
        label: "Telegram",
        lastDeliveryAt: lastDelivery("telegram"),
        pendingCount: 0,
        status: prefs.telegram ? "configured" : "disabled",
      },
      {
        channel: "discord",
        enabled: prefs.discord,
        label: "Discord",
        lastDeliveryAt: lastDelivery("discord"),
        pendingCount: 0,
        status: prefs.discord ? "configured" : "disabled",
      },
    ];
  }

  static shouldDeliver(severity: NewswireItem["severity"], prefs: DistributionChannelPrefs): boolean {
    return SEVERITY_RANK[severity] >= SEVERITY_RANK[prefs.minSeverity];
  }

  static async dispatchAlert(alert: TriggeredAlert): Promise<void> {
    return NotificationDeliveryEngine.dispatchItem(alertToNewswireItem(alert));
  }

  static async dispatchCritical(item: NewswireItem): Promise<void> {
    return NotificationDeliveryEngine.dispatchItem(item);
  }

  static async dispatchItem(item: NewswireItem): Promise<void> {
    const prefs = loadPrefs();
    if (!NotificationDeliveryEngine.shouldDeliver(item.severity, prefs)) return;

    const dedupeKey = item.id;
    if (NotificationDeliveryEngine.deliveredIds.has(dedupeKey)) return;
    if (NotificationDeliveryEngine.deliveredIds.size >= MAX_DEDUPE) {
      NotificationDeliveryEngine.deliveredIds.clear();
    }
    NotificationDeliveryEngine.deliveredIds.add(dedupeKey);

    appendLog({ channel: "terminal", headline: item.headline, at: Date.now(), ok: true });

    if (prefs.desktop && typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification(`EQ · ${item.coin ?? "MARKET"}`, {
          body: item.headline,
          tag: item.id,
          silent: item.severity !== "critical",
        });
        appendLog({ channel: "desktop", headline: item.headline, at: Date.now(), ok: true });
      }
    }

    if (prefs.webhook && prefs.webhookUrl.startsWith("http")) {
      const ok = await NotificationDeliveryEngine.postWebhook(prefs.webhookUrl, item);
      if (ok) {
        appendLog({ channel: "webhook", headline: item.headline, at: Date.now(), ok: true });
      }
    }
  }

  static async sendTestWebhook(): Promise<WebhookDeliveryStatus> {
    const prefs = loadPrefs();
    if (!prefs.webhookUrl.startsWith("http")) {
      const status: WebhookDeliveryStatus = {
        at: Date.now(),
        ok: false,
        message: "Enter a valid webhook URL",
      };
      saveWebhookStatus(status);
      return status;
    }
    const testItem: NewswireItem = {
      id: `eq-webhook-test-${Date.now()}`,
      category: "operational",
      headline: "Equilibrium Terminal · webhook test",
      detail: "Delivery channel verification — safe to ignore.",
      coin: null,
      severity: "info",
      source: "EQ-TEST",
      urgencyScore: 10,
      impactScore: 10,
      relevanceScore: 10,
      compositeScore: 10,
      confidence: 1,
      verified: true,
      timestamp: Date.now(),
    };
    const ok = await NotificationDeliveryEngine.postWebhook(prefs.webhookUrl, testItem);
    const status: WebhookDeliveryStatus = {
      at: Date.now(),
      ok,
      message: ok ? "Test delivered" : "Delivery failed — check URL",
    };
    saveWebhookStatus(status);
    if (ok) {
      appendLog({ channel: "webhook", headline: testItem.headline, at: status.at, ok: true });
    }
    return status;
  }

  private static async postWebhook(url: string, item: NewswireItem): Promise<boolean> {
    try {
      const res = await fetch("/api/distribution/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          event: {
            id: item.id,
            headline: item.headline,
            detail: item.detail,
            coin: item.coin,
            severity: item.severity,
            category: item.category,
            source: item.source,
            timestamp: item.timestamp,
          },
        }),
      });
      const ok = res.ok;
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      saveWebhookStatus({
        at: Date.now(),
        ok,
        message: ok ? "Delivered" : (body.error ?? `HTTP ${res.status}`),
      });
      return ok;
    } catch {
      saveWebhookStatus({ at: Date.now(), ok: false, message: "Network error" });
      return false;
    }
  }
}
