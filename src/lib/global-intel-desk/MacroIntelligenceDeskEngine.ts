import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { MacroCalendarRow, MacroIndicatorRow } from "@/types/global-intelligence";

export class MacroIntelligenceDeskEngine {
  static indicators(): MacroIndicatorRow[] {
    return useMarketAtmosphereStore.getState().macro.map((m) => ({
      symbol: m.symbol,
      label: m.label,
      last: m.last,
      changePct: m.changePct,
    }));
  }

  static calendar(): MacroCalendarRow[] {
    return useMarketAtmosphereStore.getState().calendar.map((c) => ({
      id: c.id,
      title: c.title,
      region: c.region,
      impact: c.impact,
      scheduledAt: c.scheduledAt,
    }));
  }

  static regimeLabel(): string {
    return useMarketAtmosphereStore.getState().regime.regime;
  }
}
