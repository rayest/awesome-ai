import Link from 'next/link'
import type { ResourceSummary } from '@/lib/knowledge'
import { Card, CardImage, CardBody, CardHeader, CardTitle, CardSummary, CardFooter, CardMeta } from './Card'

const typeLabels: Record<string, string> = {
  prompt_rules: '提示词与规则',
  agent_protocol: 'Agent 与协议',
  workflow: '自动化工作流',
  code_evaluation: '代码与评测',
  product_content: '产品与内容模板',
}

export function ResourceCard({ resource }: { resource: ResourceSummary }) {
  const typeLabel = typeLabels[resource.resourceType] || '资源'
  return (
    <Card className="resource-card">
      <CardImage
        src={null}
        alt={resource.title}
        fallback={<DefaultResourceLogo title={resource.title} platform={resource.platform} />}
        overlay={<span className="knowledge-card-platform-tag">{resource.platform}</span>}
      />
      <CardBody>
        <CardHeader category={typeLabel} badge={resource.featured ? '编辑推荐' : undefined} />
        <CardTitle><Link href={`/resources/${resource.slug}`}>{resource.title}</Link></CardTitle>
        <CardSummary>{resource.summary}</CardSummary>
        <CardFooter>
          <CardMeta>
            <span>v{resource.version}</span>
            <span>{resource.fileFormat}</span>
            <span>{resource.difficulty}</span>
          </CardMeta>
          <Link href={`/resources/${resource.slug}`} className="knowledge-card-link" aria-label={`查看 ${resource.title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </Link>
        </CardFooter>
      </CardBody>
    </Card>
  )
}

function DefaultResourceLogo({ title, platform }: { title: string; platform: string }) {
  const initial = title.slice(0, 1).toUpperCase()
  return (
    <div className="resource-card-logo">
      <div className="resource-card-logo-mark">{initial}</div>
      <span className="resource-card-platform">{platform}</span>
    </div>
  )
}