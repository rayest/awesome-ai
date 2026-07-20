import type { Metadata } from 'next'
import Link from 'next/link'
import { listResources } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 资源库｜知序', description: '可直接复制和下载的提示词、配置、工作流、代码及模板。' }

const groups = [
  ['prompt_rules', '提示词与规则', 'Prompt、System Prompt 与编辑器规则'],
  ['agent_protocol', 'Agent 与协议', 'Agent、MCP 与 Skills 配置'],
  ['workflow', '自动化工作流', 'n8n、Dify 与 Coze 工作流'],
  ['code_evaluation', '代码与评测', '模型调用代码与评测集'],
  ['product_content', '产品与内容模板', '产品需求与内容生产模板'],
]

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const type = (await searchParams).type
  const resources = await listResources(type)
  return <main className="site-main page-main resources-page"><header className="resource-hero"><div><span className="page-eyebrow">READY TO USE</span><h1>AI 资源库</h1><p>由编辑整理并持续验证的生产资料。直接复制、下载和修改，不需要加入社群或提交内容。</p></div><strong>{resources.length}<small>项已发布资源</small></strong></header><nav className="resource-groups" aria-label="资源分类"><Link href="/resources" className={!type ? 'is-active' : ''} aria-current={!type ? 'page' : undefined}><strong>全部资源</strong><span>浏览所有可用资料</span></Link>{groups.map(([slug, label, description]) => <Link href={`/resources?type=${slug}`} className={type === slug ? 'is-active' : ''} aria-current={type === slug ? 'page' : undefined} key={slug}><strong>{label}</strong><span>{description}</span></Link>)}</nav>{resources.length ? <section className="resource-grid">{resources.map((item) => <article key={item.slug}><header><span>{groups.find(([slug]) => slug === item.resourceType)?.[1] || '资源'}</span>{item.featured ? <i>编辑推荐</i> : null}</header><h2><Link href={`/resources/${item.slug}`}>{item.title}</Link></h2><p>{item.summary}</p><dl><div><dt>平台</dt><dd>{item.platform}</dd></div><div><dt>格式</dt><dd>{item.fileFormat}</dd></div><div><dt>难度</dt><dd>{item.difficulty}</dd></div></dl><footer><span>v{item.version}</span><Link href={`/resources/${item.slug}`}>查看并使用 →</Link></footer></article>)}</section> : <section className="empty-state"><h2>这个分类还没有已发布资源</h2><p>资源会由编辑在管理后台完成核验和发布后出现在这里。</p></section>}</main>
}
