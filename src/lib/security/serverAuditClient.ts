import type { AuditLogEntry } from "@/types/security-trust";

/** Best-effort mirror of client audit entries to the server warehouse. */
export async function pushServerAudit(
  entry: Omit<AuditLogEntry, "id" | "at"> & { traceId: string },
): Promise<void> {
  try {
    await fetch("/api/security/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry }),
      keepalive: true,
    });
  } catch {
    /* client buffer is authoritative offline */
  }
}

export async function fetchServerAudit(limit = 64): Promise<AuditLogEntry[]> {
  try {
    const res = await fetch(`/api/security/audit?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as { entries?: AuditLogEntry[] };
    return json.entries ?? [];
  } catch {
    return [];
  }
}

export function downloadAuditCsv(entries: AuditLogEntry[], filename = "equilibrium-audit-export.csv"): void {
  if (typeof window === "undefined") return;
  const header = "at,traceId,category,action,outcome,actorWallet,resource,detail";
  const esc = (v: string | null) => {
    const s = v ?? "";
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = entries.map((e) =>
    [
      new Date(e.at).toISOString(),
      e.traceId,
      e.category,
      e.action,
      e.outcome,
      esc(e.actorWallet),
      esc(e.resource),
      esc(e.detail),
    ].join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
