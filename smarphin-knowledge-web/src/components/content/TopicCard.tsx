import Link from 'next/link'
import type { TopicSummary } from '@/lib/knowledge'
import { Card, CardImage, CardBody, CardHeader, CardTitle, CardSummary, CardFooter, CardMeta } from './Card'

export function TopicCard({ topic, index }: { topic: TopicSummary; index: number }) {
  return (
    <Link href={`/topics/${topic.slug}`} className="knowledge-card-link-wrapper">
      <Card className="topic-card">
        <CardImage
          src={topic.coverUrl}
          alt={topic.title}
          fallback={<span className="topic-card-number">{String(index + 1).padStart(2, '0')}</span>}
        />
        <CardBody>
          <CardHeader category="专题路径" />
          <CardTitle>{topic.title}</CardTitle>
          <CardSummary>{topic.summary}</CardSummary>
          <CardFooter>
            <CardMeta>
              <span>{topic.articleCount} 篇文章</span>
              <span>{topic.audience}</span>
            </CardMeta>
            <span className="knowledge-card-arrow">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
            </span>
          </CardFooter>
        </CardBody>
      </Card>
    </Link>
  )
}