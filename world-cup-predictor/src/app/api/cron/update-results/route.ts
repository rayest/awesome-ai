import { bracketRounds, matches } from "@/data/predictions";
import { generateHourlyPredictions } from "@/lib/live-predictor";
import { mergePredictionSnapshots } from "@/lib/prediction-state";
import { readPredictionSnapshot, writePredictionSnapshot } from "@/lib/prediction-store";
import { fetchCompletedResultsForMatches } from "@/lib/world-cup-results";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const previous = await readPredictionSnapshot();
  const { checked, results, sourceUrl } = await fetchCompletedResultsForMatches(matches);
  const previousResults = previous.results ?? {};
  const changed = Object.entries(results).filter(([matchId, result]) => {
    const oldResult = previousResults[matchId];
    return !oldResult || oldResult.score !== result.score || oldResult.winner !== result.winner;
  }).length;
  const now = new Date().toISOString();
  const livePredictions = generateHourlyPredictions(matches, bracketRounds, {
    ...previousResults,
    ...results
  }, now);

  const snapshot = mergePredictionSnapshots(previous, results, livePredictions, {
    at: now,
    checked,
    completed: Object.keys(results).length,
    changed,
    repredicted: Object.keys(livePredictions).length,
    note: `Fetched ${checked} source games from ${sourceUrl}`
  });

  const persistence = await writePredictionSnapshot(snapshot);

  return NextResponse.json({
    ok: true,
    updatedAt: snapshot.updatedAt,
    checked,
    completed: Object.keys(results).length,
    changed,
    repredicted: Object.keys(livePredictions).length,
    persisted: persistence.persisted,
    persistence,
    results: snapshot.results
  });
}
