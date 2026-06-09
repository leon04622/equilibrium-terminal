/**
 * PHASE 3 + PHASE 10 — Lesson narration.
 *
 * A small, swappable voice layer for guided learning. Today it speaks through
 * the browser SpeechSynthesis API (free, good enough to validate that users
 * actually learn). The `LessonVoice` interface is the seam: a future Leon
 * cloned voice / ElevenLabs / streaming voice can implement the same contract
 * and be installed with `setLessonVoice()` without touching any UI.
 *
 * We are NOT validating voice quality here — only learning flow, pacing, and
 * synchronization.
 */

export interface SpeakOptions {
  /** 0.5 = slow & calm, 1 = normal. Beginner lessons run slower. */
  rate?: number;
  /** Fired when the line finishes (used for hands-free auto-advance). */
  onEnd?: () => void;
  /** Fired if speech could not start (unsupported / blocked). */
  onError?: () => void;
}

export interface LessonVoice {
  readonly id: string;
  isSupported(): boolean;
  speak(text: string, opts?: SpeakOptions): void;
  cancel(): void;
}

/** Default implementation — native browser speech synthesis. */
class BrowserLessonVoice implements LessonVoice {
  readonly id = "browser-tts";

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, opts: SpeakOptions = {}): void {
    if (!this.isSupported()) {
      opts.onError?.();
      return;
    }
    try {
      const synth = window.speechSynthesis;
      synth.cancel(); // never overlap lines
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 0.92; // calm mentor cadence
      u.pitch = 1;
      u.volume = 1;
      u.lang = "en-US";
      // Prefer a natural en voice when one is available.
      const preferred = synth
        .getVoices()
        .find((v) => /en-US/i.test(v.lang) && /(natural|google|samantha|aria)/i.test(v.name));
      if (preferred) u.voice = preferred;
      if (opts.onEnd) u.onend = () => opts.onEnd?.();
      if (opts.onError) u.onerror = () => opts.onError?.();
      synth.speak(u);
    } catch {
      opts.onError?.();
    }
  }

  cancel(): void {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }
}

let active: LessonVoice = new BrowserLessonVoice();

/** PHASE 10 — install a richer voice (Leon clone / ElevenLabs) later. */
export function setLessonVoice(voice: LessonVoice): void {
  active.cancel();
  active = voice;
}

export function lessonVoiceSupported(): boolean {
  return active.isSupported();
}

export function speakLesson(text: string, opts?: SpeakOptions): void {
  active.speak(text, opts);
}

export function cancelLesson(): void {
  active.cancel();
}

const VOICE_PREF_KEY = "eq-lesson-voice-on-v1";

/** Persisted "voice on" preference. Defaults to ON for guided lessons. */
export function getLessonVoiceEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(VOICE_PREF_KEY);
    return raw == null ? true : raw === "1";
  } catch {
    return true;
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
