import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DeskId } from "@/lib/desks/DeskRegistry";

const STORAGE_KEY = "eq-friction-log-v1";

/**
 * PHASE 10 — Daily Operator Testing Mode.
 * Lightweight, always-available capture of friction / UX issues / workflow
 * notes / quick improvement requests, tagged with the desk the operator was on.
 * Entries persist locally and are best-effort forwarded to the alpha feedback
 * pipeline so the terminal evolves through daily operational usage.
 */
export type FrictionKind = "friction" | "bug" | "idea" | "note";

export interface FrictionEntry {
  id: string;
  ts: number;
  deskId: DeskId | null;
  kind: FrictionKind;
  note: string;
}

const API_CATEGORY: Record<FrictionKind, "friction" | "workspace"> = {
  friction: "friction",
  bug: "friction",
  idea: "workspace",
  note: "workspace",
};

function load(): FrictionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrictionEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 200) : [];
  } catch {
    return [];
  }
}

function save(entries: FrictionEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 200)));
  } catch {
    /* ignore quota */
  }
}

function forward(entry: FrictionEntry) {
  if (typeof fetch === "undefined") return;
  void fetch("/api/alpha/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: API_CATEGORY[entry.kind],
      summary: `[${entry.deskId ?? "platform"}] ${entry.note}`,
      priority: entry.kind === "bug" ? "p1" : "p2",
    }),
  }).catch(() => {
    /* best-effort — local copy is the source of truth */
  });
}

export interface FrictionLogState {
  entries: FrictionEntry[];
  log: (input: { deskId: DeskId | null; kind: FrictionKind; note: string }) => void;
  clear: () => void;
}

export const useFrictionLogStore = create<FrictionLogState>()(
  subscribeWithSelector((set, get) => ({
    entries: load(),

    log: ({ deskId, kind, note }) => {
      const trimmed = note.trim();
      if (!trimmed) return;
      const entry: FrictionEntry = {
        id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ts: Date.now(),
        deskId,
        kind,
        note: trimmed,
      };
      const entries = [entry, ...get().entries].slice(0, 200);
      save(entries);
      forward(entry);
      set({ entries });
    },

    clear: () => {
      save([]);
      set({ entries: [] });
    },
  })),
);
