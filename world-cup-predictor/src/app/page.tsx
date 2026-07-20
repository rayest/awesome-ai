import {
  baseline,
  bracketRounds as baseBracketRounds,
  matches as baseMatches,
  sources,
  type Confidence,
  type EvidenceItem,
  type PredictionMatch
} from "@/data/predictions";
import { applyPredictionSnapshot } from "@/lib/prediction-state";
import { readPredictionSnapshot } from "@/lib/prediction-store";
import BracketExplorer from "./BracketExplorer";
import DashboardTabs from "./DashboardTabs";
import { flagImageSrc, playerAvatarSrc, REAL_IMAGE_FALLBACK_SRC, WORLD_CUP_TROPHY_SRC } from "./visuals";
import VisualImage from "./VisualImage";
import TeamStarsPanel from "./StarTimelinePanel";

const confidenceTone: Record<Confidence, string> = {
  高: "high",
  中: "mid",
  低: "low"
};

const roundOrder = ["32 强", "16 强", "8 强", "半决赛", "季军战", "决赛"];

export const dynamic = "force-dynamic";

function EvidenceBar({ item }: { item: EvidenceItem }) {
  return (
    <div className={`evidence-row advantage-${item.advantage}`}>
      <div className="evidence-label">{item.label}</div>
      <div className="evidence-values">
        <span>{item.left}</span>
        <span>{item.right}</span>
      </div>
      <p>{item.note}</p>
    </div>
  );
}

