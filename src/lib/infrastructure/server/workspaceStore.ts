import type { WorkspaceSnapshotRecord } from "@/types/production-platform";

const snapshots = new Map<string, WorkspaceSnapshotRecord>();

export function workspaceKey(userId: string, workspaceId: string): string {
  return `${userId}::${workspaceId}`;
}

export function saveWorkspaceSnapshot(
  userId: string,
  workspaceId: string,
  record: WorkspaceSnapshotRecord,
): void {
  snapshots.set(workspaceKey(userId, workspaceId), record);
}

export function loadWorkspaceSnapshot(
  userId: string,
  workspaceId: string,
): WorkspaceSnapshotRecord | null {
  return snapshots.get(workspaceKey(userId, workspaceId)) ?? null;
}

export function listWorkspaceIds(userId: string): string[] {
  const prefix = `${userId}::`;
  const ids: string[] = [];
  for (const key of Array.from(snapshots.keys())) {
    if (key.startsWith(prefix)) {
      ids.push(key.slice(prefix.length));
    }
  }
  return ids;
}
