import { NextResponse } from "next/server";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";
import type { OnboardingStepId } from "@/types/commercial-product";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "commercial_onboarding", 60, 60_000);
  if (limited) return limited;

  return NextResponse.json({
    steps: OnboardingEngine.steps(),
    completionPct: OnboardingEngine.completionPct(),
    dismissed: OnboardingEngine.isDismissed(),
  });
}

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "commercial_onboarding_write", 30, 60_000);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      action?: "complete" | "dismiss";
      stepId?: OnboardingStepId;
    };

    if (body.action === "dismiss") {
      OnboardingEngine.dismiss();
      return NextResponse.json({ ok: true, dismissed: true });
    }

    if (body.action === "complete" && body.stepId) {
      OnboardingEngine.completeStep(body.stepId);
      return NextResponse.json({
        ok: true,
        completionPct: OnboardingEngine.completionPct(),
      });
    }

    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "onboarding_failed" }, { status: 500 });
  }
}
