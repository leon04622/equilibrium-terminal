import type { WorkspaceSnapshotRecord } from "@/types/production-platform";
import {
  hydrateWorkspaceSnapshotsFromDisk,
  readWorkspaceSnapshotFromDisk,
  writeWorkspaceSnapshotToDisk,
  workspacePersistenceMode,
} from "@/lib/infrastructure/server/workspaceDiskStore";

const snapshots = new Map<string, WorkspaceSnapshotRecord>();
let hydrated = false;

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  hydrateWorkspaceSnapshotsFromDisk(snapshots);
}

export function workspaceKey(userId: string, workspaceId: string): string {
  return `${userId}::${workspaceId}`;
}

export function saveWorkspaceSnapshot(
  userId: string,
  workspaceId: string,
  record: WorkspaceSnapshotRecord,
): void {
  ensureHydrated();
  const key = workspaceKey(userId, workspaceId);
  snapshots.set(key, record);
  writeWorkspaceSnapshotToDisk(userId, workspaceId, record);
}

export function loadWorkspaceSnapshot(
  userId: string,
  workspaceId: string,
): WorkspaceSnapshotRecord | null {
  ensureHydrated();
  const key = workspaceKey(userId, workspaceId);
  const cached = snapshots.get(key);
  if (cached) return cached;

  const fromDisk = readWorkspaceSnapshotFromDisk(userId, workspaceId);
  if (fromDisk) {
    snapshots.set(key, fromDisk);
    return fromDisk;
  }
  return null;
}

export function listWorkspaceIds(userId: string): string[] {
  ensureHydrated();
  const prefix = `${userId}::`;
  const ids: string[] = [];
  for (const key of Array.from(snapshots.keys())) {
    if (key.startsWith(prefix)) {
      ids.push(key.slice(prefix.length));
    }
  }
  return ids;
}

export function getWorkspacePersistenceMode(): "disk" | "memory" {
  return workspacePersistenceMode();
}
