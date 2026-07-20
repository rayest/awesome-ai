import type { ActualMatchResult, BracketRound, Confidence, LivePrediction, PredictionMatch, TeamSnapshot } from "@/data/predictions";

const MODEL_VERSION = "hourly-bracket-v1";

type MatchOutcome = {
  match: PredictionMatch;
  left: TeamSnapshot;
  right: TeamSnapshot;
  winner: TeamSnapshot;
  loser: TeamSnapshot;
  prediction: LivePrediction;
};

export function generateHourlyPredictions(
  baseMatches: PredictionMatch[],
  baseRounds: BracketRound[],
  actualResults: Record<string, ActualMatchResult>,
  generatedAt: string
): Record<string, LivePrediction> {
  const matchesById = new Map(baseMatches.map((match) => [match.id, match]));
  const teamByName = createTeamMap(baseMatches);
  const predictions: Record<string, LivePrediction> = {};
  const outcomes = new Map<string, MatchOutcome>();
  const losers = new Map<string, TeamSnapshot>();

  for (const round of baseRounds) {
    if (round.label === "季军战") {
      const match = matchesById.get(round.matches[0]?.matchId ?? "");
      const sfOutcomes = (baseRounds.find((item) => item.label === "半决赛")?.matches ?? [])
        .map((node) => outcomes.get(node.matchId))
        .filter(Boolean) as MatchOutcome[];
      if (match && sfOutcomes.length === 2) {
        predictMatch(match, sfOutcomes[0].loser, sfOutcomes[1].loser, actualResults, predictions, outcomes, losers, generatedAt);
      }
      continue;
    }

    const previousRound = previousBracketRound(baseRounds, round.label);
    for (const [index, node] of round.matches.entries()) {
      const match = matchesById.get(node.matchId);
      if (!match) continue;

      const participants = resolveParticipants(match, index, previousRound, outcomes, teamByName);
      predictMatch(match, participants.left, participants.right, actualResults, predictions, outcomes, losers, generatedAt);
    }
  }

  return predictions;
}

function predictMatch(
  match: PredictionMatch,
  left: TeamSnapshot,
  right: TeamSnapshot,
  actualResults: Record<string, ActualMatchResult>,
  predictions: Record<string, LivePrediction>,
  outcomes: Map<string, MatchOutcome>,
  losers: Map<string, TeamSnapshot>,
  generatedAt: string
) {
  const actual = actualResults[match.id];
  const prediction = actual
    ? predictionFromActual(actual, generatedAt, left, right)
    : modelPrediction(match, left, right, actualResults, generatedAt);
  const winner = prediction.winner === right.name ? right : left;
  const loser = winner.name === left.name ? right : left;

  predictions[match.id] = prediction;
  outcomes.set(match.id, { match, left, right, winner, loser, prediction });
  losers.set(match.id, loser);
}

function resolveParticipants(
  match: PredictionMatch,
  index: number,
  previousRound: BracketRound | undefined,
  outcomes: Map<string, MatchOutcome>,
  teamByName: Map<string, TeamSnapshot>
) {
  if (!previousRound) return { left: match.left, right: match.right };

  const leftPrevious = previousRound.matches[index * 2];
  const rightPrevious = previousRound.matches[index * 2 + 1];
  const left = leftPrevious ? outcomes.get(leftPrevious.matchId)?.winner : undefined;
  const right = rightPrevious ? outcomes.get(rightPrevious.matchId)?.winner : undefined;

  return {
    left: left ?? teamByName.get(match.left.name) ?? match.left,
    right: right ?? teamByName.get(match.right.name) ?? match.right
  };
}

function previousBracketRound(rounds: BracketRound[], label: string) {
  const index = rounds.findIndex((round) => round.label === label);
  if (index <= 0) return undefined;
  return rounds[index - 1];
}

function predictionFromActual(
  actual: ActualMatchResult,
  generatedAt: string,
  left: TeamSnapshot,
  right: TeamSnapshot
): LivePrediction {
  return {
    score: actual.score,
    winner: actual.winner,
    method: actual.method,
    confidence: "高",
    generatedAt,
    modelVersion: MODEL_VERSION,
    left,
    right,
    rationale: [
      `该场已完赛，重预测锁定实际赛果：${left.name} ${actual.score} ${right.name}。`,
      "后续路径以实际晋级球队继续递推。"
    ]
  };
}

