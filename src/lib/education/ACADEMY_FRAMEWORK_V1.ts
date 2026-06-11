/**
 * ACADEMY FRAMEWORK V1 — STABILITY FREEZE
 *
 * Foundation for all future learning modules. Do not break these contracts
 * without bumping the framework version.
 *
 * Pipeline: scenes → simulator → live bridge → certification → hub progress
 *
 * Shared infrastructure:
 * - LessonNarrator (single speech queue)
 * - useLessonSceneDriver (simulator pacing + voice sync)
 * - usePlaygroundLoop (animation intervals with cleanup)
 * - academyPerformance (dev diagnostics)
 * - warmAcademyAssets (hub preload)
 * - AcademySessionGuard (global speech cleanup)
 */

export const ACADEMY_FRAMEWORK_VERSION = "v1" as const;

export const ACADEMY_STORAGE_KEYS = {
  voicePref: "eq-lesson-voice-on-v1",
  progressPrefix: "eq-",
} as const;

/** Minimum hold after narration ends — visuals never outrun voice. */
export const ACADEMY_MIN_POST_NARRATION_MS = 600;

/** Default narrator rate for beginner simulators. */
export const ACADEMY_SIMULATOR_VOICE_RATE = 0.98;

/** Default narrator rate for live bridge coach lines. */
export const ACADEMY_BRIDGE_VOICE_RATE = 1.0;

export const LIVE_ACADEMY_LESSON_IDS = [
  "market-mechanics",
  "order-book",
  "funding",
  "trade-types",
  "liquidations",
  "risk-management",
  "slippage",
  "execution",
  "portfolio-risk",
  "daily-operations",
  "operator-journal",
  "live-desk",
] as const;

export type LiveAcademyLessonId = (typeof LIVE_ACADEMY_LESSON_IDS)[number];
