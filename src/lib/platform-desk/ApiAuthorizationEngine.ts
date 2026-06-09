import type { ApiKeyScope } from "@/types/platform-extensibility";

const KEY_STORAGE = "eq-platform-api-keys-v1";

interface StoredKey extends ApiKeyScope {
  createdAt: number;
}

function loadKeys(): StoredKey[] {
  if (typeof window === "undefined") return defaultKeys();
  try {
    const raw = localStorage.getItem(KEY_STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredKey[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return defaultKeys();
}

function defaultKeys(): StoredKey[] {
  const now = Date.now();
  return [
    {
      id: "key-desk-read",
      label: "Desk read-only",
      scopes: ["market:read", "intel:read", "research:read"],
      rateLimitPerMin: 120,
      quotaDaily: 50_000,
      usageToday: 1240,
      lastUsedAt: now - 60_000,
      createdAt: now,
    },
    {
      id: "key-quant-stream",
      label: "Quant streaming",
      scopes: ["ingest:stream", "derivatives:read", "memory:replay"],
      rateLimitPerMin: 300,
      quotaDaily: 200_000,
      usageToday: 8420,
      lastUsedAt: now - 12_000,
      createdAt: now,
    },
    {
      id: "key-enterprise",
      label: "Enterprise sync",
      scopes: ["enterprise:sync", "portfolio:read", "webhook:write"],
      rateLimitPerMin: 60,
      quotaDaily: 10_000,
      usageToday: 420,
      lastUsedAt: now - 3_600_000,
      createdAt: now,
    },
  ];
}

export class ApiAuthorizationEngine {
  static keys(): ApiKeyScope[] {
    return loadKeys().map(({ createdAt: _c, ...k }) => k);
  }

  static rotateUsage(keyId: string): void {
    if (typeof window === "undefined") return;
    const keys = loadKeys();
    const idx = keys.findIndex((k) => k.id === keyId);
    if (idx < 0) return;
    keys[idx] = {
      ...keys[idx],
      usageToday: keys[idx].usageToday + 1,
      lastUsedAt: Date.now(),
    };
    localStorage.setItem(KEY_STORAGE, JSON.stringify(keys));
  }
}
