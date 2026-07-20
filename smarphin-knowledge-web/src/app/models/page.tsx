import type { Metadata } from 'next'
import { ComparisonDirectory } from '@/components/content/ComparisonDirectory'
import { listCatalogProfiles } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 模型观察｜知序', description: '集中查看经过编辑整理的 AI 模型能力、变化与实践记录。' }

export default async function ModelsPage() {
  const profiles = await listCatalogProfiles('model')
  return <ComparisonDirectory eyebrow="MODEL DECISION GUIDE" title="AI 模型对比" description="对比价格、可用性、上下文、能力边界与适用场景。所有字段均由编辑核验后发布。" profiles={profiles} />
}
