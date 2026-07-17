'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import type { ArticleSummary } from '@/lib/knowledge'

export function SearchClient({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const results = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase()
    if (!value) return []
    return articles.filter((article) => `${article.title} ${article.summary} ${article.categoryLabel}`.toLowerCase().includes(value)).slice(0, 20)
  }, [articles, deferredQuery])
  return <div className="search-surface"><label htmlFor="knowledge-search">搜索文章、专题与关键词</label><div className="search-input"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg><input id="knowledge-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：Agent 记忆、MCP、上下文工程" /></div>{query ? <div className="search-results"><p>{results.length ? `找到 ${results.length} 条内容` : '没有匹配内容'}</p>{results.map((article) => <Link href={`/articles/${article.slug}`} key={article.slug}><span>{article.categoryLabel}</span><strong>{article.title}</strong><small>{article.summary}</small></Link>)}{results.length === 0 ? <Link className="search-empty-cta" href="/submit">提交一个值得整理的来源</Link> : null}</div> : <div className="search-suggestions"><span>试试搜索</span><button onClick={() => setQuery('Agent')}>Agent</button><button onClick={() => setQuery('上下文')}>上下文工程</button><button onClick={() => setQuery('工具')}>工具协议</button></div>}</div>
}
