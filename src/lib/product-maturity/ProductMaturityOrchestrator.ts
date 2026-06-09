import { AccessibilityComfortEngine } from "@/lib/product-maturity/AccessibilityComfortEngine";
import { DesignSystemConsolidationEngine } from "@/lib/product-maturity/DesignSystemConsolidationEngine";
import { ExecutionFlowPolishEngine } from "@/lib/product-maturity/ExecutionFlowPolishEngine";
import { InstitutionalBrandEngine } from "@/lib/product-maturity/InstitutionalBrandEngine";
import { MicroInteractionEngine } from "@/lib/product-maturity/MicroInteractionEngine";
import { OperationalCalmnessEngine } from "@/lib/product-maturity/OperationalCalmnessEngine";
import { PRODUCT_MATURITY_DASHBOARD_MODES } from "@/lib/product-maturity/ProductMaturityDashboardModes";
import { ProductMaturityBriefEngine } from "@/lib/product-maturity/ProductMaturityBriefEngine";
import { ProductMaturityTelemetry } from "@/lib/product-maturity/ProductMaturityTelemetry";
import { TerminalErgonomicsEngine } from "@/lib/product-maturity/TerminalErgonomicsEngine";
import { TerminalImmersionEngine } from "@/lib/product-maturity/TerminalImmersionEngine";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ProductMaturityModeId, ProductMaturitySnapshot } from "@/types/product-maturity";

const MODE_STORAGE = "eq-product-maturity-mode-v1";

function readMode(): ProductMaturityModeId {
  if (typeof window === "undefined") return "design_system";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && PRODUCT_MATURITY_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as ProductMaturityModeId;
    }
  } catch {
    /* ignore */
  }
  return "design_system";
}

export class ProductMaturityOrchestrator {
  static snapshot(): ProductMaturitySnapshot {
    ProductMaturityTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const exp = useTerminalExperienceStore.getState();

    const designTokens = DesignSystemConsolidationEngine.tokens();
    const ergonomics = TerminalErgonomicsEngine.profile();
    const executionPolish = ExecutionFlowPolishEngine.flows(asset);
    const calmness = OperationalCalmnessEngine.signals();
    const immersion = TerminalImmersionEngine.layers();
    const microInteractions = MicroInteractionEngine.surfaces();
    const brandIdentity = InstitutionalBrandEngine.identity();
    const accessibility = AccessibilityComfortEngine.comfort();

    const executionTrusted = executionPolish.some((e) => e.id === "exec-conf" && e.status === "trusted");
    const elevatedCalm = calmness.filter((c) => c.level === "elevated").length;

    const telemetry = ProductMaturityTelemetry.snapshot({
      calmEnabled: exp.calmMode,
      reducedMotion: exp.reducedMotion,
      density: exp.density,
      executionTrusted,
      calmSignals: elevatedCalm,
    });

    const partial = { telemetry, ergonomics, brandIdentity };

    return {
      asset,
      designTokens,
      ergonomics,
      executionPolish,
      calmness,
      immersion,
      microInteractions,
      brandIdentity,
      accessibility,
      maturityBrief: ProductMaturityBriefEngine.brief(partial),
      dashboardModes: PRODUCT_MATURITY_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      polishScore: telemetry.polishScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: ProductMaturityModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
    const store = useTerminalExperienceStore.getState();
    if (id === "calm_operations") {
      store.setCalmMode(true);
      store.setReducedMotion(true);
      useAdaptiveWorkspaceStore.getState().setMode("balanced");
    } else if (id === "execution_polish") {
      useAdaptiveWorkspaceStore.getState().setMode("execution");
    } else if (id === "ergonomic_ops") {
      store.setDensity("comfortable");
      useAdaptiveWorkspaceStore.getState().setMode("balanced");
    } else if (id === "immersion") {
      useAdaptiveWorkspaceStore.getState().setMode("balanced");
    } else {
      useAdaptiveWorkspaceStore.getState().setMode("balanced");
    }
  }
}
