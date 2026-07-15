import { NextResponse } from "next/server";
import {
  PreTradeRiskLimitsEngine,
  type PreTradeOrderInput,
  type PreTradeRiskContext,
} from "@/lib/institutional/PreTradeRiskLimitsEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";
import { appendAudit } from "@/lib/security/server/auditStore";
import { DEFAULT_PRE_TRADE_LIMITS, type PreTradeRiskLimits } from "@/types/institutional-capabilities";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "security_pre_trade", 60, 60_000);
  if (limited) return limited;

  let body: {
    order?: PreTradeOrderInput;
    limits?: Partial<PreTradeRiskLimits>;
    context?: PreTradeRiskContext;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json", traceId: ctx.traceId }, { status: 400 });
  }

  const order = body.order;
  const riskContext = body.context;

  if (!order?.coin || !order.markPx || !order.size) {
    return NextResponse.json({ error: "order_required", traceId: ctx.traceId }, { status: 400 });
  }

  if (!riskContext?.accountValue) {
    return NextResponse.json({ error: "context_required", traceId: ctx.traceId }, { status: 400 });
  }

  const limits: PreTradeRiskLimits = { ...DEFAULT_PRE_TRADE_LIMITS, ...body.limits };
  const decision = PreTradeRiskLimitsEngine.evaluateFromContext(order, limits, riskContext);
  const auditOutcome = decision.allowed ? "ok" : decision.severity === "block" ? "denied" : "error";

  appendAudit({
    traceId: ctx.traceId,
    category: "system",
    action: "pre_trade_check",
    outcome: auditOutcome,
    actorWallet: null,
    sessionId: null,
    resource: order.coin,
    detail: decision.reasons.join("; ") || "clear",
  });

  return NextResponse.json({
    decision,
    traceId: ctx.traceId,
  });
}
