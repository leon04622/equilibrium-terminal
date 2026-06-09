import { AuditLogEngine } from "@/lib/security/AuditLogEngine";

const SUBSCRIPTION_TTL_MS = 86_400_000;

interface BoundSubscription {
  coin: string;
  sessionId: string | null;
  wallet: string | null;
  boundAt: number;
}

/**
 * Client-side WS subscription binding — validates reconnect against session context.
 */
export class WebSocketSecurityGate {
  private static bound: BoundSubscription | null = null;
  private static reconnectCount = 0;

  static bindSubscription(coin: string, sessionId: string | null, wallet: string | null): void {
    WebSocketSecurityGate.bound = {
      coin: coin.toUpperCase(),
      sessionId,
      wallet: wallet?.toLowerCase() ?? null,
      boundAt: Date.now(),
    };
    AuditLogEngine.logCategory(
      "websocket",
      "subscribe_bind",
      "ok",
      `${coin} · session ${sessionId ?? "anon"}`,
    );
  }

  static validateReconnect(
    coin: string,
    sessionId: string | null,
    wallet: string | null,
  ): { allowed: boolean; reason: string } {
    WebSocketSecurityGate.reconnectCount += 1;
    const prev = WebSocketSecurityGate.bound;

    if (!prev) {
      WebSocketSecurityGate.bindSubscription(coin, sessionId, wallet);
      return { allowed: true, reason: "initial_bind" };
    }

    if (Date.now() - prev.boundAt > SUBSCRIPTION_TTL_MS) {
      WebSocketSecurityGate.bindSubscription(coin, sessionId, wallet);
      return { allowed: true, reason: "subscription_ttl_refresh" };
    }

    if (prev.coin !== coin.toUpperCase()) {
      WebSocketSecurityGate.bindSubscription(coin, sessionId, wallet);
      return { allowed: true, reason: "asset_switch" };
    }

    if (prev.wallet && wallet && prev.wallet !== wallet.toLowerCase()) {
      AuditLogEngine.logCategory(
        "websocket",
        "reconnect_denied",
        "denied",
        "wallet mismatch on reconnect",
      );
      return { allowed: false, reason: "wallet_mismatch_on_reconnect" };
    }

    if (WebSocketSecurityGate.reconnectCount > 40) {
      AuditLogEngine.logCategory(
        "websocket",
        "reconnect_abuse",
        "denied",
        `excessive reconnects (${WebSocketSecurityGate.reconnectCount})`,
      );
      return { allowed: false, reason: "reconnect_abuse" };
    }

    return { allowed: true, reason: "ok" };
  }

  static isSessionBound(): boolean {
    return WebSocketSecurityGate.bound !== null;
  }

  static reset(): void {
    WebSocketSecurityGate.bound = null;
    WebSocketSecurityGate.reconnectCount = 0;
  }
}

export const webSocketSecurityGate = WebSocketSecurityGate;
