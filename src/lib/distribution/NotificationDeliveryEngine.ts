import type {
  DeliveryChannel,
  DeliveryChannelStatus,
  DistributionChannelPrefs,
  NewswireItem,
} from "@/types/information-distribution";

const PREFS_KEY = "eq-distribution-channels-v1";
const DELIVERY_LOG_KEY = "eq-distribution-delivery-log-v1";
const MAX_LOG = 48;

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

function appendLog(entry: { channel: DeliveryChannel; headline: string; at: number }): void {
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

/**
 * Cross-channel alert delivery — terminal-native first; external channels staged for integration.
 */
export class NotificationDeliveryEngine {
  static loadPrefs(): DistributionChannelPrefs {
    return loadPrefs();
  }

  static savePrefs(prefs: DistributionChannelPrefs): void {
    savePrefs(prefs);
  }

  static channelStatus(pendingCount: number): DeliveryChannelStatus[] {
    const prefs = loadPrefs();
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
        status: prefs.webhookUrl ? "configured" : prefs.webhook ? "error" : "disabled",
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

  static async dispatchCritical(item: NewswireItem): Promise<void> {
    const prefs = loadPrefs();
    if (!NotificationDeliveryEngine.shouldDeliver(item.severity, prefs)) return;

    appendLog({ channel: "terminal", headline: item.headline, at: Date.now() });

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
        appendLog({ channel: "desktop", headline: item.headline, at: Date.now() });
      }
    }

    if (prefs.webhook && prefs.webhookUrl.startsWith("http")) {
      void fetch("/api/distribution/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: prefs.webhookUrl,
          event: {
            id: item.id,
            headline: item.headline,
            detail: item.detail,
            coin: item.coin,
            severity: item.severity,
            category: item.category,
            timestamp: item.timestamp,
          },
        }),
      }).catch(() => undefined);
      appendLog({ channel: "webhook", headline: item.headline, at: Date.now() });
    }
  }
}
