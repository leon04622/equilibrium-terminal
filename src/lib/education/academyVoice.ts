/**
 * ACADEMY FRAMEWORK V1 — shared narration helpers.
 * Ensures every explained line is spoken word-for-word.
 */

import {
  armLessonVoice,
  estimateNarrationMs,
  isLessonVoiceArmed,
  speakLesson,
} from "@/lib/education/LessonNarrator";

export function combineNarration(...parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(" ");
}

export interface BridgeNarrationStep<T = unknown> {
  id?: string;
  mode: string;
  whyCare?: (ctx: T) => string;
  decide?: { prompt: string };
  compare?: { good: { title: string }; bad: { title: string } };
}

/** Build full spoken script for a bridge step (coach + why care + interactive prompt). */
export function buildBridgeNarration<T>(
  step: BridgeNarrationStep<T>,
  coachText: string,
  ctx: T,
  extraParts: string[] = [],
): string {
  const parts: string[] = [coachText];
  if (step.whyCare) {
    const why = step.whyCare(ctx);
    if (why) parts.push(why);
  }
  if (step.mode === "decide" && step.decide?.prompt) {
    parts.push(step.decide.prompt);
  }
  if (step.mode === "compare" && step.compare) {
    parts.push(
      `Compare ${step.compare.bad.title} and ${step.compare.good.title}. Which is better?`,
    );
  }
  parts.push(...extraParts);
  return combineNarration(...parts);
}

export interface AcademySpeakConfig {
  voiceOn: boolean;
  supported: boolean;
  rate?: number;
  onEnd?: () => void;
  onError?: () => void;
}

/** Speak immediately when voice is armed; prime only on first line of a session. */
export function speakAcademyNarration(
  text: string,
  { voiceOn, supported, rate = 1.0, onEnd, onError }: AcademySpeakConfig,
): void {
  const trimmed = text.trim();
  if (!trimmed) {
    onEnd?.();
    return;
  }

  const speak = () => {
    if (voiceOn && supported) {
      speakLesson(trimmed, {
        rate,
        onEnd,
        onError: onError ?? onEnd,
      });
    } else if (onEnd) {
      window.setTimeout(onEnd, estimateNarrationMs(trimmed, rate));
    }
  };

  if (!isLessonVoiceArmed()) {
    armLessonVoice();
  }
  speak();
}
