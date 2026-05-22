import type { ReliabilityAuditEntry } from "@/types/reliability";

const STORAGE_KEY = "eq-reliability-audit-v1";
const MAX_ENTRIES = 300;

export class ReliabilityAuditLog {
  static load(): ReliabilityAuditEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ReliabilityAuditEntry[];
    } catch {
      return [];
    }
  }

  static save(entries: ReliabilityAuditEntry[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    } catch {
      // ignore quota/storage failures in runtime log
    }
  }

  static append(
    entries: ReliabilityAuditEntry[],
    input: Omit<ReliabilityAuditEntry, "id" | "at">,
  ): ReliabilityAuditEntry[] {
    const entry: ReliabilityAuditEntry = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(),
      ...input,
    };
    const next = [entry, ...entries].slice(0, MAX_ENTRIES);
    ReliabilityAuditLog.save(next);
    return next;
  }
}
