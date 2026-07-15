/**
 * ACADEMY FRAMEWORK V1 — Lesson narration (single queue, single active voice).
 *
 * One narration source · one queue · one active voice event.
 * Swappable via `setLessonVoice()` for future Leon / ElevenLabs voices.
 */

import { academyPerf } from "@/lib/education/academyPerformance";
import { humanizeForSpeech } from "@/lib/education/speechHumanize";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
}

export interface LessonVoice {
  readonly id: string;
  isSupported(): boolean;
  speak(text: string, opts: SpeakOptions, generation: number): void;
  cancel(): void;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  // Local voices start faster and glitch less than network voices in Chrome/Edge.
  return (
    voices.find((v) => /en-US/i.test(v.lang) && v.localService) ??
    voices.find((v) => /en-GB/i.test(v.lang) && v.localService) ??
    voices.find((v) => /en-US/i.test(v.lang) && /(natural|google|samantha|aria|neural)/i.test(v.name)) ??
    voices.find((v) => /en-GB/i.test(v.lang) && /(natural|google|daniel|aria|neural)/i.test(v.name)) ??
    voices.find((v) => /en-US/i.test(v.lang)) ??
    voices.find((v) => /en-GB/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0] ??
    null
  );
}

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesInit = false;
/** Set after a user-gesture prime — skips per-step prepare delays. */
let voiceArmed = false;

function ensureVoicesLoaded(): void {
  if (voicesInit || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voicesInit = true;
  const refresh = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) cachedVoice = pickVoice(voices);
  };
  refresh();
  window.speechSynthesis.addEventListener("voiceschanged", refresh);
}

/** Rough read time when voice is off or blocked. */
export function estimateNarrationMs(text: string, rate = 0.92): number {
  const charsPerSecond = 14 * rate;
  return Math.max(2600, Math.round((text.length / charsPerSecond) * 1000));
}

let speechGeneration = 0;
let pendingSpeakTimer: number | null = null;
let resumeTimer: number | null = null;
let keepaliveTimer: number | null = null;
let speechStartedAt = 0;
let isSpeaking = false;

function clearPendingTimers(): void {
  if (pendingSpeakTimer) {
    clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }
  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
}

function stopKeepalive(): void {
  if (keepaliveTimer) {
    clearInterval(keepaliveTimer);
    keepaliveTimer = null;
  }
}

/** Chrome/Edge pause TTS after ~15s — resume only when actually paused (avoids glitches). */
function startKeepalive(): void {
  stopKeepalive();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  keepaliveTimer = window.setInterval(() => {
    try {
      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
    } catch {
      /* ignore */
    }
  }, 10000);
}

/** Only chunk long lines — short/medium lines speak as one utterance (smoother, faster). */
function splitSpeechChunks(text: string): string[] {
  const raw = text.trim();
  if (!raw) return [];
  if (raw.length <= 280) return [raw];

  const sentences =
    raw.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [raw];
  const chunks: string[] = [];
  let buf = "";
  const maxChars = 220;
  for (const sentence of sentences) {
    const candidate = buf ? `${buf} ${sentence}` : sentence;
    if (candidate.length > maxChars && buf) {
      chunks.push(buf);
      buf = sentence;
    } else {
      buf = candidate;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [raw];
}

function isBenignSpeechError(err: string | undefined): boolean {
  return err === "interrupted" || err === "canceled";
}

function resumeIfPaused(synth: SpeechSynthesis): void {
  try {
    if (synth.paused) synth.resume();
  } catch {
    /* ignore */
  }
}

function guardCallback(gen: number, fn?: () => void): void {
  if (!fn) return;
  if (gen !== speechGeneration) {
    academyPerf.recordStaleCallback();
    return;
  }
  fn();
}

/** Call from a click handler so autoplay policy allows TTS on lesson open. */
export function primeLessonVoice(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  ensureVoicesLoaded();
  try {
    const synth = window.speechSynthesis;
    synth.resume();
    const prime = new SpeechSynthesisUtterance(" ");
    prime.volume = 0.01;
    prime.rate = 10;
    if (cachedVoice) prime.voice = cachedVoice;
    synth.speak(prime);
    window.setTimeout(() => {
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
    }, 16);
  } catch {
    /* ignore */
  }
}

export function isLessonVoiceArmed(): boolean {
  return voiceArmed;
}

/** Arm TTS once per lesson session (call from Start / hub click). */
export function armLessonVoice(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  ensureVoicesLoaded();
  primeLessonVoice();
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoice = cachedVoice ?? pickVoice(voices);
  voiceArmed = true;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}

export function disarmLessonVoice(): void {
  voiceArmed = false;
}

/**
 * Load voices and unlock speech after a user gesture — then run callback.
 * Fast-path when already armed (no per-step delay).
 */
export function prepareLessonVoice(onReady?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onReady?.();
    return;
  }
  ensureVoicesLoaded();

  const finish = () => {
    voiceArmed = true;
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
    onReady?.();
  };

  if (voiceArmed && cachedVoice) {
    finish();
    return;
  }

  primeLessonVoice();

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoice = cachedVoice ?? pickVoice(voices);
    finish();
    return;
  }

  const onVoices = () => {
    window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    cachedVoice = pickVoice(window.speechSynthesis.getVoices());
    finish();
  };
  window.speechSynthesis.addEventListener("voiceschanged", onVoices);
  window.setTimeout(() => {
    window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    finish();
  }, 200);
}

