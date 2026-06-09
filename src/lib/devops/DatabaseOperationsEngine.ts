import type { DatabaseOpsStatus } from "@/types/devops-operations";

let lastBackupAt: number | null = null;

export class DatabaseOperationsEngine {
  static touchBackup(): void {
    lastBackupAt = Date.now();
  }

  static snapshot(pendingWrites = 0): DatabaseOpsStatus {
    const replication: DatabaseOpsStatus["replication"] =
      pendingWrites > 48 ? "offline" : pendingWrites > 12 ? "lagging" : "synced";

    return {
      replication,
      backupLastAt: lastBackupAt,
      backupRetentionDays: 30,
      pendingMigrations: 0,
      failoverReady: replication === "synced",
    };
  }
}
