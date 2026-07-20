import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import hljs from 'highlight.js'

const docsDirectory = path.join(process.cwd(), 'docs')

export interface DocMetadata {
  slug: string[]
  title: string
  category: string
  readingTime: string
  summary: string
  publishedAt: string | null
  coverUrl: string | null
}

export interface Doc extends DocMetadata {
  content: string
}

export interface CategoryInfo {
  label: string
  shortCode: string
  shortDescription: string
  description: string
}

const categoryInfo: Record<string, CategoryInfo> = {
  'claude-code-harness': {
    label: 'Claude Code Harness',
    shortCode: 'CC',
    shortDescription: '架构、记忆、Skills 与 Hooks',
    description: '围绕 Claude Code 的系统化工程拆解，关注上下文、记忆、自动化与安全边界。',
  },
  'harness-engine': {
    label: 'Harness Engine',
    shortCode: 'HE',
    shortDescription: 'Agent 运行时与上下文工程',
    description: '把 Agent 从提示词扩展到可运行、可拆解、可治理的工程系统。',
  },
  newsletter: {
    label: 'AI 信息流',
    shortCode: 'AI',
    shortDescription: '产业动态、工具与研究信号',
    description: '筛选每日 AI、Agent、模型、平台和产品变化，沉淀可追踪的判断线索。',
  },
  'source-to-text': {
    label: 'Source to Text',
    shortCode: 'ST',
    shortDescription: '视频、文章与资料结构化',
    description: '把外部资料转成可复用的中文结构化笔记，便于后续写作和工程实践。',
  },
  cases: { label: '实践案例', shortCode: 'CA', shortDescription: '可复现的 AI 应用实践', description: '记录任务、工具、成本、结果与可以复用的方法。' },
  evaluations: { label: '评测与基准', shortCode: 'EV', shortDescription: '模型与工具的统一条件实测', description: '保留测试环境、日期、成本和质量结果。' },
  failures: { label: '失败复盘', shortCode: 'FR', shortDescription: '幻觉、失控与工程陷阱', description: '整理失败原因、影响范围和可执行的防范方法。' },
}

export function getCategoryInfo(category: string): CategoryInfo {
  return categoryInfo[category] || {
    label: formatCategoryName(category),
    shortCode: category.slice(0, 2).toUpperCase(),
    shortDescription: '知识内容与技术笔记',
    description: '围绕 AI、Agent 和技术开发的主题内容集合。',
  }
}

export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getDocSortKey(doc: DocMetadata): string {
  return doc.publishedAt || `0000-${doc.slug[doc.slug.length - 1] || doc.title}`
}

function extractTitle(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
}

function extractSummary(content: string): string {
  const lines = content.split('\n')
  for (const line of lines) {
    const text = line.trim()
    if (!text || text === '---' || text.startsWith('#') || text.startsWith('![') || text.startsWith('>') || text.startsWith('|')) continue
    return text.replace(/[*_`\[\]]/g, '').slice(0, 180)
  }
  return '围绕 AI、Agent 与工程实践整理的编辑内容。'
}

function extractDate(slug: string): string | null {
  const match = slug.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] || null
}

function extractCover(content: string, category: string): string | null {
  const match = content.match(/!\[[^\]]*\]\(\.\/([^\s)]+)(?:\s+[^)]*)?\)/)
  return match ? `/content/${category}/${match[1]}` : null
}

export function getDocSlugs(): { slug: string[] }[] {
  const slugs: string[][] = []

  function walkDir(dir: string, parentSlug: string[] = []) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walkDir(path.join(dir, entry.name), [...parentSlug, entry.name])
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const nameWithoutExt = entry.name.replace(/\.mdx?$/, '')
        slugs.push([...parentSlug, nameWithoutExt])
      }
    }
  }

  walkDir(docsDirectory)
  return slugs.map(slug => ({ slug }))
}

export function getCategories(): string[] {
  if (!fs.existsSync(docsDirectory)) return []
  return fs.readdirSync(docsDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

export function getDocsByCategory(category: string): DocMetadata[] {
  const categoryPath = path.join(docsDirectory, category)
  if (!fs.existsSync(categoryPath)) return []

  return fs.readdirSync(categoryPath, { withFileTypes: true })
    .filter(entry => entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
    .map(entry => {
      const slug = entry.name.replace(/\.mdx?$/, '')
      const filePath = path.join(categoryPath, entry.name)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)
      const rt = readingTime(fileContent)

      return {
        slug: [category, slug],
        title: data.title || extractTitle(fileContent, slug),
        category,
        readingTime: rt.text,
        summary: data.summary || extractSummary(fileContent),
        publishedAt: data.publishedAt || extractDate(slug),
        coverUrl: data.cover || extractCover(fileContent, category),
      }
    })
    .sort((a, b) => getDocSortKey(b).localeCompare(getDocSortKey(a)))
}

export async function getDoc(slug: string[]): Promise<Doc | null> {
  const filePath = path.join(docsDirectory, ...slug) + '.md'
  const mdxPath = path.join(docsDirectory, ...slug) + '.mdx'

  let fileContent: string
  if (fs.existsSync(filePath)) {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  } else if (fs.existsSync(mdxPath)) {
    fileContent = fs.readFileSync(mdxPath, 'utf-8')
  } else {
    return null
  }

  const { data, content } = matter(fileContent)
  const rt = readingTime(content)

  // Use remark with GFM (GitHub Flavored Markdown) support
  let contentHtml = await renderMarkdown(content)

  contentHtml = contentHtml.replace(/src="\.\/([^\"]+)"/g, `src="/content/${slug[0]}/$1"`)

  return {
    slug,
    title: data.title || extractTitle(content, slug[slug.length - 1]),
    category: slug[0],
    content: contentHtml,
    readingTime: rt.text,
    summary: data.summary || extractSummary(content),
    publishedAt: data.publishedAt || extractDate(slug[slug.length - 1]),
    coverUrl: data.cover || extractCover(content, slug[0]),
  }
}

export async function renderMarkdown(content: string): Promise<string> {
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)

  let contentHtml = processedContent.toString()

  // Apply syntax highlighting to code blocks
  contentHtml = contentHtml.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const decoded = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
      try {
        if (!hljs.getLanguage(lang)) {
          return `<pre data-language="${lang}"><code class="hljs language-${lang}">${escapeHtml(decoded)}</code></pre>`
        }
        const highlighted = hljs.highlight(decoded, { language: lang }).value
        return `<pre data-language="${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch {
        return `<pre data-language="${lang}"><code class="hljs">${escapeHtml(decoded)}</code></pre>`
      }
    }
  )

  return contentHtml
}

export function getAllDocs(): DocMetadata[] {
  const categories = getCategories()
  const allDocs: DocMetadata[] = []

  for (const category of categories) {
    allDocs.push(...getDocsByCategory(category))
  }

  return allDocs
    .sort((a, b) => getDocSortKey(b).localeCompare(getDocSortKey(a)))
}

export function getLatestDocs(limit = 6): DocMetadata[] {
  return getAllDocs().slice(0, limit)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
