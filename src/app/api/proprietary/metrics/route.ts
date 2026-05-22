import { NextResponse } from "next/server";
import {
  getProprietaryMetrics,
  getProprietaryVitals,
} from "@/lib/infrastructure/server/proprietaryIntelStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ...getProprietaryVitals(),
    metrics: getProprietaryMetrics(),
    product: "equilibrium-terminal-proprietary-v1",
  });
}
