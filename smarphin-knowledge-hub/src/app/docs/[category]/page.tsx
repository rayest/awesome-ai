import Link from 'next/link'
import { notFound } from 'next/navigation'
import CommunityShell from '@/components/CommunityShell'
import { getCategories, getDocsByCategory, getCategoryInfo } from '@/lib/docs'

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
  const info = getCategoryInfo(category)

  return (
    <CommunityShell categories={categories} activeCategory={category} variant="section">
      <div className="hub-content">
        <section className="hub-channel-hero">
          <div className="hub-channel-code">{info.shortCode}</div>
          <div>
            <p className="hub-kicker">主题频道</p>
            <h1>{info.label}</h1>
            <p>{info.description}</p>
          </div>
          <div className="hub-channel-count">
            <span>{docs.length}</span>
            <span>篇内容</span>
          </div>
        </section>

        <section className="hub-section">
          <div className="hub-section-header">
            <h2>全部内容</h2>
            <p>按更新时间和章节顺序整理，适合系统阅读或按需回查。</p>
          </div>

          <div className="hub-list">
            {docs.map((doc) => (
              <Link
                key={doc.slug.join('/')}
                href={`/docs/${doc.slug.join('/')}`}
                className="hub-list-item"
              >
                <span className="hub-list-title">{doc.title}</span>
                <span className="hub-list-meta">{doc.readingTime}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </CommunityShell>
  )
}
