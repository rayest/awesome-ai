"use client";

import { useMemo, useState } from "react";
import type { BracketRound, Confidence, PredictionMatch, TeamSnapshot } from "@/data/predictions";
import { flagImageSrc } from "./visuals";
import VisualImage from "./VisualImage";
import PitchScene from "./PitchScene";
import TeamStarsPanel from "./StarTimelinePanel";

const confidenceTone: Record<Confidence, string> = {
  高: "high",
  中: "mid",
  低: "low"
};

function TeamLane({
  team,
  isWinner
}: {
  team: TeamSnapshot;
  isWinner: boolean;
}) {
  return (
    <div className={`bracket-team-lane ${isWinner ? "lane-winner" : ""}`}>
      <VisualImage alt={`${team.name} 国旗`} className="lane-flag-img" src={flagImageSrc(team)} />
      <strong>{team.name}</strong>
      <small>{team.shortName}</small>
    </div>
  );
}

export default function BracketExplorer({
  rounds,
  matches
}: {
  rounds: BracketRound[];
  matches: PredictionMatch[];
}) {
  const matchMap = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);
  const initialMatch = matchMap.get("final-bra-arg") ?? matches[0];
  const [activeId, setActiveId] = useState(initialMatch.id);
  const activeMatch = matchMap.get(activeId) ?? initialMatch;

  return (
    <div className="bracket-explorer">
      <div className="bracket-board">
        <PitchScene />
        <div className="vertical-bracket">
          {rounds.map((round, roundIndex) => (
            <section className={`bracket-stage bracket-stage-depth-${roundIndex + 1}`} key={round.label}>
              <header className="bracket-stage-header">
                <strong>{round.label}</strong>
                <span>{round.window}</span>
                <em>{round.matches.length} 场</em>
              </header>

              <div className="bracket-node-stack">
                {round.matches.map((node) => {
                  const match = matchMap.get(node.matchId);
                  if (!match) return null;
                  const currentWinner = match.actualResult?.winner ?? match.predictedWinner;
                  const leftWon = currentWinner === match.left.name;
                  const rightWon = currentWinner === match.right.name;
                  const isActive = activeId === match.id;
                  const statusText = match.actualResult ? "已赛事实" : match.status === "confirmed-context" ? "已赛事实" : "预测";

                  return (
                    <button
                      aria-pressed={isActive}
                      className={`bracket-node node-tone-${confidenceTone[node.confidence]} ${isActive ? "is-active" : ""}`}
                      key={node.id}
                      onClick={() => setActiveId(match.id)}
                      type="button"
                    >
                      <span className={`node-status node-status-${match.status}`}>{statusText}</span>
                      <TeamLane
                        isWinner={leftWon}
                        team={match.left}
                      />
                      <div className="node-score-row">
                        <span>{match.method}</span>
                        <strong>{node.score}</strong>
                        <span>晋级 {node.winner}</span>
                      </div>
                      <TeamLane
                        isWinner={rightWon}
                        team={match.right}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="bracket-detail" aria-live="polite">
        <div className="detail-topline">
          <span>{activeMatch.round}</span>
          <strong>{activeMatch.date}</strong>
          <span className={`match-status match-status-${activeMatch.status}`}>
            {activeMatch.actualResult ? "已赛事实" : activeMatch.status === "confirmed-context" ? "已赛事实" : "预测"}
          </span>
          <span className={`confidence confidence-${confidenceTone[activeMatch.confidence]}`}>
            信心 {activeMatch.confidence}
          </span>
        </div>

        <div className="detail-scoreboard">
          <div className="detail-team-visual">
            <VisualImage alt={`${activeMatch.left.name} 国旗`} className="detail-flag-img" src={flagImageSrc(activeMatch.left)} />
            <strong>{activeMatch.left.name}</strong>
            <small>{activeMatch.left.shortName}</small>
          </div>
          <div className="detail-score-wrap">
            <b>{activeMatch.actualResult?.score ?? activeMatch.predictedScore}</b>
            {(activeMatch.actualResult || activeMatch.livePrediction) && activeMatch.originalPrediction ? (
              <small>原预测 {activeMatch.originalPrediction.score} · {activeMatch.originalPrediction.winner}</small>
            ) : null}
          </div>
          <div className="detail-team-visual">
            <VisualImage alt={`${activeMatch.right.name} 国旗`} className="detail-flag-img" src={flagImageSrc(activeMatch.right)} />
            <strong>{activeMatch.right.name}</strong>
            <small>{activeMatch.right.shortName}</small>
          </div>
        </div>

        <div className="key-player-grid">
          <section>
            <h3>{activeMatch.left.name} 核心球员</h3>
            <div>
              {activeMatch.left.keyPlayers.map((player) => (
                <span key={player}>{player}</span>
              ))}
            </div>
          </section>
          <section>
            <h3>{activeMatch.right.name} 核心球员</h3>
            <div>
              {activeMatch.right.keyPlayers.map((player) => (
                <span key={player}>{player}</span>
              ))}
            </div>
          </section>
        </div>

        <div className="stars-duel-grid">
          <TeamStarsPanel team={activeMatch.left} />
          <TeamStarsPanel team={activeMatch.right} />
        </div>

        <div className="detail-columns">
          <section>
            <h3>预测依据</h3>
            <ul>
              {activeMatch.rationale.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>关键风险</h3>
            <ul>
              {activeMatch.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
