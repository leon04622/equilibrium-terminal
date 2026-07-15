import { CryptoEcosystemOrchestrator } from "@/lib/ecosystem/CryptoEcosystemOrchestrator";
import type { CryptoEcosystemSnapshot } from "@/types/crypto-ecosystem";
import { useCryptoEcosystemStore } from "@/store/useCryptoEcosystemStore";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CFOCoachContext {
  snapshot: CryptoEcosystemSnapshot;
}

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface WorkflowStep {
  order: number;
  label: string;
  region: "layers" | "risk" | "execution" | "research" | "automation";
  note: string;
}

function coachState(ctx: CFOCoachContext): CoachState {
  const score = ctx.snapshot.ecosystemScore;
  const readiness = ctx.snapshot.operatingReadiness;
  const critical = ctx.snapshot.riskAlerts.some((a) => a.severity === "critical");
  if (critical || score < 45) return "danger";
  if (readiness < 60 || score < 65) return "warn";
  if (score >= 80 && readiness >= 75) return "good";
  return "neutral";
}

function layerHeadline(ctx: CFOCoachContext, key: string): string {
  return ctx.snapshot.layers.find((l) => l.layer === key)?.headline ?? key;
}

export const CryptoFinancialOsCoach = {
  contextLive(): CFOCoachContext {
    const cached = useCryptoEcosystemStore.getState().snapshot;
    if (cached) return { snapshot: cached };
    return { snapshot: CryptoEcosystemOrchestrator.snapshot() };
  },

  todayReadout(ctx: CFOCoachContext): string {
    const { snapshot } = ctx;
    const ops = snapshot.layers.filter((l) => l.health === "operational").length;
    return `Crypto Financial OS score ${snapshot.ecosystemScore}, readiness ${snapshot.operatingReadiness}. ${ops} of ${snapshot.layers.length} layers operational. AUM ${Math.round(snapshot.totalAumUsd / 1000)}K.`;
  },

  layersAdvice(ctx: CFOCoachContext): string {
    const lines = ctx.snapshot.layers
      .slice(0, 5)
      .map((l) => `${l.label}: ${l.health}`)
      .join(". ");
    return `Platform layers: ${lines}. Start here to see how the terminal is organized.`;
  },

  terminalLayerAdvice(ctx: CFOCoachContext): string {
    return `Terminal layer: ${layerHeadline(ctx, "terminal")}. This is what you interact with directly every session.`;
  },

  intelligenceLayerAdvice(ctx: CFOCoachContext): string {
    return `Intelligence layer: ${layerHeadline(ctx, "intelligence")}. ${ctx.snapshot.researchSuite.length} research items loaded.`;
  },

  executionLayerAdvice(ctx: CFOCoachContext): string {
    const top = ctx.snapshot.executionAnalytics[0];
    const extra = top ? ` Top venue ${top.venue} at ${top.avgSlippageBps.toFixed(1)} bps slippage.` : "";
    return `Execution layer: ${layerHeadline(ctx, "execution")}.${extra}`;
  },

  organizationalLayerAdvice(ctx: CFOCoachContext): string {
    const auto = ctx.snapshot.automations.filter((a) => a.active).length;
    return `Organizational layer: ${layerHeadline(ctx, "organizational")}. ${auto} automations active with human-in-loop controls.`;
  },

  infrastructureLayerAdvice(ctx: CFOCoachContext): string {
    return `Infrastructure layer: ${layerHeadline(ctx, "infrastructure")}. Reliability and ingestion run here — healthy infra keeps every layer trustworthy.`;
  },

  riskAdvice(ctx: CFOCoachContext): string {
    const top = ctx.snapshot.riskAlerts[0];
    if (!top) return "Risk surveillance clear — systems engaged and monitoring.";
    return `Risk alert: ${top.headline}. Severity ${top.severity}. Risk systems engaged.`;
  },

  researchAdvice(ctx: CFOCoachContext): string {
    const item = ctx.snapshot.researchSuite[0];
    if (!item) return "Research suite building — intelligence layer feeds context here.";
    return `Research: ${item.title}. Status ${item.status}. Intelligence layer producing signals.`;
  },

  memoryAdvice(ctx: CFOCoachContext): string {
    const m = ctx.snapshot.marketMemory[0];
    if (!m) return "Market memory graph loading — connects historical context to today's desk.";
    return `Memory node: ${m.title}. Relevance ${m.relevance}. Links OS layers to market history.`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Read layers", region: "layers", note: "See how the OS is organized" },
      { order: 2, label: "Check intelligence", region: "research", note: "Signals and context" },
      { order: 3, label: "Review risk", region: "risk", note: "Risk systems engaged" },
      { order: 4, label: "Execute with discipline", region: "execution", note: "Execution layer active" },
      { order: 5, label: "Review in ops", region: "automation", note: "Organizational workflow" },
    ];
  },

  alertLine(ctx: CFOCoachContext): string {
    const exec = ctx.snapshot.layers.find((l) => l.layer === "execution");
    const intel = ctx.snapshot.layers.find((l) => l.layer === "intelligence");
    if (ctx.snapshot.riskAlerts.some((a) => a.severity === "critical")) {
      return "Risk systems elevated — reduce exposure before adding complexity.";
    }
    if (exec?.health === "degraded") return "Execution layer active but degraded — confirm fills and slippage.";
    if (intel?.health === "operational") return "Intelligence layer producing signals — operational systems healthy.";
    return "All layers reporting — move through context, intelligence, execution, review.";
  },

  operatorCoach(ctx: CFOCoachContext): CoachCard {
    return {
      state: coachState(ctx),
      liveNow: this.todayReadout(ctx),
      lookHere: "CRYPTO FINANCIAL OS — layers · portfolio · risk · exec · research · auto · memory.",
      whyItMatters: "The OS organizes information so you see one connected system — not disconnected tools.",
      whatToWatch: "When a layer health drops or risk alerts spike — your workflow must adapt.",
      alertLine: this.alertLine(ctx),
    };
  },
};
