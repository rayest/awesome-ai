import type { Metadata } from 'next'
import Link from 'next/link'
import { searchArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: '搜索' }
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() || ''
  const results = query ? await searchArticles(query) : []
  return <main className="site-main page-main search-page"><header className="page-intro"><h1>搜索</h1><p>从标题、摘要、正文和主题中找到需要的知识。</p></header><div className="search-surface"><form className="search-input" action="/search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg><input id="knowledge-search" name="q" defaultValue={query} autoFocus placeholder="例如：Agent 记忆、MCP、上下文工程" /><button className="primary-button" type="submit">搜索</button></form>{query ? <div className="search-results"><p>{results.length ? `找到 ${results.length} 条内容` : '没有匹配内容'}</p>{results.map((article) => <Link href={`/articles/${article.slug}`} key={article.slug}><span>{article.categoryLabel}</span><strong>{article.title}</strong><small>{article.summary}</small></Link>)}{results.length === 0 ? <Link className="search-empty-cta" href="/submit">提交一个值得整理的来源</Link> : null}</div> : <div className="search-suggestions"><span>试试搜索</span><Link href="/search?q=Agent">Agent</Link><Link href="/search?q=上下文">上下文工程</Link><Link href="/search?q=工具">工具协议</Link></div>}</div></main>
}
