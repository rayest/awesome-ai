import { readPredictionSnapshot } from "@/lib/prediction-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const snapshot = await readPredictionSnapshot();

  return NextResponse.json({
    ok: true,
    ...snapshot
  });
}
