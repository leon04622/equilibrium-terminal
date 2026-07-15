/**
 * ACADEMY FRAMEWORK V1 — shared narration helpers.
 * Spoken lines are humanized: no UI labels, no duplicate titles, natural pacing.
 */

import {
  armLessonVoice,
  estimateNarrationMs,
  isLessonVoiceArmed,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { combineNarration, humanizeForSpeech } from "@/lib/education/speechHumanize";
import { scrollAcademyBridgeTarget } from "@/lib/education/useAcademyBridgeSpotlight";

export { combineNarration, humanizeForSpeech };

export interface BridgeNarrationStep<T = unknown> {
  id?: string;
  mode: string;
  whyCare?: (ctx: T) => string;
  recognize?: { prompt: string };
  decide?: { prompt: string };
  compare?: { good: { title: string }; bad: { title: string } };
}

/** Build a natural spoken script — never repeats on-screen titles or label prefixes. */
export function buildBridgeNarration<T>(
  step: BridgeNarrationStep<T>,
  coachText: string,
  ctx: T,
  extraParts: string[] = [],
): string {
  if (step.mode === "recognize") {
    const prompt = step.recognize?.prompt ?? coachText;
    return humanizeForSpeech(prompt);
  }

  if (step.mode === "compare") {
    return humanizeForSpeech(coachText || "Which approach matches how a prepared operator works?");
  }

  if (step.mode === "decide" && step.decide?.prompt) {
    const prompt = step.decide.prompt.trim();
    const coach = coachText.trim();
    return humanizeForSpeech(prompt || coach);
  }

  // Coach line only — chapter titles and why-care stay on screen, not in voice.
  if (step.id !== "workflow") {
    return humanizeForSpeech(coachText, ...extraParts.filter(Boolean));
  }
  return humanizeForSpeech(coachText);
}

export interface AcademySpeakConfig {
  voiceOn: boolean;
  supported: boolean;
  rate?: number;
  pitch?: number;
  /** Scroll target into view before speaking (used on click-to-find steps). */
  scrollTarget?: HTMLElement | null;
  scrollSmooth?: boolean;
  onEnd?: () => void;
  onError?: () => void;
}

const DEFAULT_BRIDGE_RATE = 0.9;
const DEFAULT_BRIDGE_PITCH = 0.97;
const RECOGNIZE_SCROLL_SPEAK_DELAY_MS = 520;

/** Speak immediately when voice is armed; prime only on first line of a session. */
export function speakAcademyNarration(
  text: string,
  {
    voiceOn,
    supported,
    rate = DEFAULT_BRIDGE_RATE,
    pitch = DEFAULT_BRIDGE_PITCH,
    scrollTarget,
    scrollSmooth = true,
    onEnd,
    onError,
  }: AcademySpeakConfig,
): void {
  const trimmed = humanizeForSpeech(text);
  if (!trimmed) {
    onEnd?.();
    return;
  }

  const speak = () => {
    if (voiceOn && supported) {
      speakLesson(trimmed, {
        rate,
        pitch,
        onEnd,
        onError: onError ?? onEnd,
      });
    } else if (onEnd) {
      window.setTimeout(onEnd, estimateNarrationMs(trimmed, rate));
    }
  };

  if (!voiceOn || !supported) {
    if (onEnd) window.setTimeout(onEnd, estimateNarrationMs(trimmed, rate));
    return;
  }

  if (!isLessonVoiceArmed()) {
    armLessonVoice();
  }

  if (scrollTarget) {
    scrollAcademyBridgeTarget(scrollTarget, { smooth: scrollSmooth });
    window.setTimeout(speak, RECOGNIZE_SCROLL_SPEAK_DELAY_MS);
    return;
  }

  speak();
}

/** Narration + optional smooth scroll for interactive click steps. */
export function speakAcademyBridgeStep<T>(
  step: BridgeNarrationStep<T>,
  coachText: string,
  ctx: T,
  config: AcademySpeakConfig & { extraParts?: string[] },
): void {
  const { extraParts = [], ...speakConfig } = config;
  const text = buildBridgeNarration(step, coachText, ctx, extraParts);
  speakAcademyNarration(text, speakConfig);
}
