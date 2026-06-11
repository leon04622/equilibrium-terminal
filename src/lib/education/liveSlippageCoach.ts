import type { NormalizedOrderBook } from "@/types/terminal-schema";
import type { SlippageMetric } from "@/types/execution-intelligence";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface SlipContext {
  book: NormalizedOrderBook | null;
  slippage: SlippageMetric | null;
}

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface PreSlipItem {
  id: string;
  label: string;
  note: string;
}

function slipState(slip: SlippageMetric | null, book: NormalizedOrderBook | null): CoachState {
  if (!slip) return "neutral";
  if (slip.riskTier === "critical" || slip.riskTier === "high") return "danger";
  if (slip.riskTier === "elevated" || (book?.spreadBps ?? slip.spreadBps) > 12) return "warn";
  return "good";
}

export const LiveSlippageCoach = {
  contextFromStores(book: NormalizedOrderBook | null, slippage: SlippageMetric | null): SlipContext {
    return { book, slippage };
  },

  todayReadout(ctx: SlipContext): string {
    const spread = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps;
    const slip = ctx.slippage?.slippageBps;
    const tier = ctx.slippage?.riskTier;
    if (spread == null && slip == null) return "Open the order book and slippage radar to read execution quality before you enter.";
    return `Spread ${spread?.toFixed(1) ?? "—"} bps · est. slippage ${slip?.toFixed(1) ?? "—"} bps · risk ${tier?.toUpperCase() ?? "—"}. The screen price is not a guarantee.`;
  },

  spreadAdvice(ctx: SlipContext): string {
    const bps = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps;
    if (bps == null) return "Check spread on the order book mid strip — tight spread means cheaper execution.";
    if (bps > 15) return `Spread is ${bps.toFixed(1)} bps — wide. Market orders will pay a premium.`;
    if (bps > 8) return `Spread ${bps.toFixed(1)} bps — acceptable but watch size.`;
    return `Spread ${bps.toFixed(1)} bps — tight. Favorable for smaller market orders.`;
  },

  liquidityAdvice(ctx: SlipContext): string {
    const bids = ctx.book?.bids?.length ?? 0;
    const asks = ctx.book?.asks?.length ?? 0;
    if (!ctx.book) return "Read bid and ask depth on the order book — thin books amplify slippage.";
    if (bids < 5 || asks < 5) return "Book looks thin — large orders will walk price. Reduce size or use limits.";
    return "Depth looks reasonable — still scale size to available liquidity at your level.";
  },

  slipRadarAdvice(ctx: SlipContext): string {
    if (!ctx.slippage) return "Slippage radar estimates execution risk from spread, velocity, and book quality.";
    const s = ctx.slippage;
    if (s.riskTier === "critical" || s.riskTier === "high") {
      return `Slippage risk ${s.riskTier.toUpperCase()} at ${s.slippageBps.toFixed(1)} bps — consider reducing size or waiting.`;
    }
    return `Slippage est. ${s.slippageBps.toFixed(1)} bps · velocity ${s.velocityTicksPerSec.toFixed(1)} t/s — monitor before market orders.`;
  },

  marketOrderAdvice(): string {
    return "Market orders fill fast but sweep liquidity. Use them when speed matters more than price — and size is small.";
  },

  alertLine(ctx: SlipContext): string {
    const tier = ctx.slippage?.riskTier;
    const spread = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps ?? 0;
    if (tier === "critical" || tier === "high") return "Slippage risk elevated — reduce size or use a limit order.";
    if (spread > 15) return "Spread is wide — liquidity is thin. Execution quality may deteriorate.";
    if (tier === "elevated") return "Execution quality may deteriorate — check depth before a large order.";
    return "Conditions acceptable — still verify spread, size, and order type before submit.";
  },

  operatorCoach(ctx: SlipContext): CoachCard {
    const state = slipState(ctx.slippage, ctx.book);
    const alert = LiveSlippageCoach.alertLine(ctx);
    const spread = ctx.book?.spreadBps ?? ctx.slippage?.spreadBps;
    return {
      state,
      liveNow: ctx.slippage
        ? `Slip ${ctx.slippage.slippageBps.toFixed(1)} bps · spread ${spread?.toFixed(1) ?? "—"} bps · ${ctx.slippage.riskTier.toUpperCase()}`
        : spread != null
          ? `Spread ${spread.toFixed(1)} bps · awaiting slip model`
          : "Awaiting market data",
      lookHere: "Order book (spread, depth) · Slippage radar · Trade ticket (size, order type)",
      whyItMatters: "Markets do not guarantee the price on your screen. Poor execution erodes edge before the trade even moves.",
      whatToWatch: alert,
      alertLine: alert,
    };
  },

  preSlipChecklist(): PreSlipItem[] {
    return [
      { id: "liquidity", label: "Liquidity healthy", note: "Enough depth at your level to absorb size." },
      { id: "spread", label: "Spread acceptable", note: "Wide spread = immediate execution tax." },
      { id: "volatility", label: "Volatility acceptable", note: "Fast markets widen fills and spreads." },
      { id: "size", label: "Order size reasonable", note: "Large size walks the book — pay more slippage." },
      { id: "order-type", label: "Correct order type", note: "Market = speed. Limit = price control." },
    ];
  },
};
