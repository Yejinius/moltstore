import { supabase } from './supabase'

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
  verified: boolean
  api_access: boolean
  downloads: number
  rating: number
  developer_name: string
  developer_verified: boolean
  uploaded_at: string
  last_updated: string
  review_notes?: string
}

export interface DbAppWithDetails extends DbApp {
  features: string[]
  tags: string[]
}

// Apps CRUD
export const createApp = async (app: Omit<DbApp, 'id' | 'uploaded_at' | 'last_updated' | 'downloads' | 'rating' | 'verified'>) => {
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  const { data, error } = await supabase
    .from('apps')
    .insert({
      id,
      name: app.name,
      description: app.description,
      long_description: app.long_description,
      category: app.category,
      price: app.price,
      currency: app.currency,
      version: app.version,
      status: app.status,
      file_hash: app.file_hash,
      file_path: app.file_path,
      api_access: app.api_access,
      developer_name: app.developer_name,
      developer_verified: app.developer_verified
    })
    .select()
    .single()
  
  if (error) throw error
  return id
}

export const addAppFeatures = async (appId: string, features: string[]) => {
  const records = features
    .filter(f => f.trim())
    .map(feature => ({ app_id: appId, feature }))
  
  if (records.length === 0) return
  
  const { error } = await supabase
    .from('app_features')
    .insert(records)
  
  if (error) throw error
}

export const addAppTags = async (appId: string, tags: string[]) => {
  const records = tags
    .filter(t => t.trim())
    .map(tag => ({ app_id: appId, tag }))
  
  if (records.length === 0) return
  
  const { error } = await supabase
    .from('app_tags')
    .insert(records)
  
  if (error) throw error
}

export const getAppById = async (id: string): Promise<DbAppWithDetails | null> => {
  const { data: app, error: appError } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single()
  
  if (appError || !app) return null
  
  const { data: features } = await supabase
    .from('app_features')
    .select('feature')
    .eq('app_id', id)
  
  const { data: tags } = await supabase
    .from('app_tags')
    .select('tag')
    .eq('app_id', id)
  
  return {
    ...app,
    features: features?.map(f => f.feature) || [],
    tags: tags?.map(t => t.tag) || []
  }
}

export const getAllApps = async (status?: string): Promise<DbAppWithDetails[]> => {
  let query = supabase.from('apps').select('*')
  
  if (status) {
    query = query.eq('status', status)
  }
  
  query = query.order('uploaded_at', { ascending: false })
  
  const { data: apps, error } = await query
  
  if (error || !apps) return []
  
  const appsWithDetails = await Promise.all(
    apps.map(async (app) => {
      const { data: features } = await supabase
        .from('app_features')
        .select('feature')
        .eq('app_id', app.id)
      
      const { data: tags } = await supabase
        .from('app_tags')
        .select('tag')
        .eq('app_id', app.id)
      
      return {
        ...app,
        features: features?.map(f => f.feature) || [],
        tags: tags?.map(t => t.tag) || []
      }
    })
  )
  
  return appsWithDetails
}

