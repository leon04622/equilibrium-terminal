import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import type { MarketMemorySnapshot } from "@/types/market-memory";
import { useMarketMemoryStore } from "@/store/useMarketMemoryStore";
import { useTerminalStore } from "@/store/terminalStore";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface MMCoachContext {
  snapshot: MarketMemorySnapshot;
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
  region: "archive" | "regime" | "analogs" | "liquidity" | "narrative";
  note: string;
}

function coachState(ctx: MMCoachContext): CoachState {
  const vol = ctx.snapshot.currentRegime.volatility;
  const liq = ctx.snapshot.currentRegime.liquidity;
  if (vol === "stress" || liq === "crisis") return "danger";
  if (vol === "expansion" || liq === "thin") return "warn";
  if (vol === "normal" && liq === "balanced") return "good";
  return "neutral";
}

function liveAsset(): string {
  if (typeof window === "undefined") return "BTC";
  return useTerminalStore.getState().selectedCoin || "BTC";
}

export const MarketMemoryCoach = {
  /** Prefer the live desk snapshot — avoid rebuilding orchestrator state on every render. */
  contextLive(): MMCoachContext {
    const asset = liveAsset();
    const cached = useMarketMemoryStore.getState().snapshot;
    if (cached?.asset === asset) {
      return { snapshot: cached };
    }
    return { snapshot: MarketMemoryOrchestrator.snapshot(asset) };
  },

  todayReadout(ctx: MMCoachContext): string {
    const { snapshot } = ctx;
    const topAnalog = snapshot.analogs[0];
    const analogNote = topAnalog
      ? ` Top analog: ${topAnalog.similarityPct}% match to ${topAnalog.label}.`
      : "";
    return `Market Memory loaded for ${snapshot.asset}. Regime ${snapshot.currentRegime.label} with ${snapshot.telemetry.archiveSize} archived events.${analogNote}`;
  },

  archiveAdvice(ctx: MMCoachContext): string {
    const recent = ctx.snapshot.archive.slice(0, 2).map((e) => e.headline).join(". ");
    return recent
      ? `Recent archive: ${recent}. Start here when you need what happened before today.`
      : "Archive building as session events accumulate — check back after volatility or liquidity shifts.";
  },

  regimeAdvice(ctx: MMCoachContext): string {
    const r = ctx.snapshot.currentRegime;
    return `Current regime: ${r.label}. Volatility ${r.volatility}, liquidity ${r.liquidity}, macro ${r.macro}. Compare this label with prior epochs in history.`;
  },

  analogAdvice(ctx: MMCoachContext): string {
    const a = ctx.snapshot.analogs[0];
    if (!a) return "No strong analog match yet — watch as conditions develop.";
    return `Current conditions resemble ${a.label} (${a.similarityPct}% similarity, ${a.analogDate}). ${a.summary}`;
  },

  liquidityAdvice(ctx: MMCoachContext): string {
    const latest = ctx.snapshot.liquidityHistory.at(-1);
    if (!latest) return "Liquidity history loading — thin conditions raise execution cost.";
    return `Liquidity depth score ${latest.depthScore}, fragmentation ${latest.fragmentation}. Historical liquidity context informs size and order type.`;
  },

  narrativeAdvice(ctx: MMCoachContext): string {
    const n = ctx.snapshot.narrativeEvolution[0];
    if (!n) return "Narrative timeline building — sector rotation often precedes volatility shifts.";
    return `Narrative phase ${n.phase} in ${n.sector} with acceleration ${n.acceleration}. Prior narrative eras are archived for comparison.`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Read Daily Briefing", region: "archive", note: "What matters today" },
      { order: 2, label: "Check Market State", region: "regime", note: "Current classification" },
      { order: 3, label: "Open Memory Archive", region: "archive", note: "Historical entries" },
      { order: 4, label: "Scan analog matches", region: "analogs", note: "Similar prior conditions" },
      { order: 5, label: "Build plan", region: "narrative", note: "Context-informed execution" },
    ];
  },

  alertLine(ctx: MMCoachContext): string {
    const top = ctx.snapshot.analogs[0];
    const vol = ctx.snapshot.currentRegime.volatility;
    if (top && top.similarityPct >= 70) {
      return `Current conditions resemble a prior ${top.category} episode — review archive before pressing size.`;
    }
    if (vol === "expansion") return "Volatility expansion in memory — historical liquidity conditions may differ from calm sessions.";
    if (vol === "stress") return "Stress regime archived — previous stress events produced different behavior; use context, not assumption.";
    if (ctx.snapshot.alerts.length > 0) return ctx.snapshot.alerts[0]!.headline;
    return "Historical context available — check archive when conditions shift.";
  },

  operatorCoach(ctx: MMCoachContext): CoachCard {
    return {
      state: coachState(ctx),
      liveNow: this.todayReadout(ctx),
      lookHere: "MARKET MEMORY — archive · regime · analogs · liquidity · narrative.",
      whyItMatters: "The archive answers what happened before and why it might matter today — before you hunt for trades.",
      whatToWatch: "When analog similarity rises or regime shifts — your preparation must reference history.",
      alertLine: this.alertLine(ctx),
    };
  },
};
