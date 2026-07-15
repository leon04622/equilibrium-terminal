import type { AuditLogEntry } from "@/types/security-trust";



const KV_KEY = process.env.EQUILIBRIUM_AUDIT_KV_KEY ?? "eq-audit-log";

const MAX = 2000;



function kvConfigured(): boolean {

  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

}



async function kvFetch(path: string): Promise<unknown> {

  const url = process.env.KV_REST_API_URL!;

  const token = process.env.KV_REST_API_TOKEN!;

  const res = await fetch(`${url}${path}`, {

    headers: { Authorization: `Bearer ${token}` },

    cache: "no-store",

  });

  if (!res.ok) return null;

  const body = (await res.json()) as { result?: unknown };

  return body.result ?? null;

}



export function auditKvAvailable(): boolean {

  return kvConfigured();

}



export async function appendAuditToKv(entry: AuditLogEntry): Promise<void> {

  if (!kvConfigured()) return;

  try {

    const encoded = encodeURIComponent(JSON.stringify(entry));

    await kvFetch(`/lpush/${KV_KEY}/${encoded}`);

    await kvFetch(`/ltrim/${KV_KEY}/0/${MAX - 1}`);

  } catch {

    /* KV optional */

  }

}



export async function hydrateAuditFromKv(limit = 500): Promise<AuditLogEntry[]> {

  if (!kvConfigured()) return [];

  try {

    const result = await kvFetch(`/lrange/${KV_KEY}/0/${limit - 1}`);

    if (!Array.isArray(result)) return [];

    return result

      .map((line) => {

        try {

          return typeof line === "string" ? (JSON.parse(line) as AuditLogEntry) : null;

        } catch {

          return null;

        }

      })

      .filter((e): e is AuditLogEntry => e != null);

  } catch {

    return [];

  }

}


