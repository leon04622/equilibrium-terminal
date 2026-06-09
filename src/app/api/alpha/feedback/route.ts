import { NextResponse } from "next/server";
import { FeedbackIterationEngine } from "@/lib/alpha/FeedbackIterationEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "alpha_feedback", 60, 60_000);
  if (limited) return limited;

  return NextResponse.json({
    painPoints: FeedbackIterationEngine.painPoints(),
    iterationFocus: FeedbackIterationEngine.iterationFocus(),
  });
}

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "alpha_feedback_write", 30, 60_000);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      category?: "friction" | "execution" | "intel" | "workspace" | "infra";
      summary?: string;
      priority?: "p0" | "p1" | "p2";
    };
    if (!body.summary) {
      return NextResponse.json({ error: "summary_required" }, { status: 400 });
    }
    FeedbackIterationEngine.logPainPoint(
      body.category ?? "friction",
      body.summary,
      body.priority ?? "p2",
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "feedback_failed" }, { status: 500 });
  }
}
