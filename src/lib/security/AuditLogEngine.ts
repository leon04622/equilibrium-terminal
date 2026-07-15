import type { AuditCategory, AuditLogEntry } from "@/types/security-trust";

const CLIENT_KEY = "eq-security-audit-v1";
const MAX_CLIENT = 200;

export function createTraceId(): string {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Client-side forensic buffer (mirrors server audit for offline review). */
export class AuditLogEngine {
  static load(): AuditLogEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CLIENT_KEY);
      return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
    } catch {
      return [];
    }
  }

  static append(
    input: Omit<AuditLogEntry, "id" | "at" | "traceId"> & { traceId?: string },
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `caud_${Date.now().toString(36)}`,
      at: Date.now(),
      traceId: input.traceId ?? createTraceId(),
      category: input.category,
      action: input.action,
      actorWallet: input.actorWallet,
      sessionId: input.sessionId,
      resource: input.resource,
      outcome: input.outcome,
      detail: input.detail,
    };
    if (typeof window === "undefined") return entry;
    const next = [entry, ...AuditLogEngine.load()].slice(0, MAX_CLIENT);
    try {
      localStorage.setItem(CLIENT_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
    return entry;
  }

  static logAuth(
    action: string,
    outcome: AuditLogEntry["outcome"],
    detail: string,
    wallet?: string | null,
  ): AuditLogEntry {
    return AuditLogEngine.append({
      category: "auth",
      action,
      actorWallet: wallet ?? null,
      sessionId: null,
      resource: null,
      outcome,
      detail,
    });
  }

  static logExecution(
    action: string,
    outcome: AuditLogEntry["outcome"],
    detail: string,
    wallet: string | null,
    resource: string,
  ): AuditLogEntry {
    return AuditLogEngine.append({
      category: "execution",
      action,
      actorWallet: wallet,
      sessionId: null,
      resource,
      outcome,
      detail,
    });
  }

  static logCategory(
    category: AuditCategory,
    action: string,
    outcome: AuditLogEntry["outcome"],
    detail: string,
  ): AuditLogEntry {
    return AuditLogEngine.append({
      category,
      action,
      actorWallet: null,
      sessionId: null,
      resource: null,
      outcome,
      detail,
    });
  }

  static exportCsv(entries?: AuditLogEntry[]): string {
    const rows = entries ?? AuditLogEngine.load();
    const header = "at,traceId,category,action,outcome,actorWallet,resource,detail";
    const lines = rows.map((e) => {
      const esc = (v: string | null) => {
        const s = v ?? "";
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      };
      return [
        new Date(e.at).toISOString(),
        e.traceId,
        e.category,
        e.action,
        e.outcome,
        esc(e.actorWallet),
        esc(e.resource),
        esc(e.detail),
      ].join(",");
    });
    return [header, ...lines].join("\n");
  }

  static downloadCsv(filename = "equilibrium-execution-audit.csv"): void {
    if (typeof window === "undefined") return;
    const csv = AuditLogEngine.exportCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
