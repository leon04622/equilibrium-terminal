import type { HlExchangeResponse } from "@/types/exchange";

export class ExchangeRejectError extends Error {
  readonly hint: string | null;
  readonly raw: unknown;

  constructor(message: string, options?: { hint?: string | null; raw?: unknown }) {
    super(message);
    this.name = "ExchangeRejectError";
    this.hint = options?.hint ?? null;
    this.raw = options?.raw;
  }
}

const ERROR_HINTS: Array<{ test: RegExp; message: string; hint: string }> = [
  {
    test: /builder fee/i,
    message: "Builder fee not approved on Hyperliquid",
    hint: "Approve the builder fee when prompted on your first live perp trade.",
  },
  {
    test: /api wallet|agent|does not exist/i,
    message: "Trading agent is not approved or has expired",
    hint: "Re-enable 1-Click Trading (approve agent) in the trade ticket.",
  },
  {
    test: /insufficient margin|not enough margin/i,
    message: "Insufficient margin for this order",
    hint: "Reduce size, lower leverage, or deposit more collateral on Hyperliquid.",
  },
  {
    test: /minimum value/i,
    message: "Order below Hyperliquid minimum notional",
    hint: "Increase size so the order value meets the exchange minimum (typically $10).",
  },
  {
    test: /reduce only.*increase/i,
    message: "Reduce-only order would increase position",
    hint: "Check position side and size — closes must match your open position.",
  },
  {
    test: /tick size|divisible/i,
    message: "Price or size does not match Hyperliquid tick rules",
    hint: "Refresh the book and resubmit — price may have moved.",
  },
  {
    test: /invalid nonce|nonce already used/i,
    message: "Order nonce conflict — retry in a moment",
    hint: "Wait one second and submit again. If it persists, reconnect 1CT.",
  },
  {
    test: /signature recovery|invalid signature/i,
    message: "Order signature rejected by Hyperliquid",
    hint: "Re-enable 1-Click Trading to refresh the agent session.",
  },
  {
    test: /deposit before/i,
    message: "Hyperliquid account has no collateral",
    hint: "Deposit USDC on Hyperliquid before placing live orders.",
  },
  {
    test: /rate limit|too many requests/i,
    message: "Hyperliquid rate limit — wait and retry",
    hint: "Pause a few seconds before submitting another order.",
  },
];

function rawErrorText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
    try {
      return JSON.stringify(raw);
    } catch {
      return "Unknown exchange error";
    }
  }
  return "Unknown exchange error";
}

export function humanizeHlError(raw: unknown): { message: string; hint: string | null } {
  const text = rawErrorText(raw);
  for (const rule of ERROR_HINTS) {
    if (rule.test.test(text)) {
      return { message: rule.message, hint: rule.hint };
    }
  }
  return { message: text, hint: null };
}

function extractOrderStatusErrors(response: unknown): string[] {
  if (!response || typeof response !== "object") return [];
  const envelope = response as { type?: string; data?: { statuses?: unknown[] } };
  if (envelope.type !== "order" || !Array.isArray(envelope.data?.statuses)) return [];

  const errors: string[] = [];
  for (const status of envelope.data!.statuses!) {
    if (!status || typeof status !== "object") continue;
    const row = status as Record<string, unknown>;
    if (typeof row.error === "string") errors.push(row.error);
  }
  return errors;
}

export function parseExchangeResponse(res: HlExchangeResponse): {
  ok: boolean;
  message: string;
  hint: string | null;
  fillSummary: string | null;
} {
  if (res.status === "err") {
    const { message, hint } = humanizeHlError(res.response);
    return { ok: false, message, hint, fillSummary: null };
  }

  const orderErrors = extractOrderStatusErrors(res.response);
  if (orderErrors.length > 0) {
    const { message, hint } = humanizeHlError(orderErrors[0]);
    return { ok: false, message, hint, fillSummary: null };
  }

  return {
    ok: true,
    message: "Order accepted",
    hint: null,
    fillSummary: summarizeOrderFill(res.response),
  };
}

export function summarizeOrderFill(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const envelope = response as { type?: string; data?: { statuses?: unknown[] } };
  if (envelope.type !== "order" || !Array.isArray(envelope.data?.statuses)) return null;

  const parts: string[] = [];
  for (const status of envelope.data!.statuses!) {
    if (!status || typeof status !== "object") continue;
    const row = status as Record<string, unknown>;
    const filled = row.filled as { totalSz?: string; avgPx?: string } | undefined;
    if (filled?.totalSz && filled?.avgPx) {
      parts.push(`filled ${filled.totalSz} @ ${filled.avgPx}`);
      continue;
    }
    const resting = row.resting as { oid?: number } | undefined;
    if (resting?.oid != null) {
      parts.push(`resting oid ${resting.oid}`);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function assertExchangeOk(res: HlExchangeResponse): string | null {
  const parsed = parseExchangeResponse(res);
  if (!parsed.ok) {
    throw new ExchangeRejectError(parsed.message, { hint: parsed.hint, raw: res.response });
  }
  return parsed.fillSummary;
}
