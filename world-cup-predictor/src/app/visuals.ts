import type { TeamSnapshot } from "@/data/predictions";

export const WORLD_CUP_LOGO_SRC =
  "https://commons.wikimedia.org/wiki/Special:FilePath/2026%20FIFA%20World%20Cup%20emblem%20%28with%20wordmark%29.svg";

export const WORLD_CUP_TROPHY_SRC =
  "/images/world-cup-trophy-clean.png";

export const REAL_IMAGE_FALLBACK_SRC = WORLD_CUP_TROPHY_SRC;

export const REAL_STADIUM_BACKGROUND_SRC =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Lusail%20Stadium%20at%20night.jpg";

const flagCodes: Record<string, string> = {
  ARG: "ar",
  AUS: "au",
  ALG: "dz",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CIV: "ci",
  COL: "co",
  COD: "cd",
  CRO: "hr",
  CPV: "cv",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  ECU: "ec",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  JPN: "jp",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  PAR: "py",
  POR: "pt",
  RSA: "za",
  SEN: "sn",
  SUI: "ch",
  SWE: "se",
  USA: "us"
};

export function flagImageSrc(team: TeamSnapshot) {
  const code = flagCodes[team.shortName] ?? "un";
  return `https://flagcdn.com/w80/${code}.png`;
}

const playerPages: Record<string, string> = {
  ALG: "Riyad Mahrez",
  ARG: "Lionel Messi",
  AUS: "Craig Goodwin",
  AUT: "David Alaba",
  BEL: "Kevin De Bruyne",
  BIH: "Edin Džeko",
  BRA: "Vinícius Júnior",
  CAN: "Alphonso Davies",
  CIV: "Franck Kessié",
  COD: "Cédric Bakambu",
  COL: "Luis Díaz (footballer, born 1997)",
  CRO: "Luka Modrić",
  CPV: "Bebé (footballer)",
  ECU: "Moisés Caicedo",
  EGY: "Mohamed Salah",
  ENG: "Jude Bellingham",
  ESP: "Rodri (footballer, born 1996)",
  FRA: "Kylian Mbappé",
  GER: "Jamal Musiala",
  GHA: "Mohammed Kudus",
  JPN: "Takefusa Kubo",
  MAR: "Achraf Hakimi",
  MEX: "Raúl Jiménez",
  NED: "Virgil van Dijk",
  NOR: "Erling Haaland",
  PAR: "Miguel Almirón",
  POR: "Cristiano Ronaldo",
  RSA: "Teboho Mokoena",
  SEN: "Sadio Mané",
  SUI: "Granit Xhaka",
  SWE: "Alexander Isak",
  USA: "Christian Pulisic"
};

const directPlayerImages: Record<string, string> = {
  "Teboho Mokoena": "https://cms.sabcsport.com/storage/images/teboho-mokoena_800x450.webp"
};

const teamPhotoQueries: Record<string, string> = {
  ALG: "algeria,football,stadium",
  ARG: "argentina,football,fans",
  AUS: "australia,soccer,stadium",
  AUT: "austria,football,stadium",
  BEL: "belgium,football,fans",
  BIH: "bosnia,football,stadium",
  BRA: "brazil,football,stadium",
  CAN: "canada,soccer,stadium",
  CIV: "ivory-coast,football",
  COD: "congo,football",
  COL: "colombia,football,fans",
  CRO: "croatia,football,fans",
  CPV: "cape-verde,football",
  ECU: "ecuador,football,stadium",
  EGY: "egypt,football,stadium",
  ENG: "england,football,stadium",
  ESP: "spain,football,stadium",
  FRA: "france,football,stadium",
  GER: "germany,football,stadium",
  GHA: "ghana,football",
  JPN: "japan,football,stadium",
  MAR: "morocco,football,fans",
  MEX: "mexico,football,stadium",
  NED: "netherlands,football,fans",
  NOR: "norway,football,stadium",
  PAR: "paraguay,football",
  POR: "portugal,football,fans",
  RSA: "south-africa,football,stadium",
  SEN: "senegal,football",
  SUI: "switzerland,football,stadium",
  SWE: "sweden,football,stadium",
  USA: "usa,soccer,stadium"
};

export function playerAvatarSrc(team: TeamSnapshot) {
  return playerImageSrc(playerPages[team.shortName] ?? team.keyPlayers[0] ?? team.name);
}

export function playerImageSrc(wikiTitle: string) {
  if (directPlayerImages[wikiTitle]) {
    return directPlayerImages[wikiTitle];
  }

  return `wiki-summary:${wikiTitle}`;
}

export function teamImageSrc(team: TeamSnapshot) {
  return `https://loremflickr.com/640/360/${teamPhotoQueries[team.shortName] ?? `${team.name},football,stadium`}`;
}
