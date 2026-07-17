import type { Metadata } from 'next'
import { ArticleRow } from '@/components/content/ArticleRow'
import { listArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: '内容库', description: '浏览经过来源核验和编辑整理的 AI 内容。' }

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const all = await listArticles()
  const categories = Array.from(new Map(all.map((article) => [article.category, article.categoryLabel])).entries())
  const articles = category ? all.filter((article) => article.category === category) : all
  return <main className="site-main page-main"><header className="page-intro"><h1>内容库</h1><p>把模型、Agent、工具和产品变化放回完整上下文中阅读。</p></header><nav className="filter-links" aria-label="内容筛选"><a className={!category ? 'is-active' : ''} href="/articles">全部</a>{categories.map(([slug, label]) => <a className={category === slug ? 'is-active' : ''} href={`/articles?category=${slug}`} key={slug}>{label}</a>)}</nav>{articles.length ? <div className="article-list library-list">{articles.map((article, index) => <ArticleRow key={article.slug} article={article} index={index + 1} />)}</div> : <div className="empty-state"><h2>这个分类还没有内容</h2><p>编辑完成后会在这里出现。</p></div>}</main>
}
