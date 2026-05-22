import type { Layout } from "react-grid-layout";
import type { AlertRule } from "@/types/alerts";
import type {
  OmniBarHistoryEntry,
  WatchlistEntry,
  WorkspaceSnapshotPayload,
  WorkspaceSnapshotRecord,
} from "@/types/production-platform";
import { SNAPSHOT_SCHEMA_VERSION } from "@/types/production-platform";
import type { WorkspaceWidget } from "@/types/terminal-schema";

export class SnapshotSerializerError extends Error {
  readonly code:
    | "INVALID_INPUT"
    | "SERIALIZE_FAILED"
    | "HASH_MISMATCH"
    | "VERSION_UNSUPPORTED"
    | "RESTORE_CORRUPT";

  constructor(
    code: SnapshotSerializerError["code"],
    message: string,
  ) {
    super(message);
    this.name = "SnapshotSerializerError";
    this.code = code;
  }
}

export interface SnapshotPackInput {
  workspaceId: string;
  userId: string;
  layout: Layout[];
  widgets: WorkspaceWidget[];
  watchlist: WatchlistEntry[];
  omniBarHistory: OmniBarHistoryEntry[];
  alertRules: AlertRule[];
  selectedCoin: string | null;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${entries.join(",")}}`;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function validateLayout(layout: Layout[]): void {
  for (const item of layout) {
    if (!item.i || typeof item.x !== "number" || typeof item.y !== "number") {
      throw new SnapshotSerializerError("INVALID_INPUT", "Layout item missing grid coordinates");
    }
  }
}

function validateWidgets(widgets: WorkspaceWidget[]): void {
  for (const widget of widgets) {
    if (!widget.id || !widget.type || !widget.title) {
      throw new SnapshotSerializerError("INVALID_INPUT", "Widget missing id/type/title");
    }
  }
}

export class SnapshotSerializer {
  static async pack(input: SnapshotPackInput): Promise<WorkspaceSnapshotRecord> {
    validateLayout(input.layout);
    validateWidgets(input.widgets);

    const payload: WorkspaceSnapshotPayload = {
      version: SNAPSHOT_SCHEMA_VERSION,
      workspaceId: input.workspaceId,
      userId: input.userId,
      savedAt: Date.now(),
      layout: input.layout.map((l) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        minW: l.minW,
        minH: l.minH,
        maxW: l.maxW,
        maxH: l.maxH,
        static: l.static,
      })),
      widgets: input.widgets.map((w) => ({
        id: w.id,
        type: w.type,
        title: w.title,
      })),
      watchlist: input.watchlist.slice(0, 512),
      omniBarHistory: input.omniBarHistory.slice(0, 128),
      alertRules: input.alertRules,
      selectedCoin: input.selectedCoin,
      meta: {
        terminalBuild: "eq-2026.13",
        gridCols: 12,
      },
    };

    let serialized: string;
    try {
      serialized = stableStringify(payload);
    } catch {
      throw new SnapshotSerializerError("SERIALIZE_FAILED", "Failed to serialize workspace snapshot");
    }

    const contentHash = await sha256Hex(serialized);
    return {
      payload,
      serialized,
      contentHash,
      byteLength: serialized.length,
    };
  }

  static async unpack(record: WorkspaceSnapshotRecord): Promise<WorkspaceSnapshotPayload> {
    if (record.payload.version > SNAPSHOT_SCHEMA_VERSION) {
      throw new SnapshotSerializerError(
        "VERSION_UNSUPPORTED",
        `Snapshot version ${record.payload.version} is newer than terminal support`,
      );
    }

    let reserialized: string;
    try {
      reserialized = stableStringify(record.payload);
    } catch {
      throw new SnapshotSerializerError("RESTORE_CORRUPT", "Snapshot payload could not be re-encoded");
    }

    const hash = await sha256Hex(reserialized);
    if (hash !== record.contentHash) {
      throw new SnapshotSerializerError(
        "HASH_MISMATCH",
        "Snapshot hash validation failed — data may be corrupted",
      );
    }

    validateLayout(record.payload.layout as Layout[]);
    validateWidgets(record.payload.widgets);
    return record.payload;
  }

  static async verifyRecord(record: WorkspaceSnapshotRecord): Promise<boolean> {
    try {
      await SnapshotSerializer.unpack(record);
      return true;
    } catch {
      return false;
    }
  }

  static fromSerialized(serialized: string, contentHash: string): WorkspaceSnapshotRecord {
    let payload: WorkspaceSnapshotPayload;
    try {
      payload = JSON.parse(serialized) as WorkspaceSnapshotPayload;
    } catch {
      throw new SnapshotSerializerError("RESTORE_CORRUPT", "Serialized snapshot is not valid JSON");
    }
    return {
      payload,
      serialized,
      contentHash,
      byteLength: serialized.length,
    };
  }
}
