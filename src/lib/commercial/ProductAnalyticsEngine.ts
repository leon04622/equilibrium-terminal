import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { ProductAnalyticsSnapshot } from "@/types/commercial-product";

export class ProductAnalyticsEngine {
  static snapshot(): ProductAnalyticsSnapshot {
    const onboardingCompletionPct = OnboardingEngine.completionPct();
    const deskFocus = useWedgeStore.getState().deskFocusMode;
    const workspaceDepthScore = deskFocus ? 62 : 88;
    const featureAdoptionScore = Math.round(
      (onboardingCompletionPct + workspaceDepthScore) / 2,
    );

    let retentionSignal: ProductAnalyticsSnapshot["retentionSignal"] = "moderate";
    if (onboardingCompletionPct >= 80 && !deskFocus) retentionSignal = "strong";
    if (onboardingCompletionPct < 40) retentionSignal = "at_risk";

    return {
      onboardingCompletionPct,
      workspaceDepthScore,
      featureAdoptionScore,
      retentionSignal,
      sessions7d: 5,
      panelsEngaged: deskFocus ? 8 : 14,
    };
  }
}
