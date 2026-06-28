import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDoc, getDocSlugs, getCategories, getDocsByCategory } from '@/lib/docs'
import { getLearningNodeBySlug } from '@/lib/learning-map'
import KnowledgeConsole from '@/components/KnowledgeConsole'

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
  const learningNode = getLearningNodeBySlug(slug)

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>SmartHub</Link>
        <div className="tagline">知识整理 & 交互学习</div>

        <div className="nav-label">主题导航</div>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/docs/${category}`}
            className="nav-item"
          >
            <span className="nav-number">📁</span>
            {category}
          </Link>
        ))}

        {categoryDocs.length > 0 && (
          <>
            <div className="nav-label" style={{ marginTop: '40px' }}>本主题文档</div>
            {categoryDocs.map((d) => (
              <Link
                key={d.slug.join('/')}
                href={`/docs/${d.slug.join('/')}`}
                className={`nav-item ${d.slug.join('/') === slug.join('/') ? 'active' : ''}`}
              >
                <span className="nav-number">📄</span>
                {d.title}
              </Link>
            ))}
          </>
        )}
      </aside>
      <main className="main doc-main">
        <div className="content-wrapper doc-content-wrapper">
          <article className="markdown-content" dangerouslySetInnerHTML={{ __html: doc.content }} />
        </div>
      </main>
      <KnowledgeConsole node={learningNode} readingTime={doc.readingTime} />
    </div>
  )
}
