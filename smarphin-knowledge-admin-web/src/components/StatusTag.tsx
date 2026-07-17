import { Tag } from 'antd'

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  reviewing: { label: '审核中', color: 'processing' },
  scheduled: { label: '待发布', color: 'warning' },
  published: { label: '已发布', color: 'success' },
  archived: { label: '已归档', color: 'default' },
  new: { label: '新线索', color: 'processing' },
  shortlisted: { label: '已入选', color: 'warning' },
  converted: { label: '已转文章', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  fetch_failed: { label: '采集失败', color: 'error' },
}

export function StatusTag({ status }: { status: string }) {
  const item = statusMap[status] || { label: status, color: 'default' }
  return <Tag color={item.color}>{item.label}</Tag>
}
