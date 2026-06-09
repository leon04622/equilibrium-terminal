import type { AuditLogEntry } from "@/types/security-trust";

const MAX = 2000;
const entries: AuditLogEntry[] = [];

export function appendAudit(entry: Omit<AuditLogEntry, "id" | "at">): AuditLogEntry {
  const full: AuditLogEntry = {
    ...entry,
    id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };
  entries.unshift(full);
  if (entries.length > MAX) entries.length = MAX;
  return full;
}

export function listAudit(limit = 64, sinceMs = 86_400_000): AuditLogEntry[] {
  const since = Date.now() - sinceMs;
  return entries.filter((e) => e.at >= since).slice(0, limit);
}

export function countAuditSince(sinceMs: number): number {
  const since = Date.now() - sinceMs;
  return entries.filter((e) => e.at >= since).length;
}
