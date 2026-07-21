import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArticleCard } from '@/components/content/ArticleCard'
import { listArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: '内容库', description: '浏览经过来源核验和编辑整理的 AI 内容。' }

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  if (category === 'newsletter') redirect('/hot')
  const all = (await listArticles()).filter((article) => article.category !== 'newsletter')
  const categories = Array.from(new Map(all.map((article) => [article.category, article.categoryLabel])).entries())
  const articles = category ? all.filter((article) => article.category === category) : all
  return (
    <main className="site-main page-main">
      <header className="page-intro">
        <span className="page-eyebrow">EVERGREEN KNOWLEDGE</span>
        <h1>知识库</h1>
        <p>理解概念、方法和工程实践；每日变化去热点追踪，可复制的模板与配置去资源库获取。</p>
      </header>
      <nav className="filter-links" aria-label="知识分类筛选">
        <Link className={!category ? 'is-active' : ''} aria-current={!category ? 'page' : undefined} href="/articles">全部知识</Link>
        {categories.map(([slug, label]) => <Link className={category === slug ? 'is-active' : ''} aria-current={category === slug ? 'page' : undefined} href={`/articles?category=${slug}`} key={slug}>{label}</Link>)}
      </nav>
      {articles.length ? (
        <div className="knowledge-card-grid is-3col">
          {articles.map((article) => <ArticleCard key={article.slug} article={article} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>这个分类还没有内容</h2>
          <p>编辑完成并发布后会在这里出现。</p>
        </div>
      )}
    </main>
  )
}