import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import { SnapshotSerializer } from "@/lib/infrastructure/SnapshotSerializer";
import {
  enqueuePersistenceJob,
} from "@/lib/infrastructure/server/persistenceWorker";
import {
  loadWorkspaceSnapshot,
  saveWorkspaceSnapshot,
  getWorkspacePersistenceMode,
} from "@/lib/infrastructure/server/workspaceStore";
import type { WorkspaceSnapshotRecord } from "@/types/production-platform";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

async function requireClaims() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  if (!token) return null;
  return authEngine.verifyAccessToken(token);
}

export async function GET() {
  const claims = await requireClaims();
  if (!claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const decision = authEngine.authorizeWorkspaceAction(
    claims,
    { workspaceId: claims.workspaceId },
    "editWatchlists",
  );
  if (!decision.allowed) {
    return NextResponse.json({ error: decision.reason }, { status: 403 });
  }

  const record = loadWorkspaceSnapshot(claims.sub, claims.workspaceId);
  if (!record) {
    return NextResponse.json({ snapshot: null }, { status: 404 });
  }

  const valid = await SnapshotSerializer.verifyRecord(record);
  if (!valid) {
    return NextResponse.json({ error: "snapshot_corrupt" }, { status: 409 });
  }

  return NextResponse.json({ snapshot: record });
}

export async function PUT(request: Request) {
  const claims = await requireClaims();
  if (!claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const decision = authEngine.authorizeWorkspaceAction(
    claims,
    { workspaceId: claims.workspaceId },
    "editWatchlists",
  );
  if (!decision.allowed) {
    return NextResponse.json({ error: decision.reason }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      record?: WorkspaceSnapshotRecord;
      pack?: Parameters<typeof SnapshotSerializer.pack>[0];
    };

    let record: WorkspaceSnapshotRecord;
    if (body.record) {
      record = body.record;
    } else if (body.pack) {
      record = await SnapshotSerializer.pack({
        ...body.pack,
        userId: claims.sub,
        workspaceId: claims.workspaceId,
      });
    } else {
      return NextResponse.json({ error: "record_or_pack_required" }, { status: 400 });
    }

    if (record.payload.workspaceId !== claims.workspaceId) {
      return NextResponse.json({ error: "workspace_mismatch" }, { status: 403 });
    }

    await SnapshotSerializer.verifyRecord(record);
    saveWorkspaceSnapshot(claims.sub, claims.workspaceId, record);
    enqueuePersistenceJob("snapshot_write", claims.sub, record.serialized);

    return NextResponse.json({
      ok: true,
      contentHash: record.contentHash,
      byteLength: record.byteLength,
      persistence: getWorkspacePersistenceMode(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "snapshot_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
