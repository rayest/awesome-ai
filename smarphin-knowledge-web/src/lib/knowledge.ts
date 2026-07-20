import { renderMarkdown } from './docs'

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
  showNotesHtml?: string
  chapters?: Array<{ time: string; title: string }>
}

export interface ResourceSummary {
  slug: string
  title: string
  summary: string
  resourceType: string
  platform: string
  difficulty: string
  fileFormat: string
  version: string
  requiresApiKey: boolean
  featured: boolean
  publishedAt: string | null
  verifiedAt: string | null
}

export interface ResourceDetail extends ResourceSummary {
  content: string
  instructions: string
  variables: string
}

export interface CatalogProfile { slug:string; name:string; profileType:'model'|'tool'; provider:string; summary:string; pricing:string; availability:string; contextWindow:string; capabilities:string; bestFor:string; limitations:string; latestChange:string; websiteUrl:string|null; apiAvailable:boolean; openSource:boolean; verifiedAt:string|null }

const apiUrl = process.env.KNOWLEDGE_API_URL || 'http://localhost:8101/api/public'

async function apiRequest<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}${path}`, { next: { revalidate: 300 } })
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`公共知识 API 请求失败，path=${path}，status=${response.status}`)
    }
    const payload = await response.json()
    return payload.response as T
  } catch (error) {
    console.error(`公共知识 API 连接异常，path=${path}`, error)
    throw error
  }
}

function remoteArticle(item: Record<string, unknown>): ArticleSummary {
  return {
    slug: String(item.slug), legacySlug: [], title: String(item.title), summary: String(item.summary || ''),
    category: String(item.category_slug || 'uncategorized'), categoryLabel: String(item.category_name || '未分类'),
    readingMinutes: Number(item.reading_minutes || 5), publishedAt: item.published_at ? String(item.published_at).slice(0, 10) : null,
    coverUrl: item.cover_url ? String(item.cover_url) : null, sourceName: String(item.source_name || '知序编辑部'),
    sourceVerified: Boolean(item.source_verified),
  }
}

function isClassifiedArticle(item: ArticleSummary): boolean {
  return item.category !== 'uncategorized' && item.categoryLabel !== '未分类'
}

export async function listArticles(): Promise<ArticleSummary[]> {
  const remote = await apiRequest<{ items: Array<Record<string, unknown>> }>('/articles?page=1&page_size=100')
  return remote ? remote.items.map(remoteArticle).filter(isClassifiedArticle) : []
}

export async function searchArticles(query: string): Promise<ArticleSummary[]> {
  const value = query.trim()
  if (!value) return []
  const remote = await apiRequest<{ items: Array<Record<string, unknown>> }>(`/search?q=${encodeURIComponent(value)}&page=1&page_size=50`)
  if (remote) return remote.items.map(remoteArticle).filter(isClassifiedArticle)
  return []
}

function remoteResource(item: Record<string, unknown>): ResourceSummary {
  return {
    slug: String(item.slug), title: String(item.title), summary: String(item.summary || ''),
    resourceType: String(item.resource_type || 'product_content'), platform: String(item.platform || '通用'),
    difficulty: String(item.difficulty || '入门'), fileFormat: String(item.file_format || 'Markdown'),
    version: String(item.version || '1.0.0'), requiresApiKey: Boolean(item.requires_api_key), featured: Boolean(item.featured),
    publishedAt: item.published_at ? String(item.published_at).slice(0, 10) : null,
    verifiedAt: item.verified_at ? String(item.verified_at).slice(0, 10) : null,
  }
}

export async function listResources(resourceType?: string): Promise<ResourceSummary[]> {
  const query = resourceType ? `&resource_type=${encodeURIComponent(resourceType)}` : ''
  const remote = await apiRequest<{ items: Array<Record<string, unknown>> }>(`/resources?page=1&page_size=100${query}`)
  return remote ? remote.items.map(remoteResource) : []
}

export async function getResourceBySlug(slug: string): Promise<ResourceDetail | null> {
  const remote = await apiRequest<Record<string, unknown>>(`/resources/${slug}`)
  if (!remote) return null
  return { ...remoteResource(remote), content: String(remote.content || ''), instructions: String(remote.instructions || ''), variables: String(remote.variables || '') }
}

export async function listCatalogProfiles(profileType: 'model' | 'tool'): Promise<CatalogProfile[]> {
  const remote = await apiRequest<Array<Record<string, unknown>>>(`/catalog/${profileType}`)
  return remote ? remote.map((item) => ({ slug:String(item.slug), name:String(item.name), profileType, provider:String(item.provider||''), summary:String(item.summary||''), pricing:String(item.pricing||'未标注'), availability:String(item.availability||'未标注'), contextWindow:String(item.context_window||'未标注'), capabilities:String(item.capabilities||''), bestFor:String(item.best_for||''), limitations:String(item.limitations||''), latestChange:String(item.latest_change||''), websiteUrl:item.website_url?String(item.website_url):null, apiAvailable:Boolean(item.api_available), openSource:Boolean(item.open_source), verifiedAt:item.verified_at?String(item.verified_at).slice(0,10):null })) : []
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const remote = await apiRequest<Record<string, unknown>>(`/articles/${slug}`)
  if (remote) {
    const summary = remoteArticle(remote)
    if (!isClassifiedArticle(summary)) return null
    return {
      ...summary, sourceUrl: remote.source_url ? String(remote.source_url) : undefined,
      contentHtml: await renderMarkdown(String(remote.content_markdown || '')),
    }
  }
  return null
}

export async function listTopics(): Promise<TopicSummary[]> {
  const remote = await apiRequest<Array<Record<string, unknown>>>('/topics')
  return remote ? remote.map((item) => ({
    slug: String(item.slug), title: String(item.title), summary: String(item.summary || ''), audience: String(item.audience || ''),
    goals: parseGoals(item.goals), articleCount: Number(item.article_count || 0),
  })) : []
}

export async function getTopicBySlug(slug: string): Promise<(TopicSummary & { articles: ArticleSummary[] }) | null> {
  const remote = await apiRequest<Record<string, unknown>>(`/topics/${slug}`)
  if (remote) {
    const articles = Array.isArray(remote.articles) ? remote.articles.map((item) => remoteArticle(item as Record<string, unknown>)) : []
    return { slug: String(remote.slug), title: String(remote.title), summary: String(remote.summary || ''), audience: String(remote.audience || ''), goals: parseGoals(remote.goals), articleCount: articles.length, articles }
  }
  return null
}

export async function listPodcasts(): Promise<PodcastSummary[]> {
  const remote = await apiRequest<Array<Record<string, unknown>>>('/podcasts')
  return remote ? Promise.all(remote.map(async (item) => ({ slug: String(item.slug), title: String(item.title), summary: String(item.summary || ''), duration: formatDuration(Number(item.duration_seconds || 0)), publishedAt: String(item.published_at || '').slice(0, 10), audioUrl: item.audio_url ? String(item.audio_url) : null, showNotesHtml: item.show_notes ? await renderMarkdown(String(item.show_notes)) : undefined, chapters: parseChapters(item.chapters) }))) : []
}

function parseGoals(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  const text = String(value || '').trim()
  if (!text) return []
  try { const parsed = JSON.parse(text); if (Array.isArray(parsed)) return parsed.map(String) } catch { /* 使用换行格式 */ }
  return text.split(/\r?\n/).map((item) => item.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean)
}

function parseChapters(value: unknown): Array<{ time: string; title: string }> | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map((item) => ({ time: String((item as Record<string, unknown>).time || ''), title: String((item as Record<string, unknown>).title || '') })).filter((item) => item.title)
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
