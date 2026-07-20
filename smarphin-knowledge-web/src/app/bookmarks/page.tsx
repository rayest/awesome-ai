import type { Metadata } from 'next'
import { BookmarksClient } from '@/components/content/BookmarksClient'
import { listArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: '我的收藏｜知序', description: '查看保存在当前浏览器中的知序内容。' }

export default async function BookmarksPage() {
  const articles = await listArticles()
  return <main className="site-main page-main"><header className="page-intro"><span className="page-eyebrow">SAVED FOR LATER</span><h1>我的收藏</h1><p>把需要反复阅读的情报与知识放在一起。这里只展示你主动保存的内容。</p></header><BookmarksClient articles={articles} /></main>
}
