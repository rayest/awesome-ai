import Link from 'next/link'
import type { ArticleSummary } from '@/lib/knowledge'
import { Card, CardImage, CardBody, CardHeader, CardTitle, CardSummary, CardFooter, CardMeta } from './Card'

export function ArticleCard({ article, variant = 'default' }: { article: ArticleSummary; variant?: 'default' | 'featured' }) {
  return (
    <Card className={`article-card ${variant === 'featured' ? 'is-featured' : ''}`}>
      <CardImage
        src={article.coverUrl}
        alt={article.title}
        fallback={<DefaultCover title={article.title} category={article.categoryLabel} />}
      />
      <CardBody>
        <CardHeader category={article.categoryLabel} badge={article.featured ? '编辑推荐' : undefined} />
        <CardTitle><Link href={`/articles/${article.slug}`}>{article.title}</Link></CardTitle>
        <CardSummary>{article.summary}</CardSummary>
        <CardFooter>
          <CardMeta>
            <span>{article.readingMinutes} 分钟</span>
            {article.publishedAt ? <time>{article.publishedAt}</time> : null}
            <span>{article.sourceName}</span>
          </CardMeta>
          <Link href={`/articles/${article.slug}`} className="knowledge-card-link" aria-label={`阅读 ${article.title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </Link>
        </CardFooter>
      </CardBody>
    </Card>
  )
}

function DefaultCover({ title, category }: { title: string; category: string }) {
  const initials = title.slice(0, 2)
  return (
    <div className="knowledge-card-default-cover">
      <span className="knowledge-card-default-initials">{initials}</span>
      <span className="knowledge-card-default-category">{category}</span>
    </div>
  )
}