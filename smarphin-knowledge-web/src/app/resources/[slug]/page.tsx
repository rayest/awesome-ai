import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResourceActions } from '@/components/content/ResourceActions'
import { getResourceBySlug } from '@/lib/knowledge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const item = await getResourceBySlug((await params).slug); return item ? { title: item.title, description: item.summary } : { title: '资源不存在' } }

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const item = await getResourceBySlug((await params).slug)
  if (!item) notFound()
  return <main className="site-main resource-detail"><Link className="back-link" href="/resources">← 返回资源库</Link><header><span className="page-eyebrow">{item.resourceType.replaceAll('_', ' ').toUpperCase()}</span><h1>{item.title}</h1><p>{item.summary}</p><dl><div><dt>适用平台</dt><dd>{item.platform}</dd></div><div><dt>文件格式</dt><dd>{item.fileFormat}</dd></div><div><dt>难度</dt><dd>{item.difficulty}</dd></div><div><dt>版本</dt><dd>{item.version}</dd></div><div><dt>API Key</dt><dd>{item.requiresApiKey ? '需要' : '不需要'}</dd></div><div><dt>最后验证</dt><dd>{item.verifiedAt || '等待复核'}</dd></div></dl></header><section className="resource-code"><div><h2>可直接使用的内容</h2><ResourceActions slug={item.slug} title={item.title} content={item.content} fileFormat={item.fileFormat} /></div><pre><code>{item.content}</code></pre></section>{item.instructions ? <section className="resource-notes"><h2>使用方法</h2><p>{item.instructions}</p></section> : null}{item.variables ? <section className="resource-notes"><h2>需要修改的变量</h2><p>{item.variables}</p></section> : null}</main>
}
