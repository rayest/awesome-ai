import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { bracketRounds, matches } from "../src/data/predictions";
import { generateHourlyPredictions } from "../src/lib/live-predictor";
import { mergePredictionSnapshots } from "../src/lib/prediction-state";
import { readPredictionSnapshot, writePredictionSnapshot } from "../src/lib/prediction-store";
import { fetchCompletedResultsForMatches } from "../src/lib/world-cup-results";

loadLocalEnv();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
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
  const repredicted = Object.keys(livePredictions).length;

  if (checked <= 0) {
    throw new Error("No source games were checked; score source may be unavailable.");
  }

  if (repredicted !== matches.length) {
    throw new Error(`Expected to repredict ${matches.length} matches, but got ${repredicted}.`);
  }

  if (!persistence.persisted) {
    throw new Error(`Prediction snapshot was not persisted: ${persistence.reason ?? "unknown reason"}`);
  }

  console.log(JSON.stringify({
    ok: true,
    updatedAt: snapshot.updatedAt,
    checked,
    completed: Object.keys(results).length,
    changed,
    repredicted,
    persisted: persistence.persisted,
    persistence
  }, null, 2));
}

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
