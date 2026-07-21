import type { Metadata } from 'next'
import Link from 'next/link'
import { PodcastCard } from '@/components/content/PodcastCard'
import { PodcastPlayer } from '@/components/content/PodcastPlayer'
import { listPodcasts } from '@/lib/knowledge'

export const metadata: Metadata = { title: '播客', description: '知序 AI 知识播客。' }

export default async function PodcastsPage() {
  const podcasts = await listPodcasts()
  return (
    <main className="site-main page-main">
      <header className="page-intro podcast-intro">
        <div>
          <h1>播客</h1>
          <p>适合通勤和散步的 AI 主题解读。音频由编辑完成后上传，不使用自动 TTS 发布。</p>
        </div>
        <Link href="/podcast.xml">Podcast RSS</Link>
      </header>
      {podcasts.length ? (
        <div className="knowledge-card-grid is-3col">
          {podcasts.map((podcast) => (
            <div key={podcast.slug}>
              <PodcastCard podcast={podcast} />
              <div className="podcast-list-player">
                <PodcastPlayer title={podcast.title} audioUrl={podcast.audioUrl} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>暂无播客</h2>
          <p>编辑完成并发布后会在这里出现。</p>
        </div>
      )}
    </main>
  )
}