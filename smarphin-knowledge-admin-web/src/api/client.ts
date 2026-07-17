import { mockArticles, mockDashboard, mockLeads } from './mock'
import type { ApiEnvelope, Article, Lead, PageResult } from './types'

const baseUrl = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8102/api/admin'
const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = sessionStorage.getItem('knowledge_admin_token')
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || payload.code !== 0) throw new Error(payload.message || '请求失败')
  return payload.response
}

export const adminApi = {
  login: async (email: string, password: string) => useMocks
    ? { access_token: 'demo-token', admin: { display_name: '内容管理员', email } }
    : request<{ access_token: string; admin: { display_name: string; email: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  dashboard: async () => useMocks ? mockDashboard : request<typeof mockDashboard>('/dashboard'),
  articles: async (status?: string) => useMocks ? mockArticles : request<PageResult<Article>>(`/articles${status ? `?status=${status}` : ''}`),
  leads: async (status?: string) => useMocks ? mockLeads : request<PageResult<Lead>>(`/leads${status ? `?status=${status}` : ''}`),
  createLead: async (url: string) => useMocks ? { id: Date.now(), url, status: 'new' } : request<{ id: number; url: string; status: string }>('/leads', { method: 'POST', body: JSON.stringify({ url }) }),
  transitionArticle: async (id: number, status: string) => useMocks ? { id, status } : request(`/articles/${id}/${status}`, { method: 'POST', body: JSON.stringify({}) }),
}
