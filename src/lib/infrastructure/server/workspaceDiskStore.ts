import fs from "node:fs";
import path from "node:path";
import type { WorkspaceSnapshotRecord } from "@/types/production-platform";

function workspaceDataDir(): string {
  if (process.env.EQUILIBRIUM_WORKSPACE_DIR) {
    return process.env.EQUILIBRIUM_WORKSPACE_DIR;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "eq-workspaces");
  }
  return path.join(process.cwd(), ".data", "workspaces");
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 96);
}

function snapshotPath(userId: string, workspaceId: string): string {
  return path.join(
    workspaceDataDir(),
    `${safeSegment(userId)}__${safeSegment(workspaceId)}.json`,
  );
}

function ensureDir(): void {
  const dir = workspaceDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readWorkspaceSnapshotFromDisk(
  userId: string,
  workspaceId: string,
): WorkspaceSnapshotRecord | null {
  try {
    ensureDir();
    const file = snapshotPath(userId, workspaceId);
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw) as WorkspaceSnapshotRecord;
  } catch {
    return null;
  }
}

export function writeWorkspaceSnapshotToDisk(
  userId: string,
  workspaceId: string,
  record: WorkspaceSnapshotRecord,
): void {
  try {
    ensureDir();
    const file = snapshotPath(userId, workspaceId);
    fs.writeFileSync(file, JSON.stringify(record), "utf8");
  } catch {
    /* best-effort — in-memory cache remains authoritative for the request */
  }
}

export function hydrateWorkspaceSnapshotsFromDisk(
  target: Map<string, WorkspaceSnapshotRecord>,
): number {
  try {
    ensureDir();
    const dir = workspaceDataDir();
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    let loaded = 0;
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const record = JSON.parse(raw) as WorkspaceSnapshotRecord;
        const userId = record.payload.userId;
        const workspaceId = record.payload.workspaceId;
        if (!userId || !workspaceId) continue;
        const key = `${userId}::${workspaceId}`;
        if (!target.has(key)) {
          target.set(key, record);
          loaded += 1;
        }
      } catch {
        /* skip corrupt file */
      }
    }
    return loaded;
  } catch {
    return 0;
  }
}

export function workspacePersistenceMode(): "disk" | "memory" {
  if (process.env.EQUILIBRIUM_WORKSPACE_DIR || process.env.VERCEL) return "disk";
  try {
    ensureDir();
    return "disk";
  } catch {
    return "memory";
  }
}
