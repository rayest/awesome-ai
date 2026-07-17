import { getAllDocs, getCategories, getCategoryInfo, getDoc, type DocMetadata } from './docs'

export interface ArticleSummary {
  slug: string
  legacySlug: string[]
  title: string
  summary: string
  category: string
  categoryLabel: string
  readingMinutes: number
  publishedAt: string | null
  coverUrl: string | null
  sourceName: string
  sourceVerified: boolean
}

export interface ArticleDetail extends ArticleSummary {
  contentHtml: string
  sourceUrl?: string
}

export interface TopicSummary {
  slug: string
  title: string
  summary: string
  audience: string
  goals: string[]
  articleCount: number
}

export interface PodcastSummary {
  slug: string
  title: string
  summary: string
  duration: string
  publishedAt: string
  audioUrl: string | null
}

const apiUrl = process.env.KNOWLEDGE_API_URL || 'http://localhost:8101/api/public'
const dataSource = process.env.KNOWLEDGE_DATA_SOURCE || 'filesystem'

function publicSlug(doc: DocMetadata): string {
  return doc.slug.join('--')
}

function toLocalArticle(doc: DocMetadata): ArticleSummary {
  const minutes = Number.parseInt(doc.readingTime, 10) || 5
  return {
    slug: publicSlug(doc),
    legacySlug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    categoryLabel: getCategoryInfo(doc.category).label,
    readingMinutes: minutes,
    publishedAt: doc.publishedAt,
    coverUrl: doc.coverUrl,
    sourceName: doc.category === 'newsletter' ? '知序编辑部' : '公开资料整理',
    sourceVerified: true,
  }
}

async function apiRequest<T>(path: string): Promise<T | null> {
  if (dataSource !== 'api') return null
  try {
    const response = await fetch(`${apiUrl}${path}`, { next: { revalidate: 300 } })
    if (!response.ok) return null
    const payload = await response.json()
    return payload.response as T
  } catch {
    return null
  }
}

export async function listArticles(): Promise<ArticleSummary[]> {
  const remote = await apiRequest<{ items: Array<Record<string, unknown>> }>('/articles?page=1&page_size=100')
  if (remote) {
    return remote.items.map((item) => ({
      slug: String(item.slug), legacySlug: [], title: String(item.title), summary: String(item.summary || ''),
      category: 'article', categoryLabel: 'AI 知识', readingMinutes: Number(item.reading_minutes || 5),
      publishedAt: item.published_at ? String(item.published_at) : null, coverUrl: item.cover_url ? String(item.cover_url) : null,
      sourceName: String(item.source_name || '知序编辑部'), sourceVerified: Boolean(item.source_verified),
    }))
  }
  return getAllDocs().map(toLocalArticle)
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const remote = await apiRequest<Record<string, unknown>>(`/articles/${slug}`)
  if (remote) {
    return {
      slug, legacySlug: [], title: String(remote.title), summary: String(remote.summary || ''), category: 'article', categoryLabel: 'AI 知识',
      readingMinutes: Number(remote.reading_minutes || 5), publishedAt: remote.published_at ? String(remote.published_at) : null,
      coverUrl: remote.cover_url ? String(remote.cover_url) : null, sourceName: String(remote.source_name || '知序编辑部'),
      sourceVerified: Boolean(remote.source_verified), sourceUrl: remote.source_url ? String(remote.source_url) : undefined,
      contentHtml: markdownToBasicHtml(String(remote.content_markdown || '')),
    }
  }
  const parts = slug.split('--')
  const doc = await getDoc(parts)
  if (!doc) return null
  let contentHtml = doc.content.replace(/^<h1>[\s\S]*?<\/h1>/, '')
  if (doc.coverUrl) {
    const escapedUrl = doc.coverUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    contentHtml = contentHtml.replace(new RegExp(`<p><img[^>]+src="${escapedUrl}"[^>]*><\\/p>`), '')
  }
  return { ...toLocalArticle(doc), contentHtml }
}

export async function listTopics(): Promise<TopicSummary[]> {
  const articles = await listArticles()
  return getCategories().map((category) => {
    const info = getCategoryInfo(category)
    return {
      slug: category, title: info.label, summary: info.description,
      audience: category === 'newsletter' ? '希望快速了解 AI 变化并形成判断的产品与技术团队' : '希望系统理解 Agent 与上下文工程的开发者',
      goals: ['建立主题地图', '按顺序完成核心阅读', '回到实践中验证方法'],
      articleCount: articles.filter((article) => article.category === category).length,
    }
  })
}

export async function getTopicBySlug(slug: string): Promise<(TopicSummary & { articles: ArticleSummary[] }) | null> {
  const topics = await listTopics()
  const topic = topics.find((item) => item.slug === slug)
  if (!topic) return null
  return { ...topic, articles: (await listArticles()).filter((article) => article.category === slug) }
}

export async function listPodcasts(): Promise<PodcastSummary[]> {
  const remote = await apiRequest<Array<Record<string, unknown>>>('/podcasts')
  if (remote) return remote.map((item) => ({ slug: String(item.slug), title: String(item.title), summary: String(item.summary || ''), duration: formatDuration(Number(item.duration_seconds || 0)), publishedAt: String(item.published_at || ''), audioUrl: item.audio_url ? String(item.audio_url) : null }))
  return [
    { slug: 'agent-memory-field-notes', title: '从上下文窗口到长期记忆：Agent 记忆工程现场笔记', summary: '沿着短期上下文、检索记忆和更新审计，解释一个可治理的记忆系统如何形成。', duration: '18:42', publishedAt: '2026-07-17', audioUrl: null },
    { slug: 'loop-engineering-notes', title: 'Loop Engineering：停止条件为什么比提示词更重要', summary: '讨论反馈信号、恢复策略与长任务可靠性。', duration: '14:16', publishedAt: '2026-07-12', audioUrl: null },
  ]
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function markdownToBasicHtml(markdown: string): string {
  return markdown.split('\n').map((line) => line.startsWith('# ') ? `<h1>${line.slice(2)}</h1>` : line.startsWith('## ') ? `<h2>${line.slice(3)}</h2>` : line ? `<p>${line}</p>` : '').join('')
}
