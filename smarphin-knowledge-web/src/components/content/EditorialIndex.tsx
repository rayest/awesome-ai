import Link from 'next/link'
import type { ArticleSummary } from '@/lib/knowledge'

interface EditorialIndexProps {
  eyebrow: string
  title: string
  description: string
  emptyTitle: string
  articles: ArticleSummary[]
  labels: [string, string, string]
}

export function EditorialIndex({ eyebrow, title, description, emptyTitle, articles, labels }: EditorialIndexProps) {
  const categories = Array.from(new Set(articles.map((article) => article.categoryLabel)))
  const latestDate = articles.find((article) => article.publishedAt)?.publishedAt

  return <main className="site-main page-main index-page"><header className="index-hero"><div><span className="page-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><dl><div><dt>编辑记录</dt><dd>{articles.length}</dd></div><div><dt>覆盖主题</dt><dd>{categories.length}</dd></div><div><dt>最近更新</dt><dd>{latestDate || '持续整理'}</dd></div></dl></header>{articles.length ? <><section className="index-guide" aria-label="目录说明"><span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span></section><section className="index-grid">{articles.map((article, index) => <article key={article.slug}><header><span>{String(index + 1).padStart(2, '0')}</span><small>{article.categoryLabel}</small></header><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p><footer><span>{article.publishedAt || '持续更新'}</span><Link href={`/articles/${article.slug}`}>查看编辑记录 →</Link></footer></article>)}</section></> : <section className="empty-state"><h2>{emptyTitle}</h2><p>相关资料正在后台整理，完成核验并发布后会自动出现在这里。</p></section>}</main>
}
