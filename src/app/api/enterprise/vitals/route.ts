import { NextResponse } from "next/server";
import { getEnterpriseVitals } from "@/lib/infrastructure/server/enterpriseOpsStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getEnterpriseVitals());
}
