import type { Metadata } from 'next'
import Link from 'next/link'
import { PodcastPlayer } from '@/components/content/PodcastPlayer'
import { listPodcasts } from '@/lib/knowledge'

export const metadata: Metadata = { title: '播客', description: '知序 AI 知识播客。' }
export default async function PodcastsPage() { const podcasts = await listPodcasts(); return <main className="site-main page-main"><header className="page-intro podcast-intro"><div><h1>播客</h1><p>适合通勤和散步的 AI 主题解读。音频由编辑完成后上传，不使用自动 TTS 发布。</p></div><Link href="/podcast.xml">Podcast RSS</Link></header><div className="podcast-list">{podcasts.map((podcast, index) => <article key={podcast.slug}><div className="podcast-art" aria-hidden="true"><span>知序播客</span><strong>{String(index + 1).padStart(2, '0')}</strong><i /></div><div><div className="article-meta"><time>{podcast.publishedAt}</time><span>{podcast.duration}</span></div><h2><Link href={`/podcasts/${podcast.slug}`}>{podcast.title}</Link></h2><p>{podcast.summary}</p><PodcastPlayer title={podcast.title} audioUrl={podcast.audioUrl} /></div></article>)}</div></main> }
