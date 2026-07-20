import type { Metadata } from 'next'
import { ComparisonDirectory } from '@/components/content/ComparisonDirectory'
import { listCatalogProfiles } from '@/lib/knowledge'

export const metadata: Metadata = { title: 'AI 模型选型｜知序', description: '比较 AI 模型的价格、可用性、能力边界与适用场景。' }

export default async function ModelsPage() {
  const profiles = await listCatalogProfiles('model')
  return <ComparisonDirectory eyebrow="MODEL DECISION GUIDE" title="AI 模型选型" description="用于比较并选择基础模型：集中查看价格、可用性、上下文、能力边界与适用场景。" profiles={profiles} />
}
