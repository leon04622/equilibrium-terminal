import { NextResponse } from "next/server";
import { getCollaborationVitals } from "@/lib/infrastructure/server/collaborationStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getCollaborationVitals());
}
