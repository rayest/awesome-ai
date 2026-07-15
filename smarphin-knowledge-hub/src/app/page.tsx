import Link from 'next/link'
import CommunityShell from '@/components/CommunityShell'
import { getCategories, getAllDocs, getDocsByCategory, getLatestDocs, getCategoryInfo } from '@/lib/docs'

export default function Home() {
  const categories = getCategories()
  const allDocs = getAllDocs()
  const latestDocs = getLatestDocs(6)

  return (
    <CommunityShell categories={categories} variant="home">
      <div className="hub-content hub-home">
        <section className="hub-hero">
          <div className="hub-hero-copy">
            <p className="hub-kicker">AI knowledge community</p>
            <h1>把 AI、Agent 与工程框架整理成可长期复用的知识网络。</h1>
            <p>
              这里收集我对 AI 信息流、Agent 架构、开发框架和工具生态的持续观察。
            </p>
          </div>
          <div className="hub-hero-panel" aria-label="社区内容概览">
            <div>
              <span className="hub-metric-value">{allDocs.length}</span>
              <span className="hub-metric-label">篇内容</span>
            </div>
            <div>
              <span className="hub-metric-value">{categories.length}</span>
              <span className="hub-metric-label">个主题</span>
            </div>
            <div>
              <span className="hub-metric-value">AI</span>
              <span className="hub-metric-label">持续更新</span>
            </div>
          </div>
        </section>

        <section className="hub-section">
          <div className="hub-section-header">
            <h2>主题入口</h2>
            <p>按知识用途进入，先找到问题所在，再进入对应文章。</p>
          </div>

          <div className="hub-topic-grid">
            {categories.map((category) => {
              const docs = getDocsByCategory(category)
              const firstDoc = docs[0]
              const info = getCategoryInfo(category)

              return (
                <Link key={category} href={`/docs/${category}`} className="hub-topic-card">
                  <span className="hub-topic-code">{info.shortCode}</span>
                  <span className="hub-topic-title">{info.label}</span>
                  <span className="hub-topic-desc">{info.description}</span>
                  <span className="hub-topic-meta">
                    {docs.length} 篇内容
                    {firstDoc ? <span>{firstDoc.title}</span> : null}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="hub-section hub-feed-section">
          <div className="hub-section-header">
            <h2>最新更新</h2>
            <p>像社区动态一样浏览近期内容，适合快速跟进 AI 与 Agent 生态。</p>
          </div>

          <div className="hub-feed">
            {latestDocs.map((doc) => {
              const info = getCategoryInfo(doc.category)
              return (
                <Link key={doc.slug.join('/')} href={`/docs/${doc.slug.join('/')}`} className="hub-feed-item">
                  <span className="hub-feed-code">{info.shortCode}</span>
                  <span className="hub-feed-body">
                    <span className="hub-feed-title">{doc.title}</span>
                    <span className="hub-feed-meta">{info.label} / {doc.readingTime}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </CommunityShell>
  )
}
