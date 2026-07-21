import type { ActualMatchResult, BracketRound, LivePrediction, PredictionMatch } from "@/data/predictions";

export type PredictionResultSnapshot = {
  version: 1;
  updatedAt: string;
  source: string;
  sourceUrl: string;
  results: Record<string, ActualMatchResult>;
  predictions: Record<string, LivePrediction>;
  runLog: Array<{
    at: string;
    checked: number;
    completed: number;
    changed: number;
    repredicted?: number;
    note: string;
  }>;
};

export const EMPTY_PREDICTION_SNAPSHOT: PredictionResultSnapshot = {
  version: 1,
  updatedAt: "",
  source: "static",
  sourceUrl: "",
  results: {},
  predictions: {},
  runLog: []
};

export function applyPredictionSnapshot(
  baseMatches: PredictionMatch[],
  baseRounds: BracketRound[],
  snapshot: PredictionResultSnapshot | null
) {
  const results = snapshot?.results ?? {};
  const livePredictions = snapshot?.predictions ?? {};
  const matches = baseMatches.map((match) => {
    const actualResult = results[match.id];
    const livePrediction = livePredictions[match.id];
    const originalPrediction = {
      score: match.predictedScore,
      winner: match.predictedWinner,
      method: match.method
    };

    if (actualResult) {
      return {
        ...match,
        actualResult,
        livePrediction,
        originalPrediction,
        left: livePrediction?.left ?? match.left,
        right: livePrediction?.right ?? match.right,
        status: "confirmed-context" as const,
        stageNote: "已赛事实 · 原预测保留",
        tags: Array.from(new Set(["已赛", ...match.tags]))
      };
    }

    if (livePrediction) {
      return {
        ...match,
        livePrediction,
        originalPrediction,
        left: livePrediction.left ?? match.left,
        right: livePrediction.right ?? match.right,
        predictedScore: livePrediction.score,
        predictedWinner: livePrediction.winner,
        method: livePrediction.method,
        confidence: livePrediction.confidence,
        stageNote: "小时级重预测 · 原预测保留",
        rationale: livePrediction.rationale,
        tags: Array.from(new Set(["重预测", ...match.tags]))
      };
    }

    return match;
  });

  const matchMap = new Map(matches.map((match) => [match.id, match]));
  const bracketRounds = baseRounds.map((round) => ({
    ...round,
    matches: round.matches.map((node) => {
      const match = matchMap.get(node.matchId);
      const actualResult = match?.actualResult;
      const livePrediction = match?.livePrediction;

      if (!actualResult && !livePrediction) return node;

      return {
        ...node,
        left: match?.left.name ?? node.left,
        right: match?.right.name ?? node.right,
        score: actualResult ? formatBracketActualScore(actualResult) : formatBracketLiveScore(livePrediction),
        winner: actualResult?.winner ?? livePrediction?.winner ?? node.winner,
        confidence: livePrediction?.confidence ?? node.confidence
      };
    })
  }));

  return { matches, bracketRounds };
}

function formatBracketActualScore(result: ActualMatchResult) {
  const suffix = result.method === "点球" ? " 点" : result.method === "加时" ? " 加" : "";
  return `${result.score}${suffix}`;
}

function formatBracketLiveScore(result?: LivePrediction) {
  if (!result) return "";
  const suffix = result.method === "点球" ? " 点" : result.method === "加时" ? " 加" : "";
  return `${result.score}${suffix}`;
}

export function mergePredictionSnapshots(
  previous: PredictionResultSnapshot | null,
  incomingResults: Record<string, ActualMatchResult>,
  incomingPredictions: Record<string, LivePrediction>,
  run: PredictionResultSnapshot["runLog"][number]
): PredictionResultSnapshot {
  const previousResults = previous?.results ?? {};

  return {
    version: 1,
    updatedAt: run.at,
    source: "worldcup26.ir",
    sourceUrl: "https://worldcup26.ir/get/games",
    results: {
      ...previousResults,
      ...incomingResults
    },
    predictions: incomingPredictions,
    runLog: [run, ...(previous?.runLog ?? [])].slice(0, 48)
  };
}
