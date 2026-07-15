import { AuditLogEngine, createTraceId } from "@/lib/security/AuditLogEngine";
import { pushServerAudit } from "@/lib/security/serverAuditClient";
import type { AuditLogEntry } from "@/types/security-trust";
import type { LiveExecutionEvent } from "@/types/terminal-schema";

export interface LiveExecutionAuditInput {
  action: LiveExecutionEvent["action"];
  mode: LiveExecutionEvent["mode"];
  coin: string;
  side: LiveExecutionEvent["side"];
  size: number;
  builderAttached: boolean;
  wallet: string | null;
  traceId?: string;
}

export function beginLiveExecutionAudit(input: LiveExecutionAuditInput): {
  traceId: string;
  detailPrefix: string;
} {
  const traceId = input.traceId ?? createTraceId();
  const builderTag = input.builderAttached ? "builder=0.01%" : "builder=none";
  const detailPrefix = `${input.mode.toUpperCase()} ${input.side} ${input.size} ${input.coin} | ${builderTag} | trace=${traceId}`;
  return { traceId, detailPrefix };
}

export function logLiveExecutionOutcome(
  input: LiveExecutionAuditInput & {
    outcome: LiveExecutionEvent["outcome"];
    detail: string;
    hint?: string | null;
    traceId: string;
  },
  setLastExecutionEvent: (event: LiveExecutionEvent) => void,
): AuditLogEntry {
  const auditOutcome =
    input.outcome === "ok" ? "ok" : input.outcome === "error" ? "error" : "denied";

  const entry = AuditLogEngine.append({
    category: "execution",
    action: input.action,
    actorWallet: input.wallet,
    sessionId: null,
    resource: input.coin,
    outcome: auditOutcome,
    detail: input.detail,
    traceId: input.traceId,
  });

  setLastExecutionEvent({
    traceId: input.traceId,
    at: Date.now(),
    action: input.action,
    mode: input.mode,
    coin: input.coin,
    side: input.side,
    size: input.size,
    builderAttached: input.builderAttached,
    outcome: input.outcome,
    detail: input.detail,
    hint: input.hint ?? null,
  });

  void pushServerAudit({
    category: "execution",
    action: input.action,
    actorWallet: input.wallet,
    sessionId: null,
    resource: input.coin,
    outcome: auditOutcome,
    detail: input.detail,
    traceId: input.traceId,
  });

  return entry;
}
