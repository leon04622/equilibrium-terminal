"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACADEMY_MIN_POST_NARRATION_MS,
  ACADEMY_SIMULATOR_VOICE_RATE,
} from "@/lib/education/ACADEMY_FRAMEWORK_V1";
import {
  beginAcademyTransition,
  endAcademyTransition,
} from "@/lib/education/academyPerformance";
import { speakAcademyNarration } from "@/lib/education/academyVoice";
import {
  armLessonVoice,
  cancelLesson,
  estimateNarrationMs,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  setLessonVoiceEnabled,
} from "@/lib/education/LessonNarrator";
import { usePrefersReducedMotion } from "@/lib/education/usePrefersReducedMotion";

export interface LessonSceneLine {
  voice: string;
  holdMs?: number;
}

export interface UseLessonSceneDriverConfig<T extends LessonSceneLine> {
  scenes: T[];
  active: boolean;
  runId: number;
  startStep: number;
  markStep: (index: number) => void;
  markCompleted: () => void;
  close: () => void;
  voiceRate?: number;
}

/**
 * ACADEMY FRAMEWORK V1 — unified simulator pacing.
 * Narration completes before post-hold; hold never runs before voice ends.
 */
export function useLessonSceneDriver<T extends LessonSceneLine>({
  scenes,
  active,
  runId,
  startStep,
  markStep,
  markCompleted,
  close,
  voiceRate = ACADEMY_SIMULATOR_VOICE_RATE,
}: UseLessonSceneDriverConfig<T>) {
  const reduceMotion = usePrefersReducedMotion();
  const supported = lessonVoiceSupported();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narratedKeyRef = useRef("");
  const skipIndexEffectRef = useRef(false);
  const enterRef = useRef<(i: number, force?: boolean) => void>(() => {});
  const playingRef = useRef(playing);
  const voiceOnRef = useRef(voiceOn);
  const reduceMotionRef = useRef(reduceMotion);
  playingRef.current = playing;
  voiceOnRef.current = voiceOn;
  reduceMotionRef.current = reduceMotion;

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const scene = scenes[Math.min(index, scenes.length - 1)];

  const scheduleAdvance = useCallback(
    (token: number, i: number, holdMs: number) => {
      const hold = Math.max(
        ACADEMY_MIN_POST_NARRATION_MS,
        Math.round(holdMs * (reduceMotionRef.current ? 0.5 : 1)),
      );
      holdTimer.current = setTimeout(() => {
        if (tokenRef.current !== token) return;
        if (playingRef.current && i < scenes.length - 1) {
          beginAcademyTransition();
          setIndex(i + 1);
          endAcademyTransition();
        }
      }, hold);
    },
    [scenes.length],
  );

  const enter = useCallback(
    (i: number, force = false) => {
      const token = ++tokenRef.current;
      clearTimers();
      const speakKey = `${runId}:${i}`;
      if (!force && narratedKeyRef.current === speakKey) return;
      narratedKeyRef.current = speakKey;
      const s = scenes[i];
      if (!s) return;

      const afterNarration = () => {
        if (tokenRef.current !== token) return;
        scheduleAdvance(token, i, s.holdMs ?? 1400);
      };

      speakAcademyNarration(s.voice, {
        voiceOn: voiceOnRef.current,
        supported,
        rate: voiceRate,
        onEnd: afterNarration,
        onError: () => {
          if (tokenRef.current !== token) return;
          holdTimer.current = setTimeout(afterNarration, estimateNarrationMs(s.voice, voiceRate));
        },
      });
    },
    [supported, clearTimers, scheduleAdvance, scenes, voiceRate, runId],
  );

  enterRef.current = enter;

  useEffect(() => {
    if (!active) return;
    armLessonVoice();
    beginAcademyTransition();
    const start = Math.min(Math.max(startStep, 0), scenes.length - 1);
    skipIndexEffectRef.current = true;
    narratedKeyRef.current = `${runId}:${start}`;
    setIndex(start);
    setPlaying(true);
    playingRef.current = true;
    enterRef.current(start, true);
    markStep(start);
    if (start >= scenes.length - 1) markCompleted();
    endAcademyTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, startStep, scenes.length]);

  useEffect(() => {
    if (!active) return;
    if (skipIndexEffectRef.current) {
      skipIndexEffectRef.current = false;
      return;
    }
    const speakKey = `${runId}:${index}`;
    if (narratedKeyRef.current === speakKey) return;
    narratedKeyRef.current = speakKey;
    enterRef.current(index, true);
    markStep(index);
    if (index >= scenes.length - 1) markCompleted();
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, index]);

  const exit = useCallback(() => {
    tokenRef.current++;
    clearTimers();
    cancelLesson();
    close();
  }, [close, clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, scenes.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => {
          const next = !p;
          playingRef.current = next;
          if (!next) {
            cancelLesson();
            clearTimers();
          } else {
            enter(index);
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit, scenes.length, index, enter, clearTimers]);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      playingRef.current = false;
      cancelLesson();
      clearTimers();
    } else {
      setPlaying(true);
      playingRef.current = true;
      enter(index);
    }
  }, [playing, index, enter, clearTimers]);

  const toggleVoice = useCallback(() => {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceOnRef.current = next;
    setLessonVoiceEnabled(next);
    cancelLesson();
    if (playingRef.current) enter(index);
  }, [voiceOn, index, enter]);

  const replayScene = useCallback(() => {
    narratedKeyRef.current = "";
    enter(index, true);
  }, [index, enter]);

  const goto = useCallback(
    (i: number) => {
      tokenRef.current++;
      clearTimers();
      cancelLesson();
      narratedKeyRef.current = "";
      setIndex(Math.min(Math.max(i, 0), scenes.length - 1));
    },
    [scenes.length, clearTimers],
  );

  return {
    index,
    setIndex: goto,
    playing,
    voiceOn,
    scene,
    reduceMotion,
    supported,
    clearTimers,
    exit,
    togglePlay,
    toggleVoice,
    replayScene,
    enter,
    isLast: index >= scenes.length - 1,
    isFirst: index <= 0,
    sceneKey: scene ? `${runId}-${index}` : "idle",
  };
}
