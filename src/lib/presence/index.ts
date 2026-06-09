export { tacticalOverlayRenderer, TacticalOverlayRenderer } from "./TacticalOverlayRenderer";
export type { OverlayDrawContext, OverlayViewport } from "./TacticalOverlayRenderer";
export {
  buildOverlayFrame,
  computeStressGauge,
  inferRegime,
} from "./AtmosphereEngine";
export type { AtmosphereInputs } from "./AtmosphereEngine";
export { dominantMacroFromTape, simulateMacroTick } from "./MacroFeedSimulator";