function modelPrediction(
  match: PredictionMatch,
  left: TeamSnapshot,
  right: TeamSnapshot,
  actualResults: Record<string, ActualMatchResult>,
  generatedAt: string
): LivePrediction {
  const leftScore = teamPower(left, actualResults);
  const rightScore = teamPower(right, actualResults);
  const diff = leftScore - rightScore;
  const winner = diff >= 0 ? left : right;
  const confidence = confidenceFromDiff(diff);
  const method = methodFromDiff(diff, match.round);
  const score = scoreFromDiff(diff, method, winner.name === left.name);

  return {
    score,
    winner: winner.name,
    method,
    confidence,
    generatedAt,
    modelVersion: MODEL_VERSION,
    left,
    right,
    rationale: [
      `小时级模型重算：${left.name} 综合分 ${leftScore.toFixed(1)}，${right.name} 综合分 ${rightScore.toFixed(1)}。`,
      `关键输入包含实力档、近期状态、阵容深度、战术匹配、舆论热度和已赛晋级加成。`,
      confidence === "低" ? "分差很小，按低信心处理，保留加时/点球波动。" : "分差足以给出常规路径倾向。"
    ]
  };
}

function teamPower(team: TeamSnapshot, actualResults: Record<string, ActualMatchResult>) {
  let score = 50;
  score += bandScore(team.rankBand);
  score += textScore(team.form, ["稳定", "强", "高", "大胜", "零封", "上行", "效率"], ["不足", "波动", "隐患", "出局", "不敌"]);
  score += textScore(team.fitness, ["完整", "深度", "充足", "丰富", "可靠"], ["有限", "疲劳", "短板", "承压", "一般"]);
  score += textScore(team.tacticalProfile, ["控", "压迫", "转换", "爆点", "定位球", "防守纪律"], ["低位", "慢", "受限"]);
  score += textScore(team.sentiment, ["热门", "信心", "热度", "支持", "上升"], ["质疑", "担忧", "压力"]);
  score += completedBoost(team, actualResults);
  return score;
}

function bandScore(rankBand: string) {
  if (rankBand.includes("世界前列")) return 18;
  if (rankBand.includes("强队")) return 13;
  if (rankBand.includes("中上游")) return 9;
  if (rankBand.includes("中游")) return 4;
  if (rankBand.includes("黑马")) return 2;
  return 0;
}

function textScore(text: string, positives: string[], negatives: string[]) {
  const positiveScore = positives.reduce((sum, word) => sum + (text.includes(word) ? 1.7 : 0), 0);
  const negativeScore = negatives.reduce((sum, word) => sum + (text.includes(word) ? 1.4 : 0), 0);
  return positiveScore - negativeScore;
}

function completedBoost(team: TeamSnapshot, actualResults: Record<string, ActualMatchResult>) {
  const completed = Object.values(actualResults).filter((result) => result.winner === team.name);
  if (completed.length === 0) return 0;
  return completed.reduce((sum, result) => {
    const [leftGoals = 0, rightGoals = 0] = result.score.split("-").map(Number);
    const margin = Math.abs(leftGoals - rightGoals);
    return sum + 2.5 + Math.min(margin, 3);
  }, 0);
}

function confidenceFromDiff(diff: number): Confidence {
  const abs = Math.abs(diff);
  if (abs >= 12) return "高";
  if (abs >= 6) return "中";
  return "低";
}

function methodFromDiff(diff: number, round: string): LivePrediction["method"] {
  const abs = Math.abs(diff);
  if (abs <= 2.4) return "点球";
  if (abs <= 4.8 || round === "季军战") return "加时";
  return "常规时间";
}

function scoreFromDiff(diff: number, method: LivePrediction["method"], leftWins: boolean) {
  const abs = Math.abs(diff);
  if (method === "点球") return "1-1";
  if (method === "加时") return leftWins ? "1-0" : "0-1";
  if (abs >= 14) return leftWins ? "3-0" : "0-3";
  if (abs >= 8) return leftWins ? "2-0" : "0-2";
  return leftWins ? "2-1" : "1-2";
}

function createTeamMap(matches: PredictionMatch[]) {
  const map = new Map<string, TeamSnapshot>();
  for (const match of matches) {
    map.set(match.left.name, match.left);
    map.set(match.right.name, match.right);
  }
  return map;
}
