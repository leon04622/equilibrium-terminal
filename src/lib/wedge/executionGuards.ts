import type { ConnectionStatus } from "@/types/terminal-schema";

const STALE_BOOK_MS = 12_000;

export interface ExecutionGuardInput {
  connectionStatus: ConnectionStatus;
  lastMessageAt: number | null;
  markPx: number | null | undefined;
  bookUpdatedAt?: number | null;
}

export interface ExecutionGuardResult {
  blocked: boolean;
  reason: string | null;
}

export function evaluateExecutionGuards(
  input: ExecutionGuardInput,
): ExecutionGuardResult {
  if (input.connectionStatus === "disconnected") {
    return { blocked: true, reason: "Market stream offline — reconnect before submitting" };
  }
  if (input.connectionStatus === "reconnecting" || input.connectionStatus === "connecting") {
    return { blocked: true, reason: "Market stream reconnecting — wait for LIVE status" };
  }
  if (input.markPx == null || input.markPx <= 0) {
    return { blocked: true, reason: "Mark price unavailable — refresh book feed" };
  }
  if (input.lastMessageAt != null && Date.now() - input.lastMessageAt > STALE_BOOK_MS) {
    return { blocked: true, reason: "Stale market feed — verify connection before submit" };
  }
  if (
    input.bookUpdatedAt != null &&
    Date.now() - input.bookUpdatedAt > STALE_BOOK_MS
  ) {
    return { blocked: true, reason: "Order book stale — wait for fresh L2" };
  }
  return { blocked: false, reason: null };
}
