import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, listArticles } from '@/lib/knowledge'

export async function generateStaticParams() { return (await listArticles()).map((article) => ({ slug: article.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const article = await getArticleBySlug(slug); return article ? { title: article.title, description: article.summary } : { title: '内容不存在' } }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()
  const all = await listArticles()
  const related = all.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 3)
  return <main className="article-page"><Link className="back-link" href="/articles">← 返回内容库</Link><article><header className="article-header"><div className="article-meta"><span>{article.categoryLabel}</span><span>{article.readingMinutes} 分钟</span>{article.publishedAt ? <time>{article.publishedAt}</time> : null}</div><h1>{article.title}</h1><p>{article.summary}</p><div className="source-line"><span className="source-check">✓</span><span><strong>{article.sourceName}</strong><small>{article.sourceVerified ? '来源已核验' : '等待来源核验'}</small></span>{article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noreferrer">查看原文</a> : null}</div></header>{article.coverUrl ? <figure className="article-cover"><img src={article.coverUrl} alt={`${article.title} 的内容配图`} /></figure> : null}<div className="markdown-content article-body" dangerouslySetInnerHTML={{ __html: article.contentHtml }} /></article>{related.length ? <aside className="related-content"><h2>继续阅读</h2>{related.map((item) => <Link href={`/articles/${item.slug}`} key={item.slug}><span>{item.categoryLabel}</span><strong>{item.title}</strong></Link>)}</aside> : null}</main>
}
