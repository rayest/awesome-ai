import type { Metadata } from 'next'
import { TopicCard } from '@/components/content/TopicCard'
import { listTopics } from '@/lib/knowledge'

export const metadata: Metadata = { title: '专题路径', description: '按编辑策展的阅读路径理解 AI 和 Agent 主题。' }

export default async function TopicsPage() {
  const topics = (await listTopics()).filter((topic) => topic.slug !== 'newsletter')
  return (
    <main className="site-main page-main">
      <header className="page-intro">
        <span className="page-eyebrow">EDITORIAL PATHS</span>
        <h1>专题路径</h1>
        <p>专题不会产生重复文章，而是围绕一个问题复用知识库内容，组成从理解到实践的编号阅读顺序。</p>
      </header>
      {topics.length ? (
        <div className="knowledge-card-grid is-3col">
          {topics.map((topic, index) => <TopicCard key={topic.slug} topic={topic} index={index} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>暂无专题</h2>
          <p>编辑完成并发布后会在这里出现。</p>
        </div>
      )}
    </main>
  )
}