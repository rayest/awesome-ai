import type { Metadata } from 'next'
import Link from 'next/link'
import { listTopics } from '@/lib/knowledge'

export const metadata: Metadata = { title: '专题路径', description: '按编辑策展的阅读路径理解 AI 和 Agent 主题。' }
export default async function TopicsPage() { const topics = (await listTopics()).filter((topic) => topic.slug !== 'newsletter'); return <main className="site-main page-main"><header className="page-intro"><span className="page-eyebrow">EDITORIAL PATHS</span><h1>专题路径</h1><p>专题不会产生重复文章，而是围绕一个问题复用知识库内容，组成从理解到实践的编号阅读顺序。</p></header><div className="topic-directory">{topics.map((topic, index) => <Link href={`/topics/${topic.slug}`} key={topic.slug}><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{topic.title}</h2><p>{topic.summary}</p><small>适合：{topic.audience}</small></div><strong>{topic.articleCount}<small>篇已上线内容</small></strong></Link>)}</div></main> }
