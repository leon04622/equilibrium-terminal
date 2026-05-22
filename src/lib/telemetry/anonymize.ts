/** Local-only anonymization — no PII or wallet material crosses boundaries. */

export function hashToken(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function hashCoin(coin: string | undefined | null): string | undefined {
  if (!coin) return undefined;
  return hashToken(`coin:${coin.toUpperCase()}`);
}

export function hashRoute(parts: string[]): string {
  return hashToken(parts.filter(Boolean).join("|"));
}

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return hashToken(crypto.randomUUID());
  }
  return hashToken(`${Date.now()}-${Math.random()}`);
}

export function sanitizeMeta(
  meta: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!meta) return undefined;
  const out: Record<string, string | number | boolean> = {};
  const blocked = new Set([
    "wallet",
    "address",
    "privatekey",
    "signature",
    "size",
    "price",
    "order",
  ]);
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (blocked.has(lower)) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
