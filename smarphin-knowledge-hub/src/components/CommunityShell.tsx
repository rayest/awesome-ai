import Link from 'next/link'
import type { DocMetadata } from '@/lib/docs'
import { getCategoryInfo } from '@/lib/docs'

interface CommunityShellProps {
  children: React.ReactNode
  categories: string[]
  activeCategory?: string
  activeDocSlug?: string
  categoryDocs?: DocMetadata[]
  variant?: 'home' | 'section' | 'article'
}

export default function CommunityShell({
  children,
  categories,
  activeCategory,
  activeDocSlug,
  categoryDocs = [],
  variant = 'section',
}: CommunityShellProps) {
  const totalSections = categories.length

  return (
    <div className={`hub-shell hub-shell-${variant}`}>
      <aside className="hub-sidebar" aria-label="知识社区导航">
        <Link href="/" className="hub-brand" aria-label="返回 SmartHub 首页">
          <span className="hub-brand-mark" aria-hidden="true">S</span>
          <span>
            <span className="hub-brand-name">SmartHub</span>
            <span className="hub-brand-subtitle">AI knowledge community</span>
          </span>
        </Link>

        <div className="hub-sidebar-note">
          分享 AI、Agent、工程框架与信息流观察，保留可复读的技术上下文。
        </div>

        <nav className="hub-nav-block" aria-label="主题导航">
          <div className="hub-nav-heading">主题</div>
          {categories.map((category) => {
            const info = getCategoryInfo(category)
            const isActive = category === activeCategory

            return (
              <Link
                key={category}
                href={`/docs/${category}`}
                className={`hub-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <span className="hub-nav-code" aria-hidden="true">{info.shortCode}</span>
                <span>
                  <span className="hub-nav-title">{info.label}</span>
                  <span className="hub-nav-desc">{info.shortDescription}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        {categoryDocs.length > 0 && (
          <nav className="hub-nav-block hub-topic-docs" aria-label="当前主题文章">
            <div className="hub-nav-heading">本主题</div>
            {categoryDocs.map((doc) => {
              const docSlug = doc.slug.join('/')
              return (
                <Link
                  key={docSlug}
                  href={`/docs/${docSlug}`}
                  className={`hub-doc-link ${docSlug === activeDocSlug ? 'is-active' : ''}`}
                >
                  <span className="hub-doc-link-title">{doc.title}</span>
                  <span className="hub-doc-link-meta">{doc.readingTime}</span>
                </Link>
              )
            })}
          </nav>
        )}

        <div className="hub-sidebar-footer">
          <span>{totalSections} 个主题</span>
          <span>持续更新</span>
        </div>
      </aside>

      <main className="hub-main">
        {children}
      </main>
    </div>
  )
}
