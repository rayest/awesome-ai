import Link from 'next/link'
import { getCategories, getAllDocs } from '@/lib/docs'

export default function Home() {
  const categories = getCategories()
  const allDocs = getAllDocs()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">SmartHub</div>
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
      </aside>
      <main className="main">
        <div className="content-wrapper">
          <section className="hero">
            <div className="eyebrow">欢迎使用</div>
            <h1 className="hero-title">SmartHub</h1>
            <p className="hero-desc">
              个人知识整理与学习笔记系统。通过动态读取 markdown 文件夹，自动渲染内容，支持优雅的阅读体验。
            </p>
          </section>

          <div className="nav-label">最近文档</div>
          <div className="doc-list">
            {allDocs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>
                暂无文档。请在 docs 目录下添加 markdown 文件。
              </p>
            ) : (
              allDocs.map((doc) => (
                <Link
                  key={doc.slug.join('/')}
                  href={`/docs/${doc.slug.join('/')}`}
                  className="doc-card"
                >
                  <div className="doc-card-title">{doc.title}</div>
                  <div className="doc-card-meta">
                    {doc.category} · {doc.readingTime}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
