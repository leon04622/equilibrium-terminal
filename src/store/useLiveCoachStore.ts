import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { terminalBus } from "@/store/eventBus";
import { leonVoiceQueue } from "@/lib/education/LeonVoiceQueue";
import { LiveContextEngine } from "@/lib/education/LiveContextEngine";
import type { EducationalAlert, VoiceCue } from "@/types/live-coach";

/**
 * Live Operational Mentor store.
 *
 *  - `feed`    : recent translated educational alerts (volatile, capped).
 *  - `archive` : PHASE 9 market-learning memory — pinned lessons persisted to
 *                localStorage so important context survives reloads.
 *  - `voiceEnabled` : PHASE 4 toggle for Leon-voice narration.
 *
 * Push performs suppression (no duplicate ideas within a window), emits a
 * `widget:focus` for visual synchronization, and feeds the calm voice queue.
 */

const MEMORY_KEY = "eq-market-memory-v1";
const VOICE_KEY = "eq-mentor-voice-v1";
const FEED_CAP = 40;
const ARCHIVE_CAP = 200;
const DEDUPE_WINDOW_MS = 30_000;
/** Cap the dedupe ledger so a long session can't grow it without bound. */
const DEDUPE_KEYS_CAP = 200;

/** Keep only the most recent dedupe entries (prevents unbounded growth). */
function pruneLastKeyAt(map: Record<string, number>): Record<string, number> {
  const entries = Object.entries(map);
  if (entries.length <= DEDUPE_KEYS_CAP) return map;
  return Object.fromEntries(
    entries.sort((a, b) => b[1] - a[1]).slice(0, DEDUPE_KEYS_CAP),
  );
}

const SEVERITY_PRIORITY: Record<EducationalAlert["severity"], number> = {
  info: 1,
  watch: 2,
  critical: 3,
};

function loadArchive(): EducationalAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EducationalAlert[];
    return Array.isArray(parsed) ? parsed.slice(0, ARCHIVE_CAP) : [];
  } catch {
    return [];
  }
}

function saveArchive(entries: EducationalAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(entries.slice(0, ARCHIVE_CAP)));
  } catch {
    /* ignore quota */
  }
}

function loadVoice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(VOICE_KEY) === "1";
  } catch {
    return false;
  }
}

export interface LiveCoachState {
  feed: EducationalAlert[];
  archive: EducationalAlert[];
  /** Mutes both the feed surfacing pulse and the voice queue. */
  muted: boolean;
  voiceEnabled: boolean;
  /** Bumped whenever the voice queue contents change (for UI). */
  voiceVersion: number;
  lastKeyAt: Record<string, number>;

  push: (alert: EducationalAlert) => void;
  pin: (id: string) => void;
  unpin: (id: string) => void;
  dismiss: (id: string) => void;
  clearFeed: () => void;
  clearArchive: () => void;
  setMuted: (muted: boolean) => void;
  setVoiceEnabled: (on: boolean) => void;
}

export const useLiveCoachStore = create<LiveCoachState>()(
  subscribeWithSelector((set, get) => {
    const voiceEnabled = loadVoice();
    leonVoiceQueue.setEnabled(voiceEnabled);

    return {
      feed: [],
      archive: loadArchive(),
      muted: false,
      voiceEnabled,
      voiceVersion: 0,
      lastKeyAt: {},

      push: (alert) => {
        const now = alert.ts || Date.now();
        const last = get().lastKeyAt[alert.dedupeKey] ?? 0;
        // Suppress repeated ideas within the dedupe window.
        if (now - last < DEDUPE_WINDOW_MS) return;

        set((s) => ({
          feed: [alert, ...s.feed].slice(0, FEED_CAP),
          lastKeyAt: pruneLastKeyAt({ ...s.lastKeyAt, [alert.dedupeKey]: now }),
        }));

        if (get().muted) return;

        // PHASE 5 — visual synchronization: spotlight the relevant component.
        if (alert.focusPanel) {
          terminalBus.emit("widget:focus", { widgetId: alert.focusPanel });
        }

        // PHASE 4 — feed the calm voice queue (criticals jump ahead).
        const cue: VoiceCue = {
          id: alert.id,
          ts: now,
          priority: SEVERITY_PRIORITY[alert.severity],
          key: alert.dedupeKey,
          text: LiveContextEngine.voiceText(alert, "beginner"),
        };
        const queued = leonVoiceQueue.enqueue(cue);
        if (queued) set((s) => ({ voiceVersion: s.voiceVersion + 1 }));
      },

      pin: (id) => {
        const found =
          get().feed.find((a) => a.id === id) ??
          get().archive.find((a) => a.id === id);
        if (!found) return;
        if (get().archive.some((a) => a.id === id)) return;
        const archive = [found, ...get().archive].slice(0, ARCHIVE_CAP);
        saveArchive(archive);
        set({ archive });
      },

      unpin: (id) => {
        const archive = get().archive.filter((a) => a.id !== id);
        saveArchive(archive);
        set({ archive });
      },

      dismiss: (id) =>
        set((s) => ({ feed: s.feed.filter((a) => a.id !== id) })),

      clearFeed: () => set({ feed: [] }),

      clearArchive: () => {
        saveArchive([]);
        set({ archive: [] });
      },

      setMuted: (muted) => set({ muted }),

      setVoiceEnabled: (on) => {
        leonVoiceQueue.setEnabled(on);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(VOICE_KEY, on ? "1" : "0");
          } catch {
            /* ignore */
          }
        }
        set({ voiceEnabled: on });
      },
    };
  }),
);
