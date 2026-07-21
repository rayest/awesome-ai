export interface ApiEnvelope<T> {
  code: number
  message: string
  response: T
}
export interface Dashboard { draft_articles:number; reviewing_articles:number; new_leads:number; new_submissions:number; published_podcasts:number }

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
  content_markdown: string
  cover_url?: string
  category_id?: number
  status: 'draft' | 'reviewing' | 'scheduled' | 'published' | 'archived'
  featured: boolean
  source_name?: string
  source_url?: string
  source_verified: boolean
  updated_at: string
}

export type ArticleInput = Pick<Article, 'slug'|'title'|'summary'|'content_markdown'|'featured'|'source_verified'> & Partial<Pick<Article,'cover_url'|'category_id'|'source_name'|'source_url'>>

export interface Category { id:number; slug:string; name:string; description:string }
export interface Topic { id:number; slug:string; title:string; summary:string; audience:string; goals:string; cover_url?:string; article_ids:number[]; status:string; updated_at:string }
export interface Podcast { id:number; slug:string; title:string; summary:string; show_notes:string; chapters:Array<{time:string;title:string}>; cover_url?:string; audio_url:string; duration_seconds:number; status:string; updated_at:string }
export interface Source { id:number; name:string; source_type:string; url:string; rss_url?:string; is_active:boolean; updated_at:string }
export interface Submission { id:number; source_url:string; suggested_title?:string; reason:string; contact?:string; status:string; created_at:string }
export interface OperationRecord { id:number; status?:string; action?:string; target_type?:string; target_id?:number; model?:string; run_type?:string; error_message?:string; failure_reason?:string; created_at:string }

export interface Lead {
  id: number
  title: string
  url: string
  status: 'new' | 'shortlisted' | 'converted' | 'rejected' | 'fetch_failed'
  created_at: string
  failure_reason?: string
}

export interface LibraryResource {
  id: number
  slug: string
  title: string
  summary: string
  resource_type: string
  platform: string
  difficulty: string
  file_format: string
  content: string
  instructions: string
  variables: string
  version: string
  requires_api_key: boolean
  featured: boolean
  status: 'draft' | 'reviewing' | 'published' | 'archived'
  published_at?: string
  verified_at?: string
  updated_at: string
}

export type LibraryResourceInput = Omit<LibraryResource, 'id' | 'status' | 'published_at' | 'updated_at'>

export interface CatalogProfile { id:number; slug:string; name:string; profile_type:'model'|'tool'; provider:string; summary:string; pricing:string; availability:string; context_window:string; capabilities:string; best_for:string; limitations:string; latest_change:string; website_url?:string; api_available:boolean; open_source:boolean; status:'draft'|'reviewing'|'published'|'archived'; verified_at?:string; updated_at:string }
export type CatalogProfileInput = Omit<CatalogProfile,'id'|'status'|'updated_at'>
