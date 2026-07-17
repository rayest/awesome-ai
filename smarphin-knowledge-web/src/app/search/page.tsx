import type { Metadata } from 'next'
import { SearchClient } from '@/components/content/SearchClient'
import { listArticles } from '@/lib/knowledge'

export const metadata: Metadata = { title: '搜索' }
export default async function SearchPage() { return <main className="site-main page-main search-page"><header className="page-intro"><h1>搜索</h1><p>从文章标题、摘要和主题中找到需要的知识。</p></header><SearchClient articles={await listArticles()} /></main> }
