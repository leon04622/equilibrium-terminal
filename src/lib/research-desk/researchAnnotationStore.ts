import type { PersistedAnnotation } from "@/types/research-operating";

const STORAGE_KEY = "eq-research-annotations-v1";

let cache: PersistedAnnotation[] = [];

export const researchAnnotationStore = {
  all(): PersistedAnnotation[] {
    if (cache.length) return cache;
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cache = raw ? (JSON.parse(raw) as PersistedAnnotation[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  },

  append(row: PersistedAnnotation): void {
    const list = researchAnnotationStore.all();
    list.unshift(row);
    cache = list.slice(0, 200);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
      } catch {
        /* quota */
      }
    }
  },
};
