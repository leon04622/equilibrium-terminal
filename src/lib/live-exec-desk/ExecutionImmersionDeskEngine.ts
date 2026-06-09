import type { HotkeyRow } from "@/types/live-execution";

export class ExecutionImmersionDeskEngine {
  static hotkeys(): HotkeyRow[] {
    return [
      { id: "hk-trade", key: "/trade", action: "Focus execution ticket" },
      { id: "hk-chart", key: "/chart", action: "Focus chart" },
      { id: "hk-depth", key: "/depth", action: "DOM ladder" },
      { id: "hk-liq", key: "/liq", action: "Liquidity / slippage radar" },
      { id: "hk-asset", key: "Omni asset", action: "Rapid asset switch" },
      { id: "hk-cancel", key: "Esc · ticket", action: "Cancel / clear draft" },
    ];
  }
}
