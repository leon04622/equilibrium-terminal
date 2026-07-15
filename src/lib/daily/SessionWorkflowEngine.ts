import { terminalBus } from "@/store/eventBus";
import { useTerminalStore } from "@/store/terminalStore";
import type { SessionWorkflowPreset } from "@/types/daily-operations";

const PRESETS: Record<
  SessionWorkflowPreset,
  { panels: string[]; coin?: string; prompt?: string }
> = {
  asia_open: {
    panels: ["dailyops", "macro", "surveillance", "chart", "hyperbook"],
  },
  london_open: {
    panels: ["dailyops", "macro", "hyperbook", "intelligence", "ticket"],
  },
  ny_open: {
    panels: ["dailyops", "surveillance", "domladder", "ticket", "chart"],
  },
  weekend_crypto: {
    panels: ["surveillance", "alerts", "chart", "operatorjournal"],
  },
  post_fomc: {
    panels: ["macro", "intelligence", "decision", "slippageradar", "ticket"],
  },
  etf_hours: {
    panels: ["macro", "surveillance", "knowledgegraph", "chart"],
  },
};

export class SessionWorkflowEngine {
  static launch(preset: SessionWorkflowPreset): void {
    const cfg = PRESETS[preset];
    const coin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      "BTC";
    if (cfg.coin) {
      useTerminalStore.getState().selectAssetByCoin(cfg.coin ?? coin, `session-${preset}`);
    }
    cfg.panels.forEach((widgetId, i) => {
      window.setTimeout(() => terminalBus.emit("widget:focus", { widgetId }), i * 140);
    });
    terminalBus.emit("widget:focus", { widgetId: cfg.panels[0] });
  }
}
