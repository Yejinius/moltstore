// Shared types for both SQLite and Supabase implementations

export interface DbApp {
  id: string
  name: string
  description: string
  long_description: string
  category: string
  price: number
  currency: string
  version: string
  status: 'pending' | 'in_review' | 'approved' | 'published' | 'rejected'
  file_hash?: string
  file_path?: string
  verified: number | boolean
  api_access: number | boolean
  downloads: number
  rating: number
  user_id?: string
  developer_name: string
  developer_verified: number | boolean
  uploaded_at: string
  last_updated: string
  review_notes?: string
}

export interface DbAppWithDetails extends DbApp {
  features: string[]
  tags: string[]
}

export interface DbReview {
  id: number
  app_id: string
  user_id?: string
  user_name: string
  user_email: string
  rating: number
  title: string
  comment?: string
  created_at: string
  helpful_count: number
}

export interface DbVersion {
  id: number
  app_id: string
  version: string
  release_notes?: string
  file_hash?: string
  file_path?: string
  released_at: string
}

export interface DbDownload {
  id: number
  app_id: string
  user_email?: string
  api_key?: string
  downloaded_at: string
}

export interface DbSecurityScan {
  id: number
  app_id: string
  scan_type: string
  passed: number | boolean
  score: number
  checks: string
  recommendation: string
  scanned_at: string
}
