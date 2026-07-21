import Link from 'next/link'
import type { PodcastSummary } from '@/lib/knowledge'
import { Card, CardImage, CardBody, CardHeader, CardTitle, CardSummary, CardFooter, CardMeta } from './Card'

export function PodcastCard({ podcast }: { podcast: PodcastSummary }) {
  return (
    <Card className="podcast-card">
      <CardImage
        src={podcast.coverUrl}
        alt={podcast.title}
        fallback={<DefaultPodcastCover title={podcast.title} />}
        overlay={podcast.audioUrl ? (
          <div className="podcast-card-play-overlay">
            <span className="podcast-card-play">
              <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6,4 20,12 6,20" /></svg>
            </span>
          </div>
        ) : null}
      />
      <CardBody>
        <CardHeader category="知序播客" />
        <CardTitle><Link href={`/podcasts/${podcast.slug}`}>{podcast.title}</Link></CardTitle>
        <CardSummary>{podcast.summary}</CardSummary>
        <CardFooter>
          <CardMeta>
            <span>{podcast.duration}</span>
            {podcast.publishedAt ? <time>{podcast.publishedAt}</time> : null}
          </CardMeta>
          <Link href={`/podcasts/${podcast.slug}`} className="knowledge-card-link" aria-label={`播放 ${podcast.title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </Link>
        </CardFooter>
      </CardBody>
    </Card>
  )
}

function DefaultPodcastCover({ title }: { title: string }) {
  const initial = title.slice(0, 2)
  return (
    <div className="podcast-card-default-cover">
      <span className="podcast-card-default-mark">{initial}</span>
      <span className="podcast-card-default-brand">知序播客</span>
    </div>
  )
}