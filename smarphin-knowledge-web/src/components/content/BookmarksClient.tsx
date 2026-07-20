'use client'

import Link from 'next/link'
import { BookmarkSimple } from '@phosphor-icons/react'
import { useMemo, useSyncExternalStore } from 'react'
import type { ArticleSummary } from '@/lib/knowledge'
import { getBookmarksSnapshot, parseBookmarksSnapshot, subscribeBookmarks } from './bookmark-store'
import { BookmarkButton } from './BookmarkButton'

export function BookmarksClient({ articles }: { articles: ArticleSummary[] }) {
  const snapshot = useSyncExternalStore(subscribeBookmarks, getBookmarksSnapshot, () => '[]')
  const bookmarks = useMemo(() => parseBookmarksSnapshot(snapshot), [snapshot])
  const bySlug = new Map(articles.map((article) => [article.slug, article]))
  const savedArticles = bookmarks.map((bookmark) => bySlug.get(bookmark.slug)).filter((article): article is ArticleSummary => Boolean(article))

  if (savedArticles.length === 0) {
    return <section className="bookmarks-empty"><BookmarkSimple size={34} /><h2>还没有收藏内容</h2><p>在今日情报或文章详情中点击收藏，内容就会出现在这里。</p><Link className="primary-button" href="/articles">浏览知识库</Link></section>
  }

  return <section className="bookmark-list" aria-live="polite"><div className="bookmark-count"><span>已保存 {savedArticles.length} 条</span><small>收藏仅保存在当前浏览器</small></div>{savedArticles.map((article, index) => <article key={article.slug}><span>{String(index + 1).padStart(2, '0')}</span><div><div className="article-meta"><span>{article.categoryLabel}</span><span>{article.readingMinutes} 分钟</span>{article.publishedAt ? <time>{article.publishedAt}</time> : null}</div><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p>{article.summary}</p></div><BookmarkButton slug={article.slug} title={article.title} compact /></article>)}</section>
}
