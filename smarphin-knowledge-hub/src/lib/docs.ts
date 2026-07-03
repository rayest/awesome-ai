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
}

export interface Doc extends DocMetadata {
  content: string
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
        title: data.title || slug,
        category,
        readingTime: rt.text,
      }
    })
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
        const highlighted = hljs.highlight(decoded, { language: lang }).value
        return `<pre data-language="${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch {
        return `<pre data-language="${lang}"><code class="hljs">${code}</code></pre>`
      }
    }
  )

  return {
    slug,
    title: data.title || slug[slug.length - 1],
    category: slug[0],
    content: contentHtml,
    readingTime: rt.text,
  }
}

export function getAllDocs(): DocMetadata[] {
  const categories = getCategories()
  const allDocs: DocMetadata[] = []

  for (const category of categories) {
    allDocs.push(...getDocsByCategory(category))
  }

  return allDocs
}
