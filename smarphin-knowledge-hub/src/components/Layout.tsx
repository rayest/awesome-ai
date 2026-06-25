'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './layout.css'

interface LayoutProps {
  children: React.ReactNode
  categories: string[]
}

export default function Layout({ children, categories }: LayoutProps) {
  const pathname = usePathname()

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
            className={`nav-item ${pathname.startsWith(`/docs/${category}`) ? 'active' : ''}`}
          >
            <span className="nav-number">📁</span>
            {category}
          </Link>
        ))}
      </aside>
      <main className="main">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
