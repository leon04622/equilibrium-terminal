import type { AuditLogEntry } from "@/types/security-trust";

import { appendAuditToDisk, hydrateAuditFromDisk } from "@/lib/security/server/auditDiskStore";

import { appendAuditToKv, hydrateAuditFromKv } from "@/lib/security/server/auditKvStore";



const MAX = 2000;

const entries: AuditLogEntry[] = [];

let hydrated = false;

let kvHydrated = false;



function mergeEntries(incoming: AuditLogEntry[]): void {

  for (const e of incoming) {

    if (!entries.some((x) => x.id === e.id)) entries.push(e);

  }

  entries.sort((a, b) => b.at - a.at);

  if (entries.length > MAX) entries.length = MAX;

}



function ensureHydrated(): void {

  if (hydrated) return;

  hydrated = true;

  mergeEntries(hydrateAuditFromDisk(MAX));

}



export async function ensureAuditHydratedAsync(): Promise<void> {

  ensureHydrated();

  if (kvHydrated) return;

  kvHydrated = true;

  const kv = await hydrateAuditFromKv(MAX);

  mergeEntries(kv);

}



export function appendAudit(entry: Omit<AuditLogEntry, "id" | "at">): AuditLogEntry {

  ensureHydrated();

  const full: AuditLogEntry = {

    ...entry,

    id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,

    at: Date.now(),

  };

  entries.unshift(full);

  if (entries.length > MAX) entries.length = MAX;

  appendAuditToDisk(full);

  void appendAuditToKv(full);

  return full;

}



export function listAudit(limit = 64, sinceMs = 86_400_000): AuditLogEntry[] {

  ensureHydrated();

  const since = Date.now() - sinceMs;

  return entries.filter((e) => e.at >= since).slice(0, limit);

}



export function countAuditSince(sinceMs: number): number {

  const since = Date.now() - sinceMs;

  return entries.filter((e) => e.at >= since).length;

}