function MatchCard({ match, featured = false }: { match: PredictionMatch; featured?: boolean }) {
  const displayScore = match.actualResult?.score ?? match.predictedScore;
  const displayMethod = match.actualResult?.method ?? match.method;
  const isFinalResult = Boolean(match.actualResult);
  const isLivePrediction = Boolean(match.livePrediction && !match.actualResult);
  const originalPrediction = match.originalPrediction;

  return (
    <article className={`match-card ${featured ? "featured-card" : ""}`}>
      <div className="match-card-top">
        <span>{match.round}</span>
        <span>{match.date}</span>
        <strong>{match.stageNote}</strong>
      </div>

      <div className="scoreline" aria-label={`${match.left.name} 对 ${match.right.name} ${isFinalResult ? "实际" : "预测"} ${displayScore}`}>
        <div className="team-block">
          <VisualImage alt={`${match.left.name} 国旗`} className="flag-img" src={flagImageSrc(match.left)} />
          <div>
            <strong>{match.left.name}</strong>
            <small>{match.left.shortName}</small>
          </div>
        </div>
        <div className="score-block">
          <span>{displayScore}</span>
          <small>{isFinalResult ? `实际 ${displayMethod}` : isLivePrediction ? `重预测 ${displayMethod}` : displayMethod}</small>
          {(isFinalResult || isLivePrediction) && originalPrediction ? (
            <em>原预测 {originalPrediction.score} · {originalPrediction.winner}</em>
          ) : null}
        </div>
        <div className="team-block right-team">
          <VisualImage alt={`${match.right.name} 国旗`} className="flag-img" src={flagImageSrc(match.right)} />
          <div>
            <strong>{match.right.name}</strong>
            <small>{match.right.shortName}</small>
          </div>
        </div>
      </div>

      <div className="match-meta">
        <span className={`confidence confidence-${confidenceTone[match.confidence]}`}>信心 {match.confidence}</span>
        {isFinalResult ? <span>实际晋级：{match.actualResult?.winner}</span> : null}
        {isLivePrediction ? <span>最新重预测：{match.predictedWinner}</span> : null}
        {!isFinalResult && !isLivePrediction ? <span>预测晋级：{match.predictedWinner}</span> : null}
        {(isFinalResult || isLivePrediction) && originalPrediction ? <span>原预测晋级：{originalPrediction.winner}</span> : null}
        {(isFinalResult || isLivePrediction) ? <span>原预测保留</span> : null}
        {match.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="match-player-strip">
        <div>
          <strong>{match.left.name} 核心</strong>
          <span>{match.left.keyPlayers.join(" / ")}</span>
        </div>
        <div>
          <strong>{match.right.name} 核心</strong>
          <span>{match.right.keyPlayers.join(" / ")}</span>
        </div>
      </div>

      <div className="card-grid">
        <section>
          <h3>预测依据</h3>
          <ul>
            {match.rationale.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>翻车风险</h3>
          <ul>
            {match.risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      {featured ? (
        <div className="inline-evidence">
          {match.evidence.map((item) => (
            <EvidenceBar key={`${match.id}-${item.label}`} item={item} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default async function Home() {
  const predictionSnapshot = await readPredictionSnapshot();
  const { matches, bracketRounds } = applyPredictionSnapshot(baseMatches, baseBracketRounds, predictionSnapshot);
  const groupedMatches = matches.reduce<Record<string, PredictionMatch[]>>((acc, match) => {
    acc[match.round] = [...(acc[match.round] ?? []), match];
    return acc;
  }, {});
  const finalMatch = matches.find((match) => match.round === "决赛") ?? matches[matches.length - 1];
  const semiFinal = matches.find((match) => match.id === "sf-fra-bra") ?? matches[0];
  const allTeams = Array.from(
    matches.reduce((teamMap, match) => {
      teamMap.set(match.left.shortName, match.left);
      teamMap.set(match.right.shortName, match.right);
      return teamMap;
    }, new Map<string, PredictionMatch["left"]>())
  ).map(([, team]) => team);

  return (
    <main className="shell">
      <div className="stadium-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-emblem" aria-label="2026 美加墨世界杯徽章">
            <VisualImage alt="大力神杯" className="brand-emblem-trophy" src={WORLD_CUP_TROPHY_SRC} />
          </div>
          <div className="brand-copy">
            <h1>{baseline.title}</h1>
            <p>2026 美加墨世界杯 · 美国 / 加拿大 / 墨西哥联合主办 · 淘汰赛预测控制台</p>
            <div className="host-badges" aria-label="2026 世界杯主办国">
              <span>
                <VisualImage alt="美国 国旗" src="https://flagcdn.com/w80/us.png" />
                USA
              </span>
              <span>
                <VisualImage alt="加拿大 国旗" src="https://flagcdn.com/w80/ca.png" />
                CAN
              </span>
              <span>
                <VisualImage alt="墨西哥 国旗" src="https://flagcdn.com/w80/mx.png" />
                MEX
              </span>
            </div>
          </div>
        </div>
      </header>

      <DashboardTabs
        overview={(
          <>
            <section className="hero-section" id="预测总览">
              <div className="champion-panel">
                <span className="section-label">冠军预测</span>
                <div className="champion-layout">
                  <VisualImage
                    alt="世界杯冠军奖杯"
                    className="trophy-img"
                    fallbackSrc={WORLD_CUP_TROPHY_SRC}
                    src={WORLD_CUP_TROPHY_SRC}
                  />
                  <div>
                    <VisualImage
                      alt={`${baseline.champion.keyPlayers[0]} 头像`}
                      className="champion-player-img"
                      fallbackSrc={REAL_IMAGE_FALLBACK_SRC}
                      src={playerAvatarSrc(baseline.champion)}
                    />
                    <div className="team-heading">
                      <VisualImage alt={`${baseline.champion.name} 国旗`} className="heading-flag-img" src={flagImageSrc(baseline.champion)} />
                      <strong>{baseline.champion.name}</strong>
                      <small>{baseline.champion.shortName}</small>
                    </div>
                    <p>预测夺冠概率</p>
                    <b>{baseline.championProbability}</b>
                  </div>
                </div>
              </div>

              <div className="baseline-panel">
                <span className="section-label">最新基准时间</span>
                <strong>{baseline.timestamp}</strong>
                <small>
                  {predictionSnapshot.updatedAt
                    ? `赛果与预测最近重算 ${new Date(predictionSnapshot.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`
                    : "赛果与预测自动重算待首次写入"}
                </small>
              </div>

              <div className="contenders-panel">
                <span className="section-label">三大夺冠热门</span>
                {baseline.contenders.map((contender, index) => (
                  <div className="contender-row" key={contender.team.shortName}>
                    <span>{index + 1}</span>
                    <VisualImage
                      alt={`${contender.team.keyPlayers[0]} 头像`}
                      className="contender-player-img"
                      fallbackSrc={REAL_IMAGE_FALLBACK_SRC}
                      src={playerAvatarSrc(contender.team)}
                    />
                    <strong>
                      <VisualImage alt={`${contender.team.name} 国旗`} className="mini-flag-img" src={flagImageSrc(contender.team)} />
                      {contender.team.name}
                    </strong>
                    <b>{contender.probability}</b>
                    <small>{contender.note}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="risk-section" id="风险雷达">
              <div>
                <span className="section-label">Upset Watch</span>
                <h2>最大冷门风险</h2>
              </div>
              <div className="risk-list">
                {baseline.upsetWatch.map((risk) => (
                  <span key={risk}>{risk}</span>
                ))}
              </div>
            </section>

            <section className="final-panel">
              <div>
                <span className="section-label">Final Call</span>
                <h2>决赛预测：{finalMatch.left.name} {finalMatch.predictedScore} {finalMatch.right.name}</h2>
                <p>{finalMatch.rationale.join(" ")}</p>
              </div>
              <div className="winner-lock">
                <VisualImage
                  alt={`${baseline.champion.keyPlayers[0]} 头像`}
                  className="winner-player-img"
                  fallbackSrc={REAL_IMAGE_FALLBACK_SRC}
                  src={playerAvatarSrc(baseline.champion)}
                />
                <VisualImage alt={`${baseline.champion.name} 国旗`} className="winner-flag-img" src={flagImageSrc(baseline.champion)} />
                <strong>{baseline.champion.name} 夺冠</strong>
                <small>信心 {finalMatch.confidence} · {finalMatch.method}</small>
              </div>
            </section>
          </>
        )}
        bracket={(
          <section className="bracket-panel" id="淘汰赛对阵">
            <div className="section-heading">
              <div>
                <span className="section-label">Knockout Map</span>
                <h2>淘汰赛对阵预测图</h2>
              </div>
              <p>完整展示 32 强至决赛；已赛=事实赛果，预测=未完赛/后续递推，点 = 点球，加 = 加时。</p>
            </div>

            <BracketExplorer matches={matches} rounds={bracketRounds} />
          </section>
        )}
        predictions={(
          <section className="prediction-detail-stack" id="预测详情">
            <div className="match-focus">
              <div className="section-heading">
                <div>
                  <span className="section-label">Focus Match</span>
                  <h2>焦点战详细预测</h2>
                </div>
                <p>{semiFinal.date} · {semiFinal.round}</p>
              </div>
              <MatchCard match={semiFinal} featured />
            </div>

            {roundOrder.map((round) => {
              const roundMatches = groupedMatches[round];
              if (!roundMatches) return null;

              return (
                <section className="round-section" key={round}>
                  <div className="section-heading">
                    <div>
                      <span className="section-label">Prediction Cards</span>
                      <h2>{round} 预测</h2>
                    </div>
                    <p>{roundMatches.length} 场 · 比分、依据、风险与信心档位</p>
                  </div>
                  <div className="cards-grid">
                    {roundMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </section>
              );
            })}
          </section>
        )}
        evidence={(
          <section className="evidence-workspace" id="球星与证据">
            <section className="star-atlas-section" id="球星履历">
              <div className="section-heading">
                <div>
                  <span className="section-label">Star Arc Timeline</span>
                  <h2>当家球星履历弧线</h2>
                </div>
                <p>{allTeams.length} 支球队 · 关键球员历史战绩、冠军奖项与大赛节点</p>
              </div>
              <div className="star-atlas-grid">
                {allTeams.map((team) => (
                  <TeamStarsPanel key={team.shortName} team={team} variant="atlas" />
                ))}
              </div>
            </section>

            <aside className="evidence-panel" id="数据证据">
              <div className="section-heading compact-heading">
                <div>
                  <span className="section-label">Evidence Board</span>
                  <h2>证据数据面板</h2>
                </div>
              </div>
              <div className="team-comparison">
                <span>
                  <VisualImage alt={`${semiFinal.left.name} 国旗`} className="mini-flag-img" src={flagImageSrc(semiFinal.left)} />
                  {semiFinal.left.name}
                </span>
                <span>
                  <VisualImage alt={`${semiFinal.right.name} 国旗`} className="mini-flag-img" src={flagImageSrc(semiFinal.right)} />
                  {semiFinal.right.name}
                </span>
              </div>
              <EvidenceBar item={{ label: "世界排名区间", left: semiFinal.left.rankBand, right: semiFinal.right.rankBand, advantage: "even", note: "两队都处在争冠候选层级，排名无法单独分出胜负。" }} />
              <EvidenceBar item={{ label: "近期状态", left: semiFinal.left.form, right: semiFinal.right.form, advantage: "right", note: "巴西进攻出口更多，法国效率更稳。" }} />
              <EvidenceBar item={{ label: "伤停停赛", left: semiFinal.left.fitness, right: semiFinal.right.fitness, advantage: "even", note: "以公开信息为准，赛前首发仍需复核。" }} />
              <EvidenceBar item={{ label: "战术风格", left: semiFinal.left.tacticalProfile, right: semiFinal.right.tacticalProfile, advantage: "left", note: "巴西边路与法国转换会决定比赛上限。" }} />
              <EvidenceBar item={{ label: "舆论倾向", left: semiFinal.left.sentiment, right: semiFinal.right.sentiment, advantage: "even", note: "市场和球迷都把这场视作实际决赛级别。" }} />
            </aside>
          </section>
        )}
      />

      <footer className="source-strip">
        <span>
          数据状态：每小时赛果检查 + 预测重算
          {predictionSnapshot.updatedAt
            ? ` · 最近 ${new Date(predictionSnapshot.updatedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`
            : " · 待首次运行"}
        </span>
        <span>置信区间：±6.5%</span>
        <span>来源：{sources.join(" · ")}</span>
      </footer>
    </main>
  );
}
