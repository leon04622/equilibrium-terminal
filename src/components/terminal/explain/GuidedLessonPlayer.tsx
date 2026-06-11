"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Pause,
  Play,
  Repeat,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { ExplainVisualCueCard } from "@/components/terminal/explain/ExplainVisualCue";
import { GuidedLessonEngine } from "@/lib/operator-guide/GuidedLessonEngine";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { TranslationEngine } from "@/lib/education/TranslationEngine";
import { speakAcademyNarration } from "@/lib/education/academyVoice";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { terminalBus } from "@/store/eventBus";
import type { GuidedLessonStep } from "@/types/operator-guide";

export function GuidedLessonPlayer({ panelId }: { panelId: string }) {
  const stepIndex = useOperatorGuideStore((s) => s.lessonStepIndex);
  const setLessonStep = useOperatorGuideStore((s) => s.setLessonStep);
  const endLesson = useOperatorGuideStore((s) => s.endLesson);
  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);
  const setFocusLabels = useOperatorGuideStore((s) => s.setFocusLabels);
  const activeReplay = useOperatorGuideStore((s) => s.activeReplay);
  const audience = useOperatorGuideStore((s) => s.selectedAudience);
  const isBeginner = audience === "beginner";

  const lesson = GuidedLessonEngine.forPanel(panelId);
  const total = lesson.steps.length;
  const clamped = Math.min(Math.max(stepIndex, 0), total - 1);
  const step = lesson.steps[clamped];

  const voiceSupported = lessonVoiceSupported();
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [playing, setPlaying] = useState(false);

  // Refs so the speech onEnd callback always reads current values.
  const playingRef = useRef(playing);
  const beginnerRef = useRef(isBeginner);
  const voiceOnRef = useRef(voiceOn);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  playingRef.current = playing;
  beginnerRef.current = isBeginner;
  voiceOnRef.current = voiceOn;

  const narrationFor = useCallback(
    (s: GuidedLessonStep | undefined): string => {
      if (!s) return "";
      if (beginnerRef.current) return s.narration ?? `${s.instruction}. ${s.beginnerNote}`;
      return s.proNote || s.instruction;
    },
    [],
  );

  const clearAdvance = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  // Speak a given step; when hands-free is playing, auto-advance after it ends.
  const speakStep = useCallback(
    (idx: number) => {
      clearAdvance();
      const s = lesson.steps[idx];
      if (!s) return;
      const text = narrationFor(s);
      speakAcademyNarration(text, {
        voiceOn: voiceOnRef.current,
        supported: voiceSupported,
        rate: beginnerRef.current ? 0.88 : 1.0,
        onEnd: () => {
          if (!playingRef.current) return;
          if (idx >= total - 1) {
            setPlaying(false);
            return;
          }
          const pause = beginnerRef.current ? 1100 : 450;
          advanceTimer.current = setTimeout(() => setLessonStep(idx + 1), pause);
        },
      });
    },
    [lesson.steps, narrationFor, setLessonStep, total, voiceSupported],
  );

  // On each step: set the visual focus + labels, glide the panel into view,
  // and narrate (PHASE 3 + PHASE 4 synchronization).
  useEffect(() => {
    if (!step) return;
    setHighlightPanel(step.focusPanel);
    setFocusLabels(step.labels ?? []);
    terminalBus.emit("widget:focus", { widgetId: step.focusPanel });
    speakStep(clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped, voiceOn]);

  // Cleanup on unmount: clear visuals + stop any narration.
  useEffect(() => {
    return () => {
      setHighlightPanel(null);
      setFocusLabels([]);
      clearAdvance();
      cancelLesson();
    };
  }, [setHighlightPanel, setFocusLabels]);

  // PHASE 7 — narrate the mini-replay annotations as they change.
  const lastSpokenAnnotation = useRef<string | null>(null);
  useEffect(() => {
    const ann = activeReplay?.activeAnnotation;
    if (!ann || !voiceOnRef.current || !voiceSupported) return;
    if (lastSpokenAnnotation.current === ann.id) return;
    lastSpokenAnnotation.current = ann.id;
    speakLesson(TranslationEngine.voiceLine(ann.headline), {
      rate: beginnerRef.current ? 0.9 : 1.0,
    });
  }, [activeReplay?.activeAnnotation, voiceSupported]);

  if (!step) return null;

  const isLast = clamped >= total - 1;
  const isFirst = clamped <= 0;

  const goTo = (idx: number) => {
    clearAdvance();
    setLessonStep(idx);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    setLessonVoiceEnabled(next);
    if (!next) {
      cancelLesson();
      clearAdvance();
      setPlaying(false);
    }
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      cancelLesson();
      clearAdvance();
    } else {
      setPlaying(true);
      // Ensure voice is on for hands-free playback, then speak current step.
      if (!voiceOn) {
        setVoiceOn(true);
        setLessonVoiceEnabled(true);
        voiceOnRef.current = true;
      }
      playingRef.current = true;
      speakStep(clamped);
    }
  };

  const repeat = () => {
    if (!voiceOn) {
      setVoiceOn(true);
      setLessonVoiceEnabled(true);
      voiceOnRef.current = true;
    }
    speakStep(clamped);
  };

  const finish = () => {
    cancelLesson();
    clearAdvance();
    setHighlightPanel(null);
    endLesson();
  };

  const launchReplay = () => {
    lastSpokenAnnotation.current = null;
    OperatorGuideOrchestrator.startScenario(lesson.replayScenarioId);
  };

  return (
    <div className="mb-3 border border-cyan-700/50 bg-cyan-950/20 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3 text-cyan-400" />
          <span className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>GUIDED LESSON</span>
        </div>
        <button
          type="button"
          onClick={finish}
          className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-300")}
          aria-label="Exit lesson"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className={cn(TERMINAL_TYPO.label, "mt-1 text-slate-100")}>{lesson.title}</p>

      <div className="mt-1.5 flex gap-0.5">
        {lesson.steps.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "h-1 flex-1 rounded-none",
              i < clamped ? "bg-cyan-700" : i === clamped ? "bg-cyan-400" : "bg-slate-800",
            )}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          STEP {clamped + 1} / {total} · focus {step.focusPanel.toUpperCase()}
        </p>
        <span className={cn(TERMINAL_TYPO.micro, isBeginner ? "text-emerald-500" : "text-violet-400")}>
          {isBeginner ? "BEGINNER" : "PRO"}
        </span>
      </div>

      <p className={cn(TERMINAL_TYPO.label, "mt-2 text-cyan-100")}>{step.instruction}</p>

      {/* PHASE 3 — narration transport */}
      <div className="mt-2 flex items-center gap-1 border border-slate-800 bg-slate-900/50 p-1">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!voiceSupported}
          title={voiceSupported ? (playing ? "Pause narration" : "Play narration hands-free") : "Voice not supported in this browser"}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border px-1.5 py-0.5",
            playing
              ? "border-cyan-500/60 bg-cyan-950/50 text-cyan-200"
              : "border-slate-700 text-slate-300 hover:border-slate-500",
            !voiceSupported && "opacity-40",
          )}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <button
          type="button"
          onClick={repeat}
          disabled={!voiceSupported}
          title="Repeat this step"
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border border-slate-700 px-1.5 py-0.5 text-slate-300 hover:border-slate-500",
            !voiceSupported && "opacity-40",
          )}
        >
          <Repeat className="h-3 w-3" />
          REPEAT
        </button>
        <button
          type="button"
          onClick={toggleVoice}
          title={voiceOn ? "Mute voice" : "Unmute voice"}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto flex items-center gap-1 border px-1.5 py-0.5",
            voiceOn ? "border-slate-700 text-slate-300" : "border-rose-700/50 text-rose-300",
          )}
        >
          {voiceOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {voiceOn ? "VOICE" : "MUTED"}
        </button>
      </div>
      {!voiceSupported ? (
        <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
          Voice narration isn&apos;t available here — read along with the text below.
        </p>
      ) : null}

      {/* What the voice is saying — concise support text (PHASE 5) */}
      <div className="mt-2 border border-slate-800 bg-slate-900/40 p-1.5">
        <p className={cn(TERMINAL_TYPO.micro, "leading-relaxed text-slate-200")}>
          {narrationFor(step)}
        </p>
      </div>

      <div className="mt-2">
        <ExplainVisualCueCard
          cue={{
            type: step.visualCue,
            label: step.focusPanel.toUpperCase(),
            caption: isBeginner ? step.beginnerNote : step.proNote,
          }}
        />
      </div>

      <div className="mt-2 border border-slate-800 bg-slate-900/50 p-1.5">
        <p className={cn(TERMINAL_TYPO.micro, "text-amber-400")}>CAUSE → EFFECT</p>
        <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-300")}>
          <span className="text-slate-500">Cause: </span>
          {step.cause}
        </p>
        <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-300")}>
          <span className="text-slate-500">Effect: </span>
          {step.effect}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => goTo(clamped - 1)}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border border-slate-700 px-2 py-1",
            isFirst ? "text-slate-700" : "text-slate-400 hover:border-slate-500",
          )}
        >
          <ArrowLeft className="h-3 w-3" />
          BACK
        </button>

        <button
          type="button"
          onClick={launchReplay}
          className={cn(
            TERMINAL_TYPO.micro,
            "border border-amber-700/50 px-2 py-1 text-amber-300 hover:bg-amber-950/30",
          )}
        >
          {isLast ? "WATCH IT HAPPEN" : "REPLAY"}
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={finish}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 border border-emerald-700/50 bg-emerald-950/30 px-2 py-1 text-emerald-300",
            )}
          >
            DONE
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(clamped + 1)}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 border border-cyan-700/50 bg-cyan-950/30 px-2 py-1 text-cyan-300 hover:bg-cyan-950/50",
            )}
          >
            NEXT
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
