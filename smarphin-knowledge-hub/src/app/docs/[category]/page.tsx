import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategories, getDocsByCategory } from '@/lib/docs'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return getCategories().map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params
  return {
    title: `${category} - SmartHub`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const categories = getCategories()
  const docs = getDocsByCategory(category)

  if (!categories.includes(category)) notFound()

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>SmartHub</Link>
        <div className="tagline">知识整理 & 交互学习</div>

        <div className="nav-label">主题导航</div>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/docs/${cat}`}
            className={`nav-item ${cat === category ? 'active' : ''}`}
          >
            <span className="nav-number">📁</span>
            {cat}
          </Link>
        ))}
      </aside>
      <main className="main">
        <div className="content-wrapper">
          <section className="hero">
            <div className="eyebrow">主题</div>
            <h1 className="hero-title">{category}</h1>
            <p className="hero-desc">
              共 {docs.length} 篇文档
            </p>
          </section>

          <div className="doc-list">
            {docs.map((doc) => (
              <Link
                key={doc.slug.join('/')}
                href={`/docs/${doc.slug.join('/')}`}
                className="doc-card"
              >
                <div className="doc-card-title">{doc.title}</div>
                <div className="doc-card-meta">{doc.readingTime}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
