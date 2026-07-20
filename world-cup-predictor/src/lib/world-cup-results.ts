import type { ActualMatchResult, PredictionMatch, TeamSnapshot } from "@/data/predictions";

const DEFAULT_SOURCE_URL = "https://worldcup26.ir/get/games";

type WorldCupApiGame = {
  id?: string;
  type?: string;
  finished?: string | boolean;
  local_date?: string;
  home_score?: string | number | null;
  away_score?: string | number | null;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
};

const teamEnglishNames: Record<string, string[]> = {
  ALG: ["Algeria"],
  ARG: ["Argentina"],
  AUS: ["Australia"],
  AUT: ["Austria"],
  BEL: ["Belgium"],
  BIH: ["Bosnia and Herzegovina", "Bosnia"],
  BRA: ["Brazil"],
  CAN: ["Canada"],
  CIV: ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  COD: ["Democratic Republic of the Congo", "DR Congo", "Congo DR"],
  COL: ["Colombia"],
  CPV: ["Cape Verde", "Cabo Verde"],
  CRO: ["Croatia"],
  ECU: ["Ecuador"],
  EGY: ["Egypt"],
  ENG: ["England"],
  ESP: ["Spain"],
  FRA: ["France"],
  GER: ["Germany"],
  GHA: ["Ghana"],
  JPN: ["Japan"],
  MAR: ["Morocco"],
  MEX: ["Mexico"],
  NED: ["Netherlands"],
  NOR: ["Norway"],
  PAR: ["Paraguay"],
  POR: ["Portugal"],
  RSA: ["South Africa"],
  SEN: ["Senegal"],
  SUI: ["Switzerland"],
  SWE: ["Sweden"],
  USA: ["United States", "USA", "United States of America"]
};

export async function fetchCompletedResultsForMatches(matches: PredictionMatch[]) {
  const sourceUrl = process.env.WORLD_CUP_SCORE_API_URL ?? DEFAULT_SOURCE_URL;
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Score source returned ${response.status}`);
  }

  const payload = await response.json() as { games?: WorldCupApiGame[] };
  const games = payload.games ?? [];
  const fetchedAt = new Date().toISOString();
  const results: Record<string, ActualMatchResult> = {};

  for (const match of matches) {
    const game = games.find((candidate) => isSameFixture(match, candidate));
    if (!game || !isFinished(game)) continue;

    const actual = resultFromGame(match, game, sourceUrl, fetchedAt);
    if (actual) results[match.id] = actual;
  }

  return {
    checked: games.length,
    results,
    sourceUrl
  };
}

function resultFromGame(
  match: PredictionMatch,
  game: WorldCupApiGame,
  sourceUrl: string,
  fetchedAt: string
): ActualMatchResult | null {
  const homeScore = numericScore(game.home_score);
  const awayScore = numericScore(game.away_score);
  if (homeScore == null || awayScore == null) return null;

  const homeName = normalizeTeamName(game.home_team_name_en ?? game.home_team_label);
  const awayName = normalizeTeamName(game.away_team_name_en ?? game.away_team_label);
  const leftIsHome = matchesTeam(match.left, homeName) && matchesTeam(match.right, awayName);
  const leftGoals = leftIsHome ? homeScore : awayScore;
  const rightGoals = leftIsHome ? awayScore : homeScore;
  const score = `${leftGoals}-${rightGoals}`;

  let winner = match.predictedWinner;
  let method: ActualMatchResult["method"] = "常规时间";

  if (leftGoals > rightGoals) {
    winner = match.left.name;
  } else if (rightGoals > leftGoals) {
    winner = match.right.name;
  } else {
    method = match.method === "点球" || match.method === "加时" ? match.method : "点球";
  }

  return {
    score,
    winner,
    method,
    completedAt: game.local_date ?? fetchedAt,
    sourceName: "worldcup26.ir",
    sourceUrl,
    fetchedAt,
    externalId: game.id
  };
}

function isSameFixture(match: PredictionMatch, game: WorldCupApiGame) {
  const homeName = normalizeTeamName(game.home_team_name_en ?? game.home_team_label);
  const awayName = normalizeTeamName(game.away_team_name_en ?? game.away_team_label);
  if (!homeName || !awayName) return false;

  return (
    (matchesTeam(match.left, homeName) && matchesTeam(match.right, awayName)) ||
    (matchesTeam(match.left, awayName) && matchesTeam(match.right, homeName))
  );
}

function matchesTeam(team: TeamSnapshot, value: string) {
  const normalizedAliases = teamEnglishNames[team.shortName]?.map(normalizeTeamName) ?? [];
  return normalizedAliases.includes(value);
}

function normalizeTeamName(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function isFinished(game: WorldCupApiGame) {
  return String(game.finished).toUpperCase() === "TRUE";
}

function numericScore(value: WorldCupApiGame["home_score"]) {
  if (value == null || value === "null") return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}
