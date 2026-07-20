import type { Metadata } from 'next'
import Link from 'next/link'
import { listTopics } from '@/lib/knowledge'

export const metadata: Metadata = { title: '专题', description: '按学习路径阅读 AI 和 Agent 主题。' }
export default async function TopicsPage() { const topics = (await listTopics()).filter((topic) => topic.slug !== 'newsletter'); return <main className="site-main page-main"><header className="page-intro"><span className="page-eyebrow">EDITORIAL COLLECTIONS</span><h1>专题</h1><p>由编辑围绕一个问题跨栏目策展，形成从理解到实践的编号阅读路径。</p></header><div className="topic-directory">{topics.map((topic, index) => <Link href={`/topics/${topic.slug}`} key={topic.slug}><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{topic.title}</h2><p>{topic.summary}</p><small>适合：{topic.audience}</small></div><strong>{topic.articleCount}<small>篇内容</small></strong></Link>)}</div></main> }