export const updateAppStatus = async (id: string, status: DbApp['status'], reviewNotes?: string) => {
  const { error } = await supabase
    .from('apps')
    .update({
      status,
      review_notes: reviewNotes || null,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) throw error
}

export const updateAppVerified = async (id: string, verified: boolean) => {
  const { error } = await supabase
    .from('apps')
    .update({ verified })
    .eq('id', id)
  
  if (error) throw error
}

export const searchApps = async (query: string, category?: string): Promise<DbAppWithDetails[]> => {
  let dbQuery = supabase
    .from('apps')
    .select(`
      *,
      app_tags!inner(tag)
    `)
    .eq('status', 'published')
  
  // Search in name, description, or tags
  const searchPattern = `%${query}%`
  dbQuery = dbQuery.or(`name.ilike.${searchPattern},description.ilike.${searchPattern},app_tags.tag.ilike.${searchPattern}`)
  
  if (category && category !== 'All') {
    dbQuery = dbQuery.eq('category', category)
  }
  
  dbQuery = dbQuery.order('downloads', { ascending: false })
  
  const { data: apps, error } = await dbQuery
  
  if (error || !apps) return []
  
  // Deduplicate apps (since we joined with tags)
  const uniqueApps = Array.from(
    new Map(apps.map(app => [app.id, app])).values()
  )
  
  const appsWithDetails = await Promise.all(
    uniqueApps.map(async (app) => {
      const { data: features } = await supabase
        .from('app_features')
        .select('feature')
        .eq('app_id', app.id)
      
      const { data: tags } = await supabase
        .from('app_tags')
        .select('tag')
        .eq('app_id', app.id)
      
      return {
        ...app,
        features: features?.map(f => f.feature) || [],
        tags: tags?.map(t => t.tag) || []
      }
    })
  )
  
  return appsWithDetails
}

// Reviews CRUD
export interface DbReview {
  id: number
  app_id: string
  user_name: string
  user_email: string
  rating: number
  title: string
  comment?: string
  created_at: string
  helpful_count: number
}

export const createReview = async (review: Omit<DbReview, 'id' | 'created_at' | 'helpful_count'>) => {
  const { data, error } = await supabase
    .from('app_reviews')
    .insert({
      app_id: review.app_id,
      user_name: review.user_name,
      user_email: review.user_email,
      rating: review.rating,
      title: review.title,
      comment: review.comment || null
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Update app rating
  await updateAppRating(review.app_id)
  
  return data.id
}

export const getReviewsByApp = async (appId: string): Promise<DbReview[]> => {
  const { data, error } = await supabase
    .from('app_reviews')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data || []
}

export const updateAppRating = async (appId: string) => {
  const reviews = await getReviewsByApp(appId)
  if (reviews.length === 0) return
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const roundedRating = Math.round(avgRating * 10) / 10
  
  const { error } = await supabase
    .from('apps')
    .update({ rating: roundedRating })
    .eq('id', appId)
  
  if (error) throw error
}

// Versions CRUD
export interface DbVersion {
  id: number
  app_id: string
  version: string
  release_notes?: string
  file_hash?: string
  file_path?: string
  released_at: string
}

export const createVersion = async (version: Omit<DbVersion, 'id' | 'released_at'>) => {
  const { data, error } = await supabase
    .from('app_versions')
    .insert({
      app_id: version.app_id,
      version: version.version,
      release_notes: version.release_notes || null,
      file_hash: version.file_hash || null,
      file_path: version.file_path || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data.id
}

export const getVersionsByApp = async (appId: string): Promise<DbVersion[]> => {
  const { data, error } = await supabase
    .from('app_versions')
    .select('*')
    .eq('app_id', appId)
    .order('released_at', { ascending: false })
  
  if (error) return []
  return data || []
}

// Downloads CRUD
export interface DbDownload {
  id: number
  app_id: string
  user_email?: string
  api_key?: string
  downloaded_at: string
}

export const recordDownload = async (appId: string, userEmail?: string, apiKey?: string) => {
  const { data, error } = await supabase
    .from('app_downloads')
    .insert({
      app_id: appId,
      user_email: userEmail || null,
      api_key: apiKey || null
    })
    .select()
    .single()
  
  if (error) throw error
  
  // Increment download count
  const { error: updateError } = await supabase.rpc('increment_downloads', { app_id: appId })
  
  if (updateError) {
    // Fallback: manual increment
    const { data: app } = await supabase
      .from('apps')
      .select('downloads')
      .eq('id', appId)
      .single()
    
    if (app) {
      await supabase
        .from('apps')
        .update({ downloads: app.downloads + 1 })
        .eq('id', appId)
    }
  }
  
  return data.id
}

export const getDownloadStats = async (appId: string) => {
  const { data: app } = await supabase
    .from('apps')
    .select('downloads')
    .eq('id', appId)
    .single()
  
  const total = app?.downloads || 0
  
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count } = await supabase
    .from('app_downloads')
    .select('*', { count: 'exact', head: true })
    .eq('app_id', appId)
    .gte('downloaded_at', thirtyDaysAgo.toISOString())
  
  return { total, last30Days: count || 0 }
}

// Security Scans CRUD
export interface DbSecurityScan {
  id: number
  app_id: string
  scan_type: string
  passed: boolean
  score: number
  checks: any
  recommendation: string
  scanned_at: string
}

export const createSecurityScan = async (scan: Omit<DbSecurityScan, 'id' | 'scanned_at'>) => {
  const { data, error } = await supabase
    .from('security_scans')
    .insert({
      app_id: scan.app_id,
      scan_type: scan.scan_type,
      passed: scan.passed,
      score: scan.score,
      checks: scan.checks,
      recommendation: scan.recommendation
    })
    .select()
    .single()
  
  if (error) throw error
  return data.id
}

export const getSecurityScansByApp = async (appId: string): Promise<DbSecurityScan[]> => {
  const { data, error } = await supabase
    .from('security_scans')
    .select('*')
    .eq('app_id', appId)
    .order('scanned_at', { ascending: false })
  
  if (error) return []
  return data || []
}

export const getLatestSecurityScan = async (appId: string): Promise<DbSecurityScan | null> => {
  const { data, error } = await supabase
    .from('security_scans')
    .select('*')
    .eq('app_id', appId)
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) return null
  return data
}

// Helper function for increment_downloads (needs to be created in Supabase)
// Run this SQL in Supabase SQL Editor:
/*
CREATE OR REPLACE FUNCTION increment_downloads(app_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE apps SET downloads = downloads + 1 WHERE id = app_id;
END;
$$ LANGUAGE plpgsql;
*/
