import { TRUST_SIGNAL } from "@/lib/theme/institutional";
import { FULL_WORKSPACE_LABEL, WEDGE_PRODUCT_LABEL } from "@/lib/wedge/WedgeManifest";
import { useHardeningStore } from "@/store/useHardeningStore";
import type { BrandIdentityRow } from "@/types/product-maturity";

export class InstitutionalBrandEngine {
  static identity(): BrandIdentityRow[] {
    const launch = useHardeningStore.getState().snapshot?.launchReadinessScore ?? 0;

    return [
      { id: "brand-wedge", element: "product_wedge", tone: WEDGE_PRODUCT_LABEL },
      { id: "brand-full", element: "institutional_os", tone: FULL_WORKSPACE_LABEL },
      { id: "brand-trust", element: "trust_signal", tone: TRUST_SIGNAL.stable },
      {
        id: "brand-launch",
        element: "readiness",
        tone: launch >= 80 ? "enterprise_ready" : "hardening",
      },
      {
        id: "brand-voice",
        element: "operational_tone",
        tone: "authoritative · calm · no crypto hype",
      },
    ];
  }
}
