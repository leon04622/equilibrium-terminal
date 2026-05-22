import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { VolatilityResilienceSnapshot } from "@/types/reliability";

export class HighVolatilityModeEngine {
  static snapshot(): VolatilityResilienceSnapshot {
    const atmosphere = useMarketAtmosphereStore.getState();
    const terminal = useTerminalStore.getState();
    const adaptive = useAdaptiveWorkspaceStore.getState();
    const highVol =
      atmosphere.regime.regime === "liquidation" ||
      atmosphere.stress.score > 75 ||
      atmosphere.stress.velocityRatio > 1.6;

    let triggerReason = "normal conditions";
    if (atmosphere.regime.regime === "liquidation") triggerReason = "liquidation regime";
    else if (atmosphere.stress.score > 75) triggerReason = "elevated stress";
    else if (atmosphere.stress.velocityRatio > 1.6) triggerReason = "velocity spike";

    return {
      highVolMode: highVol,
      triggerReason,
      alertThrottle: highVol || adaptive.cognitiveLoad?.throttleAlerts === true,
      animationSuppression: highVol || adaptive.cognitiveLoad?.suppressFlashes === true,
      fallbackRoutingActive: terminal.connectionStatus !== "connected",
      updatedAt: Date.now(),
    };
  }
}
