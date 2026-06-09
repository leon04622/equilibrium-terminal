import { MarketStateLayer } from "@/lib/daily/MarketStateLayer";
import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketContextStamp } from "@/types/operator-journal";

export class MarketContextStampEngine {
  static stamp(): MarketContextStamp {
    let regime = "neutral";
    let volatilityState = "normal";
    let liquidityState = "adequate";
    let fundingEnvironment = "neutral";
    let riskOnOff = "neutral";
    let label = "BALANCED CONDITIONS";

    try {
      const m = MarketStateLayer.build();
      regime = m.regime;
      volatilityState = m.volatilityState;
      liquidityState = m.liquidityState;
      fundingEnvironment = m.fundingEnvironment;
      riskOnOff = m.riskOnOff;
      label = m.compositeLabel;
    } catch {
      /* market layer not ready */
    }

    let session = "ASIA";
    try {
      session = SessionClockEngine.snapshot().label;
    } catch {
      /* clock not ready */
    }

    const terminal = useTerminalStore.getState();
    const spreadBps = terminal.book?.spreadBps ?? null;
    const coin = (terminal.selectedCoin ?? "BTC").toUpperCase();
    const markPrice = terminal.mids?.mids?.[coin] ?? terminal.book?.mid ?? null;

    return {
      regime,
      volatilityState,
      liquidityState,
      fundingEnvironment,
      riskOnOff,
      spreadBps,
      markPrice,
      session,
      label,
    };
  }
}
