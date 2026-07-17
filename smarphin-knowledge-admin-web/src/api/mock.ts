import type { Article, Lead, PageResult } from './types'

export const mockDashboard = {
  draft_articles: 7,
  reviewing_articles: 3,
  new_leads: 12,
  new_submissions: 5,
  published_podcasts: 4,
}

export const mockArticles: PageResult<Article> = {
  items: [
    { id: 108, slug: 'agent-memory-engineering', title: 'Agent 记忆系统：从上下文窗口到可治理的长期记忆', summary: '拆解短期上下文、检索记忆与可审计更新。', status: 'reviewing', featured: true, source_name: 'Anthropic Engineering', source_verified: true, updated_at: '2026-07-17T09:32:00' },
    { id: 107, slug: 'gpt-5-6-feature-map', title: 'GPT-5.6 能力地图与开发者迁移要点', summary: '聚焦模型接口、工具调用和生产迁移。', status: 'draft', featured: false, source_name: 'OpenAI', source_verified: true, updated_at: '2026-07-17T08:18:00' },
    { id: 106, slug: 'loop-engineering', title: 'Loop Engineering：把 Agent 循环变成可靠系统', summary: '从停止条件、反馈信号和恢复策略展开。', status: 'published', featured: false, source_name: '知序编辑部', source_verified: true, updated_at: '2026-07-16T16:04:00' },
    { id: 105, slug: 'tool-protocols', title: '工具协议设计中的五个边界问题', summary: '分析工具 schema、权限、错误和幂等。', status: 'scheduled', featured: false, source_name: 'MCP Docs', source_verified: true, updated_at: '2026-07-16T11:20:00' },
  ],
  total: 4,
  page: 1,
  page_size: 20,
}

export const mockLeads: PageResult<Lead> = {
  items: [
    { id: 82, title: 'Building effective agents', url: 'https://example.com/effective-agents', status: 'new', created_at: '2026-07-17T10:18:00' },
    { id: 81, title: 'Context engineering patterns', url: 'https://example.com/context-engineering', status: 'shortlisted', created_at: '2026-07-17T09:42:00' },
    { id: 80, title: 'Agent observability guide', url: 'https://example.com/observability', status: 'fetch_failed', failure_reason: '来源页面请求超时', created_at: '2026-07-16T18:05:00' },
  ],
  total: 3,
  page: 1,
  page_size: 20,
}
