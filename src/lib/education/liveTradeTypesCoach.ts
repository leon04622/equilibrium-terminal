import type { NormalizedOrderBook } from "@/types/terminal-schema";

/**
 * Live trade-ticket coach — contextual order-type guidance from book state.
 */

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
}

export interface PreTradeItem {
  id: string;
  label: string;
  note: string;
  recommend: "market" | "limit" | "stop";
}

export interface TicketContext {
  spreadBps: number | null;
  bidDepth: number;
  askDepth: number;
  mid: number | null;
}

function spreadState(bps: number | null): CoachState {
  if (bps === null) return "neutral";
  if (bps <= 3) return "good";
  if (bps <= 8) return "warn";
  return "danger";
}

export const LiveTradeTypesCoach = {
  contextFromBook(book: NormalizedOrderBook | null): TicketContext {
    const bids = book?.bids ?? [];
    const asks = book?.asks ?? [];
    return {
      spreadBps: book?.spreadBps ?? null,
      bidDepth: bids.slice(0, 5).reduce((s, l) => s + l.size, 0),
      askDepth: asks.slice(0, 5).reduce((s, l) => s + l.size, 0),
      mid: book?.mid ?? null,
    };
  },

  todayReadout(ctx: TicketContext): string {
    if (ctx.mid === null) return "Connect market data, then choose market, limit, or stop on the trade ticket.";
    const spread = ctx.spreadBps !== null ? `${ctx.spreadBps.toFixed(1)} bps` : "unknown";
    return `Mark ${ctx.mid.toLocaleString()} · spread ${spread}. Tight spread + depth favors market entries. Wide spread favors limits.`;
  },

  marketAdvice(ctx: TicketContext): { line: string; state: CoachState } {
    const thin = ctx.askDepth < 1 || ctx.bidDepth < 1;
    const wide = (ctx.spreadBps ?? 0) > 8;
    if (thin || wide) {
      return {
        line: "Market order now risks slippage — liquidity is thin or spread is wide. Consider a limit inside the spread.",
        state: "warn",
      };
    }
    return {
      line: "Market order: fast fill when spread is tight and depth is available. You trade control for speed.",
      state: "good",
    };
  },

  limitAdvice(): string {
    return "Limit order: set your price on the ticket. You control execution cost but the order may not fill.";
  },

  stopAdvice(): string {
    return "Stop order: set a trigger price. Use for stop losses or breakout entries — activates only when price reaches your level.";
  },

  operatorCoach(ctx: TicketContext): CoachCard {
    const state = spreadState(ctx.spreadBps);
    const spread = ctx.spreadBps !== null ? `${ctx.spreadBps.toFixed(1)} bps` : "—";
    return {
      state,
      liveNow: `Spread ${spread} · top-of-book depth bid ${ctx.bidDepth.toFixed(2)} / ask ${ctx.askDepth.toFixed(2)}`,
      lookHere: "Trade ticket — market / limit / stop toggle, then size and price fields.",
      whyItMatters: "Order type determines whether you get speed, price control, or automated protection.",
      whatToWatch: state === "danger" ? "Wide spread — avoid blind market orders." : "Match urgency to order type before you click Buy or Sell.",
    };
  },

  preTradeOrderCheck(): PreTradeItem[] {
    return [
      { id: "instant", label: "Need instant execution?", note: "Urgent entry with acceptable spread → market order.", recommend: "market" },
      { id: "control", label: "Need price control?", note: "Patient entry at a specific level → limit order.", recommend: "limit" },
      { id: "protect", label: "Need downside protection?", note: "Cap loss on an open position → stop order.", recommend: "stop" },
    ];
  },
};
