import {
  baseline,
  bracketRounds,
  matches,
  sources,
  type Confidence,
  type EvidenceItem,
  type PredictionMatch
} from "@/data/predictions";

const navItems = ["预测总览", "淘汰赛对阵", "数据证据", "风险雷达"];

const confidenceTone: Record<Confidence, string> = {
  高: "high",
  中: "mid",
  低: "low"
};

const groupedMatches = matches.reduce<Record<string, PredictionMatch[]>>((acc, match) => {
  acc[match.round] = [...(acc[match.round] ?? []), match];
  return acc;
}, {});

const roundOrder = ["32 强剩余", "16 强", "8 强", "半决赛", "季军战", "决赛"];

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
  return (
    <article className={`match-card ${featured ? "featured-card" : ""}`}>
      <div className="match-card-top">
        <span>{match.round}</span>
        <span>{match.date}</span>
        <strong>{match.stageNote}</strong>
      </div>

      <div className="scoreline" aria-label={`${match.left.name} 对 ${match.right.name} 预测 ${match.predictedScore}`}>
        <div className="team-block">
          <span className="flag">{match.left.flag}</span>
          <div>
            <strong>{match.left.name}</strong>
            <small>{match.left.shortName}</small>
          </div>
        </div>
        <div className="score-block">
          <span>{match.predictedScore}</span>
          <small>{match.method}</small>
        </div>
        <div className="team-block right-team">
          <span className="flag">{match.right.flag}</span>
          <div>
            <strong>{match.right.name}</strong>
            <small>{match.right.shortName}</small>
          </div>
        </div>
      </div>

      <div className="match-meta">
        <span className={`confidence confidence-${confidenceTone[match.confidence]}`}>信心 {match.confidence}</span>
        <span>预测晋级：{match.predictedWinner}</span>
        {match.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
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

export default function Home() {
  const finalMatch = matches.find((match) => match.round === "决赛") ?? matches[matches.length - 1];
  const semiFinal = matches.find((match) => match.id === "sf-fra-bra") ?? matches[0];

  return (
    <main className="shell">
      <div className="stadium-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <h1>{baseline.title}</h1>
            <p>{baseline.note}</p>
          </div>
        </div>
        <nav aria-label="页面导航">
          {navItems.map((item) => (
            <a key={item} href={`#${item}`}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero-section" id="预测总览">
        <div className="champion-panel">
          <span className="section-label">冠军预测</span>
          <div className="champion-layout">
            <div className="trophy" aria-hidden="true" />
            <div>
              <div className="team-heading">
                <span>{baseline.champion.flag}</span>
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
          <p>{baseline.note}</p>
          <div className="confirmed-strip">
            {baseline.confirmedResults.map((result) => (
              <span key={result}>{result}</span>
            ))}
          </div>
        </div>

        <div className="contenders-panel">
          <span className="section-label">三大夺冠热门</span>
          {baseline.contenders.map((contender, index) => (
            <div className="contender-row" key={contender.team.shortName}>
              <span>{index + 1}</span>
              <strong>
                {contender.team.flag} {contender.team.name}
              </strong>
              <b>{contender.probability}</b>
              <small>{contender.note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="bracket-panel" id="淘汰赛对阵">
        <div className="section-heading">
          <div>
            <span className="section-label">Knockout Map</span>
            <h2>淘汰赛对阵预测图</h2>
          </div>
          <p>从 32 强剩余场次递推至决赛；点 = 点球，加 = 加时。</p>
        </div>

        <div className="bracket-scroll">
          <div className="bracket-grid">
            {bracketRounds.map((round) => (
              <div className="bracket-column" key={round.label}>
                <div className="bracket-title">
                  <strong>{round.label}</strong>
                  <span>{round.window}</span>
                </div>
                <div className="bracket-list">
                  {round.matches.map((match) => (
                    <div className={`bracket-match confidence-${confidenceTone[match.confidence]}`} key={match.id}>
                      <div>
                        <span>{match.left}</span>
                        <span>{match.right}</span>
                      </div>
                      <strong>{match.score}</strong>
                      <small>{match.winner}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="analysis-grid">
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

        <aside className="evidence-panel" id="数据证据">
          <div className="section-heading compact-heading">
            <div>
              <span className="section-label">Evidence Board</span>
              <h2>证据数据面板</h2>
            </div>
          </div>
          <div className="team-comparison">
            <span>{semiFinal.left.flag} {semiFinal.left.name}</span>
            <span>{semiFinal.right.flag} {semiFinal.right.name}</span>
          </div>
          <EvidenceBar item={{ label: "世界排名区间", left: semiFinal.left.rankBand, right: semiFinal.right.rankBand, advantage: "even", note: "两队都处在争冠候选层级，排名无法单独分出胜负。" }} />
          <EvidenceBar item={{ label: "近期状态", left: semiFinal.left.form, right: semiFinal.right.form, advantage: "right", note: "巴西进攻出口更多，法国效率更稳。" }} />
          <EvidenceBar item={{ label: "伤停停赛", left: semiFinal.left.fitness, right: semiFinal.right.fitness, advantage: "even", note: "以公开信息为准，赛前首发仍需复核。" }} />
          <EvidenceBar item={{ label: "战术风格", left: semiFinal.left.tacticalProfile, right: semiFinal.right.tacticalProfile, advantage: "left", note: "巴西边路与法国转换会决定比赛上限。" }} />
          <EvidenceBar item={{ label: "舆论倾向", left: semiFinal.left.sentiment, right: semiFinal.right.sentiment, advantage: "even", note: "市场和球迷都把这场视作实际决赛级别。" }} />
        </aside>
      </section>

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
          <span>{baseline.champion.flag}</span>
          <strong>{baseline.champion.name} 夺冠</strong>
          <small>信心 {finalMatch.confidence} · {finalMatch.method}</small>
        </div>
      </section>

      <footer className="source-strip">
        <span>数据状态：静态预测首版</span>
        <span>置信区间：±6.5%</span>
        <span>来源：{sources.join(" · ")}</span>
      </footer>
    </main>
  );
}
