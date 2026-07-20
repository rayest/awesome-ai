import type { Metadata } from 'next'
import { ComparisonDirectory } from '@/components/content/ComparisonDirectory'
import { listCatalogProfiles } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 工具目录｜知序', description: '集中查看经过编辑整理的 AI 工具、协议与工作流实践。' }

export default async function ToolsPage() {
  const profiles = await listCatalogProfiles('tool')
  return <ComparisonDirectory eyebrow="TOOL DECISION GUIDE" title="AI 工具对比" description="对比价格、平台可用性、适用场景与限制，不接受厂商自助提交或商业排名。" profiles={profiles} />
}
