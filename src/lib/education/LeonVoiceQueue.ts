import type { VoiceCue } from "@/types/live-coach";

/**
 * PHASE 4 / PHASE 10 — Leon Operator Voice queue.
 *
 * A calm, non-spammy narration queue ready for a future Leon TTS voice. For now
 * it can optionally speak through the browser SpeechSynthesis API (default OFF),
 * but the important part is the architecture:
 *
 *   - prioritization: criticals jump ahead of routine context.
 *   - suppression: the same line/key won't repeat inside a cooldown window.
 *   - calm pacing: a minimum gap is enforced between spoken lines.
 *
 * This keeps the mentor feeling like a senior trader who speaks only when it
 * matters — never YouTube energy, never assistant spam.
 */

const MIN_GAP_MS = 9_000; // calm pacing — no faster than one line every ~9s
const KEY_COOLDOWN_MS = 45_000; // don't repeat the same idea within 45s
const MAX_QUEUE = 6;

class VoiceQueue {
  private queue: VoiceCue[] = [];
  private lastSpokenAt = 0;
  private lastByKey = new Map<string, number>();
  private enabled = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Turn actual audio narration on/off (architecture is always active). */
  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.cancelSpeaking();
    else this.pump();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enqueue a cue. Returns false if suppressed (recent duplicate) so callers can
   * avoid double-logging. Always safe to call regardless of audio state.
   */
  enqueue(cue: VoiceCue): boolean {
    const now = cue.ts || Date.now();
    const last = this.lastByKey.get(cue.key) ?? 0;
    if (now - last < KEY_COOLDOWN_MS) return false;
    this.lastByKey.set(cue.key, now);

    // Insert by priority (stable): higher priority first.
    const idx = this.queue.findIndex((c) => c.priority < cue.priority);
    if (idx === -1) this.queue.push(cue);
    else this.queue.splice(idx, 0, cue);

    if (this.queue.length > MAX_QUEUE) {
      // Drop the lowest-priority tail so the queue never balloons.
      this.queue.length = MAX_QUEUE;
    }

    this.pump();
    return true;
  }

  /** Items waiting (for UI display). */
  pending(): VoiceCue[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.cancelSpeaking();
  }

  private pump(): void {
    if (typeof window === "undefined") return;
    if (this.timer) return;
    if (this.queue.length === 0) return;

    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - this.lastSpokenAt));
    this.timer = setTimeout(() => {
      this.timer = null;
      const cue = this.queue.shift();
      if (cue) {
        this.lastSpokenAt = Date.now();
        if (this.enabled) this.speak(cue.text);
      }
      this.pump();
    }, wait);
  }

  private speak(text: string): void {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      // Calm mentor cadence: slightly slower, even pitch.
      u.rate = 0.95;
      u.pitch = 1;
      u.volume = 0.9;
      synth.speak(u);
    } catch {
      /* speech unavailable — queue still drains silently */
    }
  }

  private cancelSpeaking(): void {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }
}

export const leonVoiceQueue = new VoiceQueue();
