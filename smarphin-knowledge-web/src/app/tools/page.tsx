import type { Metadata } from 'next'
import { ComparisonDirectory } from '@/components/content/ComparisonDirectory'
import { listCatalogProfiles } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 工具选型｜知序', description: '比较 AI 产品与工具的价格、平台可用性、适用场景与限制。' }

export default async function ToolsPage() {
  const profiles = await listCatalogProfiles('tool')
  return <ComparisonDirectory eyebrow="TOOL DECISION GUIDE" title="AI 工具选型" description="用于比较并选择产品或服务：集中查看价格、平台可用性、适用场景与限制；模板和配置请前往资源库。" profiles={profiles} />
}
