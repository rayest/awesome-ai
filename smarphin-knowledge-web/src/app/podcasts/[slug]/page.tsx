import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PodcastPlayer } from '@/components/content/PodcastPlayer'
import { listPodcasts } from '@/lib/knowledge'

export async function generateStaticParams() { return (await listPodcasts()).map((podcast) => ({ slug: podcast.slug })) }
export default async function PodcastPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const podcast = (await listPodcasts()).find((item) => item.slug === slug); if (!podcast) notFound(); return <main className="site-main podcast-detail"><Link className="back-link" href="/podcasts">← 返回播客</Link><header><div className="podcast-art large" aria-hidden="true"><span>知序播客</span><strong>声</strong><i /></div><div><div className="article-meta"><time>{podcast.publishedAt}</time><span>{podcast.duration}</span></div><h1>{podcast.title}</h1><p>{podcast.summary}</p><PodcastPlayer title={podcast.title} audioUrl={podcast.audioUrl} /></div></header><section className="show-notes"><h2>节目说明</h2><p>本期从问题背景、关键概念和实践边界三个层次展开。正式音频和章节时间轴将在管理端完成上传后同步到这里与 Podcast RSS。</p><h3>章节</h3><ol><li><span>00:00</span>为什么现在需要重新讨论这个问题</li><li><span>04:20</span>核心结构与常见误区</li><li><span>12:10</span>如何放进真实工作流</li></ol></section></main> }