class BrowserLessonVoice implements LessonVoice {
  readonly id = "browser-tts";

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, opts: SpeakOptions, generation: number): void {
    if (!this.isSupported()) {
      guardCallback(generation, opts.onError);
      return;
    }
    const chunks = splitSpeechChunks(text);
    if (chunks.length <= 1) {
      this.speakChunk(text, opts, generation, { replaceQueue: true });
      return;
    }

    let idx = 0;
    const speakNext = () => {
      if (generation !== speechGeneration) return;
      if (idx >= chunks.length) {
        isSpeaking = false;
        stopKeepalive();
        guardCallback(generation, opts.onEnd);
        return;
      }
      const chunk = chunks[idx];
      const isLast = idx === chunks.length - 1;
      idx += 1;
      this.speakChunk(chunk, {
        rate: opts.rate,
        onEnd: isLast
          ? opts.onEnd
          : () => {
              queueMicrotask(speakNext);
            },
        onError: opts.onError,
      }, generation, { replaceQueue: idx === 1, keepSession: !isLast });
    };
    speakNext();
  }

  private speakChunk(
    text: string,
    opts: SpeakOptions,
    generation: number,
    { replaceQueue, keepSession = false }: { replaceQueue: boolean; keepSession?: boolean },
  ): void {
    ensureVoicesLoaded();
    const requestedAt = typeof performance !== "undefined" ? performance.now() : Date.now();

    const run = () => {
      if (generation !== speechGeneration) return;
      try {
        const synth = window.speechSynthesis;
        const needsCancel = replaceQueue && (synth.speaking || synth.pending);

        const utter = () => {
          if (generation !== speechGeneration) return;
          try {
            resumeIfPaused(synth);
            const speakText = () => {
              const u = new SpeechSynthesisUtterance(text);
              u.rate = opts.rate ?? 0.92;
              u.pitch = opts.pitch ?? 1;
              u.volume = 1;
              u.lang = "en-US";
              const voice = cachedVoice ?? pickVoice(synth.getVoices());
              if (voice) u.voice = voice;

              let started = false;
              let watchdog: number | null = null;
              const clearWatchdog = () => {
                if (watchdog) {
                  clearTimeout(watchdog);
                  watchdog = null;
                }
              };

              u.onstart = () => {
                if (generation !== speechGeneration) {
                  synth.cancel();
                  return;
                }
                started = true;
                clearWatchdog();
                isSpeaking = true;
                startKeepalive();
                speechStartedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
                academyPerf.recordSpeechStart(speechStartedAt - requestedAt);
              };
              u.onend = () => {
                clearWatchdog();
                if (generation !== speechGeneration) {
                  academyPerf.recordStaleCallback();
                  return;
                }
                if (!keepSession) {
                  isSpeaking = false;
                  stopKeepalive();
                }
                const endedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
                academyPerf.recordSpeechEnd(endedAt - speechStartedAt);
                guardCallback(generation, opts.onEnd);
              };
              u.onerror = (ev) => {
                clearWatchdog();
                isSpeaking = false;
                stopKeepalive();
                const err = (ev as SpeechSynthesisErrorEvent).error;
                if (isBenignSpeechError(err)) return;
                guardCallback(generation, opts.onError);
              };

              synth.speak(u);
              resumeTimer = window.setTimeout(() => resumeIfPaused(synth), 16);

              watchdog = window.setTimeout(() => {
                if (started || generation !== speechGeneration) return;
                resumeIfPaused(synth);
              }, 240);
            };
            speakText();
          } catch {
            isSpeaking = false;
            guardCallback(generation, opts.onError);
          }
        };

        if (needsCancel) {
          synth.cancel();
          queueMicrotask(utter);
        } else {
          utter();
        }
      } catch {
        isSpeaking = false;
        guardCallback(generation, opts.onError);
      }
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      const onReady = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onReady);
        cachedVoice = pickVoice(window.speechSynthesis.getVoices());
        run();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onReady);
      pendingSpeakTimer = window.setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", onReady);
        run();
      }, 48);
      return;
    }
    cachedVoice = cachedVoice ?? pickVoice(voices);
    run();
  }

  cancel(): void {
    try {
      isSpeaking = false;
      stopKeepalive();
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }
}

let active: LessonVoice = new BrowserLessonVoice();

export function setLessonVoice(voice: LessonVoice): void {
  cancelLesson();
  active = voice;
}

export function lessonVoiceSupported(): boolean {
  return active.isSupported();
}

export function isLessonSpeaking(): boolean {
  return isSpeaking;
}

export function speakLesson(text: string, opts?: SpeakOptions): void {
  const trimmed = humanizeForSpeech(text);
  if (!trimmed) {
    opts?.onEnd?.();
    return;
  }
  if (!getLessonVoiceEnabled()) {
    opts?.onEnd?.();
    return;
  }
  const gen = ++speechGeneration;
  clearPendingTimers();

  const deliver = () => {
    if (gen !== speechGeneration) return;
    active.speak(trimmed, opts ?? {}, gen);
  };

  const synth =
    typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null;
  const needsCancel = Boolean(synth?.speaking || synth?.pending);
  if (needsCancel) {
    active.cancel();
    queueMicrotask(deliver);
  } else {
    deliver();
  }
}

export function cancelLesson(): void {
  speechGeneration++;
  isSpeaking = false;
  clearPendingTimers();
  stopKeepalive();
  active.cancel();
  academyPerf.recordSpeechCancel();
}

const VOICE_PREF_KEY = "eq-lesson-voice-on-v2";

export function getLessonVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(VOICE_PREF_KEY);
    return raw === "1";
  } catch {
    return false;
  }
}

export function setLessonVoiceEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOICE_PREF_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}
