import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import type { CrossDeviceSession } from "@/types/mobile-operational";

const SESSION_KEY = "eq-mobile-sessions-v1";

function loadSessions(): CrossDeviceSession[] {
  if (typeof window === "undefined") return defaultSessions();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as CrossDeviceSession[];
  } catch {
    /* ignore */
  }
  return defaultSessions();
}

function defaultSessions(): CrossDeviceSession[] {
  const now = Date.now();
  return [
    {
      deviceId: "desktop-primary",
      label: "Desktop terminal",
      lastActiveAt: now,
      alertsSynced: 24,
      handoffReady: true,
    },
    {
      deviceId: "ios-companion",
      label: "iOS companion (beta)",
      lastActiveAt: now - 900_000,
      alertsSynced: 18,
      handoffReady: true,
    },
    {
      deviceId: "android-companion",
      label: "Android companion (staged)",
      lastActiveAt: now - 3_600_000,
      alertsSynced: 0,
      handoffReady: false,
    },
  ];
}

export class CrossDeviceContinuityEngine {
  static sessions(): CrossDeviceSession[] {
    const prefs = NotificationDeliveryEngine.loadPrefs();
    const sessions = loadSessions();
    if (prefs.desktop) {
      sessions[0] = { ...sessions[0]!, lastActiveAt: Date.now(), alertsSynced: sessions[0]!.alertsSynced + 1 };
    }
    return sessions;
  }
}
