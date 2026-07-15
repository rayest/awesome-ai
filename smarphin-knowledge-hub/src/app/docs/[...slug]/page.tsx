import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CommunityShell from '@/components/CommunityShell'
import { getDoc, getDocSlugs, getCategories, getDocsByCategory, getCategoryInfo } from '@/lib/docs'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  return getDocSlugs()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = await getDoc(slug)
  if (!doc) return { title: 'Not Found' }
  return {
    title: `${doc.title} - SmartHub`,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = await getDoc(slug)
  if (!doc) notFound()

  const categories = getCategories()
  const categoryDocs = getDocsByCategory(doc.category)
  const categoryInfo = getCategoryInfo(doc.category)
  const activeDocSlug = slug.join('/')

  return (
    <CommunityShell
      categories={categories}
      activeCategory={doc.category}
      activeDocSlug={activeDocSlug}
      categoryDocs={categoryDocs}
      variant="article"
    >
      <article className="hub-article">
        <header className="hub-article-header">
          <div className="hub-article-meta">
            <span>{categoryInfo.label}</span>
            <span>{doc.readingTime}</span>
          </div>
          <h1>{doc.title}</h1>
        </header>

        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: doc.content }} />
      </article>
    </CommunityShell>
  )
}
