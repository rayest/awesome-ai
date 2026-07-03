import Link from 'next/link'
import { getCategories, getAllDocs, getDocsByCategory } from '@/lib/docs'

export default function Home() {
  const categories = getCategories()
  const allDocs = getAllDocs()

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link href="/" className="logo" style={{ textDecoration: 'none' }}>SmartHub</Link>
        <div className="tagline">知识整理 & 文档阅读</div>

        <div className="nav-label">主题导航</div>
        {categories.map((category) => (
          <Link key={category} href={`/docs/${category}`} className="nav-item">
            <span className="nav-number">📁</span>
            {category}
          </Link>
        ))}
      </aside>

      <main className="main">
        <div className="content-wrapper">
          <section className="hero">
            <div className="eyebrow">Knowledge Hub</div>
            <h1 className="hero-title">SmartHub</h1>
            <p className="hero-desc">共 {allDocs.length} 篇文档，按主题整理。</p>
          </section>

          <div className="doc-list">
            {categories.map((category) => {
              const docs = getDocsByCategory(category)
              const firstDoc = docs[0]

              return (
                <Link key={category} href={`/docs/${category}`} className="doc-card">
                  <div className="doc-card-title">{category}</div>
                  <div className="doc-card-meta">
                    {docs.length} 篇文档{firstDoc ? ` · 包含：${firstDoc.title}` : ''}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
