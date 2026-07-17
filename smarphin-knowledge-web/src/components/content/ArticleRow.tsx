import Link from 'next/link'
import type { ArticleSummary } from '@/lib/knowledge'

export function ArticleRow({ article, index }: { article: ArticleSummary; index?: number }) {
  return <article className="article-row">{index ? <span className="article-index">{String(index).padStart(2, '0')}</span> : null}<div className="article-row-main"><div className="article-meta"><span>{article.categoryLabel}</span><span>{article.readingMinutes} 分钟</span>{article.publishedAt ? <time>{article.publishedAt}</time> : null}</div><h3><Link href={`/articles/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p></div><Link className="row-arrow" href={`/articles/${article.slug}`} aria-label={`阅读 ${article.title}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg></Link></article>
}
