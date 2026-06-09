import { useWedgeStore } from "@/store/useWedgeStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { FeatureFlagRow } from "@/types/ops-command";

const FLAG_STORAGE = "eq-ops-command-flags-v1";

function loadOverrides(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FLAG_STORAGE);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    /* ignore */
  }
  return {};
}

export class FeatureFlagReleaseEngine {
  static flags(): FeatureFlagRow[] {
    const overrides = loadOverrides();
    const deskFocus = useWedgeStore.getState().deskFocusMode;
    const tier = useProductionConfigStore.getState().session?.tier ?? "pro";

    return [
      {
        id: "flag-wedge-desk",
        label: "HL execution desk (wedge)",
        enabled: overrides["flag-wedge-desk"] ?? deskFocus,
        rolloutPct: 100,
        scope: "global",
      },
      {
        id: "flag-advanced-panels",
        label: "Advanced museum panels",
        enabled: overrides["flag-advanced-panels"] ?? !deskFocus,
        rolloutPct: 100,
        scope: "global",
      },
      {
        id: "flag-canary",
        label: "Canary release channel",
        enabled: overrides["flag-canary"] ?? false,
        rolloutPct: 5,
        scope: "beta",
      },
      {
        id: "flag-enterprise-ops",
        label: "Enterprise operations",
        enabled: overrides["flag-enterprise-ops"] ?? tier === "enterprise",
        rolloutPct: tier === "enterprise" ? 100 : 0,
        scope: "org",
      },
      {
        id: "flag-mobile-companion",
        label: "Mobile companion",
        enabled: overrides["flag-mobile-companion"] ?? true,
        rolloutPct: 25,
        scope: "beta",
      },
    ];
  }

  static toggleFlag(id: string): void {
    if (typeof window === "undefined") return;
    const flags = FeatureFlagReleaseEngine.flags();
    const current = flags.find((f) => f.id === id);
    if (!current) return;
    const overrides = loadOverrides();
    overrides[id] = !current.enabled;
    localStorage.setItem(FLAG_STORAGE, JSON.stringify(overrides));
  }
}
