import type { Metadata } from 'next'
import Link from 'next/link'
import { listArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 热点时间线｜知序', description: '按时间追踪 AI 模型、工具与产品的重要变化。' }

export default async function HotPage() {
  const articles = (await listArticles()).filter((article) => article.category === 'newsletter')
  const datedCount = articles.filter((article) => article.publishedAt).length
  return <main className="site-main page-main hot-page"><header className="hot-hero"><div><span className="page-eyebrow">LIVE INTELLIGENCE</span><h1>AI 热点时间线</h1><p>不重复堆放文章，而是按发生顺序保留重要变化，帮助你看清信号如何演进。</p></div><dl><div><dt>追踪记录</dt><dd>{articles.length}</dd></div><div><dt>已标注时间</dt><dd>{datedCount}</dd></div></dl></header>{articles.length ? <section className="hot-timeline">{articles.map((article, index) => <article key={article.slug}><div className="timeline-date"><time>{article.publishedAt || '持续更新'}</time><span>{index === 0 ? '最新' : '已归档'}</span></div><div className="timeline-marker" aria-hidden="true"><i /></div><div className="timeline-content"><div className="article-meta"><span>{article.sourceName}</span><span>{article.readingMinutes} 分钟</span></div><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p><Link href={`/articles/${article.slug}`}>查看变化详情 →</Link></div></article>)}</section> : <section className="empty-state"><h2>热点正在整理</h2><p>编辑核验完成后会按时间发布在这里。</p></section>}</main>
}
