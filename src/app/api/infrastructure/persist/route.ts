import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import {
  drainPersistenceQueue,
  enqueuePersistenceJob,
} from "@/lib/infrastructure/server/persistenceWorker";
import type { PersistenceJobKind } from "@/lib/infrastructure/server/persistenceWorker";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  const claims = token ? await authEngine.verifyAccessToken(token) : null;

  try {
    const body = (await request.json()) as {
      jobs?: Array<{ kind: PersistenceJobKind; payload: string }>;
    };

    if (!body.jobs?.length) {
      return NextResponse.json({ error: "jobs_required" }, { status: 400 });
    }

    const userId = claims?.sub ?? "anonymous";
    const ids: string[] = [];
    for (const job of body.jobs) {
      ids.push(enqueuePersistenceJob(job.kind, userId, job.payload));
    }

    void drainPersistenceQueue();

    return NextResponse.json({ accepted: ids });
  } catch {
    return NextResponse.json({ error: "persist_failed" }, { status: 500 });
  }
}
