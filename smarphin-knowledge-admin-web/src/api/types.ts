export interface ApiEnvelope<T> {
  code: number
  message: string
  response: T
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface Article {
  id: number
  slug: string
  title: string
  summary: string
  status: 'draft' | 'reviewing' | 'scheduled' | 'published' | 'archived'
  featured: boolean
  source_name?: string
  source_verified: boolean
  updated_at: string
}

export interface Lead {
  id: number
  title: string
  url: string
  status: 'new' | 'shortlisted' | 'converted' | 'rejected' | 'fetch_failed'
  created_at: string
  failure_reason?: string
}
