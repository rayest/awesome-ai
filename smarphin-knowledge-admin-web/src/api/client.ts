import type { ApiEnvelope, Article, ArticleInput, CatalogProfile, CatalogProfileInput, Category, Dashboard, Lead, LibraryResource, LibraryResourceInput, OperationRecord, PageResult, Podcast, Source, Submission, Topic } from './types'

const baseUrl = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8102/api/admin'

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
  login: async (email: string, password: string) => request<{ access_token: string; admin: { display_name: string; email: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  dashboard: async () => request<Dashboard>('/dashboard'),
  articles: async (status?: string, q?:string) => request<PageResult<Article>>(`/articles?${new URLSearchParams({...status?{status}:{},...q?{q}:{},page_size:'100'})}`),
  article: async (id:number) => request<Article>(`/articles/${id}`),
  createArticle: async (data:ArticleInput) => request<Article>('/articles',{method:'POST',body:JSON.stringify(data)}),
  updateArticle: async (id:number,data:Partial<ArticleInput>) => request<Article>(`/articles/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  leads: async (status?: string) => request<PageResult<Lead>>(`/leads${status ? `?status=${status}` : ''}`),
  createLead: async (url: string) => request<{ id: number; url: string; status: string }>('/leads', { method: 'POST', body: JSON.stringify({ url }) }),
  updateLead: async (id:number,data:Partial<Lead>) => request<Lead>(`/leads/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  transitionArticle: async (id: number, status: string, scheduled_at?:string) => request(`/articles/${id}/${status}`, { method: 'POST', body: JSON.stringify({scheduled_at}) }),
  resources: async (status?: string) => request<PageResult<LibraryResource>>(`/library-resources${status ? `?status=${status}` : ''}`),
  createResource: async (data: LibraryResourceInput) => request<LibraryResource>('/library-resources', { method: 'POST', body: JSON.stringify(data) }),
  updateResource: async (id: number, data: Partial<LibraryResourceInput>) => request<LibraryResource>(`/library-resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  transitionResource: async (id: number, status: string) => request<LibraryResource>(`/library-resources/${id}/${status}`, { method: 'POST' }),
  catalog: async (type?: string) => request<CatalogProfile[]>(`/catalog${type ? `?profile_type=${type}` : ''}`),
  createProfile: async (data: CatalogProfileInput) => request<CatalogProfile>('/catalog',{method:'POST',body:JSON.stringify(data)}),
  updateProfile: async (id:number,data:Partial<CatalogProfileInput>) => request<CatalogProfile>(`/catalog/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  transitionProfile: async (id:number,status:string) => request<CatalogProfile>(`/catalog/${id}/${status}`,{method:'POST'}),
  categories: async()=>request<Category[]>('/categories'), createCategory:async(data:Omit<Category,'id'>)=>request<Category>('/categories',{method:'POST',body:JSON.stringify(data)}), updateCategory:async(id:number,data:Omit<Category,'id'>)=>request<Category>(`/categories/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  topics:async()=>request<Topic[]>('/topics'), createTopic:async(data:Omit<Topic,'id'|'status'|'updated_at'>)=>request<Topic>('/topics',{method:'POST',body:JSON.stringify(data)}), updateTopic:async(id:number,data:Omit<Topic,'id'|'status'|'updated_at'>)=>request<Topic>(`/topics/${id}`,{method:'PUT',body:JSON.stringify(data)}), transitionTopic:async(id:number,status:string)=>request<Topic>(`/topics/${id}/${status}`,{method:'POST'}),
  podcasts:async()=>request<Podcast[]>('/podcasts'), createPodcast:async(data:Omit<Podcast,'id'|'status'|'updated_at'>)=>request<Podcast>('/podcasts',{method:'POST',body:JSON.stringify(data)}), updatePodcast:async(id:number,data:Omit<Podcast,'id'|'status'|'updated_at'>)=>request<Podcast>(`/podcasts/${id}`,{method:'PUT',body:JSON.stringify(data)}), transitionPodcast:async(id:number,status:string)=>request<Podcast>(`/podcasts/${id}/${status}`,{method:'POST'}),
  sources:async()=>request<Source[]>('/sources'), createSource:async(data:Omit<Source,'id'|'updated_at'>)=>request<Source>('/sources',{method:'POST',body:JSON.stringify(data)}), updateSource:async(id:number,data:Omit<Source,'id'|'updated_at'>)=>request<Source>(`/sources/${id}`,{method:'PUT',body:JSON.stringify(data)}),
  submissions:async(status?:string)=>request<PageResult<Submission>>(`/submissions${status?`?status=${status}`:''}`), updateSubmission:async(id:number,status:string)=>request<Submission>(`/submissions/${id}/status`,{method:'PUT',body:JSON.stringify({status})}),
  operations:async(kind:string)=>request<PageResult<OperationRecord>>(`/operations/${kind}`),
}
