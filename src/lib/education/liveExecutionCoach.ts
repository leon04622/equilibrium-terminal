import type { NormalizedOrderBook } from "@/types/terminal-schema";
import type { SlippageMetric } from "@/types/execution-intelligence";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface ExecContext {
  book: NormalizedOrderBook | null;
  slippage: SlippageMetric | null;
  regime: string;
  stressScore: number;
  velocityRatio: number;
  execConfidence: number;
}

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface PreExecItem {
  id: string;
  label: string;
  note: string;
}

function execState(ctx: ExecContext): CoachState {
  const tier = ctx.slippage?.riskTier;
  if (tier === "critical" || tier === "high") return "danger";
  if (tier === "elevated" || ctx.stressScore > 65 || ctx.execConfidence < 45) return "warn";
  if (ctx.slippage && (ctx.book?.spreadBps ?? ctx.slippage.spreadBps) > 12) return "warn";
  return "good";
}

export const LiveExecutionCoach = {
  context(
    book: NormalizedOrderBook | null,
    slippage: SlippageMetric | null,
    regime: string,
    stressScore: number,
    velocityRatio: number,
    execConfidence: number,
  ): ExecContext {
    return { book, slippage, regime, stressScore, velocityRatio, execConfidence };
  },

  todayReadout(ctx: ExecContext): string {
    const spread = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps;
    return `Regime ${ctx.regime.toUpperCase()} · spread ${spread?.toFixed(1) ?? "—"} bps · exec pipe ${ctx.execConfidence}% · stress ${ctx.stressScore.toFixed(0)}. Plan the entry — do not chase.`;
  },

  patienceAdvice(ctx: ExecContext): string {
    if (ctx.stressScore > 70) return "Stress elevated — wait for spread to stabilize before market orders.";
    if ((ctx.book?.spreadBps ?? 99) > 12) return "Spread wide — patience may improve entry quality. Consider a limit.";
    return "Conditions acceptable — still use a plan: size, order type, and level before you click.";
  },

  limitAdvice(): string {
    return "Limit orders trade speed for price control — the professional choice when you can wait.";
  },

  sizeAdvice(ctx: ExecContext): string {
    const tier = ctx.slippage?.riskTier;
    if (tier === "high" || tier === "critical") return "Slippage risk high — reduce size or scale in slowly.";
    return "Match size to liquidity. Large single clicks move price against you.";
  },

  volatilityAdvice(ctx: ExecContext): string {
    if (ctx.velocityRatio > 1.5 || ctx.stressScore > 60) {
      return `Velocity ${ctx.velocityRatio.toFixed(2)}x · stress ${ctx.stressScore.toFixed(0)} — volatile tape. Smaller size, wider patience.`;
    }
    return `Regime ${ctx.regime} — calmer conditions favor tighter execution planning.`;
  },

  alertLine(ctx: ExecContext): string {
    if (ctx.slippage?.riskTier === "critical" || ctx.slippage?.riskTier === "high") {
      return "Execution quality deteriorating — reduce size or wait.";
    }
    if ((ctx.book?.spreadBps ?? 0) > 15) return "Spread widening — patience may improve entry quality.";
    if (ctx.stressScore > 65) return "Volatile conditions — avoid chasing. Plan limit entries.";
    if (ctx.execConfidence < 45) return "Exec pipeline weak — verify book and radar before submitting.";
    return "Liquidity conditions stable — still confirm order type and size.";
  },

  operatorCoach(ctx: ExecContext): CoachCard {
    const state = execState(ctx);
    const alert = LiveExecutionCoach.alertLine(ctx);
    const spread = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps;
    return {
      state,
      liveNow: `Spread ${spread?.toFixed(1) ?? "—"} bps · ${ctx.regime} · pipe ${ctx.execConfidence}% · slip ${ctx.slippage?.riskTier ?? "—"}`,
      lookHere: "Ticket (size, limit/market) · Book (spread, depth) · Radar · Exec strip",
      whyItMatters: "Execution is how efficiently you turn an idea into a position. Poor timing erodes edge before the trade moves.",
      whatToWatch: alert,
      alertLine: alert,
    };
  },

  preExecChecklist(): PreExecItem[] {
    return [
      { id: "liquidity", label: "Liquidity acceptable", note: "Depth can absorb your size without walking price." },
      { id: "spread", label: "Spread acceptable", note: "Wide spread taxes every market entry." },
      { id: "volatility", label: "Volatility acceptable", note: "Fast tape needs smaller size and patience." },
      { id: "size", label: "Position size appropriate", note: "Scale in when unsure · go smaller in thin books." },
      { id: "order-type", label: "Correct order type", note: "Limit for control · market only when speed is worth the cost." },
    ];
  },
};
