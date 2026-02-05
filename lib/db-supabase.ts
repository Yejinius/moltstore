// Supabase implementation of database functions
import supabase from './supabase'
import type { DbApp, DbAppWithDetails, DbReview, DbVersion, DbDownload, DbSecurityScan } from './db-types'

// Apps CRUD
export const createApp = async (app: Omit<DbApp, 'id' | 'uploaded_at' | 'last_updated' | 'downloads' | 'rating' | 'verified'>) => {
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  const { error } = await supabase.from('apps').insert({
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
    user_id: app.user_id,
    developer_name: app.developer_name,
    developer_verified: app.developer_verified,
  })
  
  if (error) throw error
  return id
}

export const addAppFeatures = async (appId: string, features: string[]) => {
  const rows = features.filter(f => f.trim()).map(feature => ({
    app_id: appId,
    feature,
  }))
  
  if (rows.length > 0) {
    const { error } = await supabase.from('app_features').insert(rows)
    if (error) throw error
  }
}

export const addAppTags = async (appId: string, tags: string[]) => {
  const rows = tags.filter(t => t.trim()).map(tag => ({
    app_id: appId,
    tag,
  }))
  
  if (rows.length > 0) {
    const { error } = await supabase.from('app_tags').insert(rows)
    if (error) throw error
  }
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
    tags: tags?.map(t => t.tag) || [],
  }
}

export const getAllApps = async (status?: string): Promise<DbAppWithDetails[]> => {
  let query = supabase.from('apps').select('*').order('uploaded_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data: apps, error } = await query
  
  if (error || !apps) return []
  
  // Fetch features and tags for each app
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
        tags: tags?.map(t => t.tag) || [],
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
      last_updated: new Date().toISOString(),
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
  let supaQuery = supabase
    .from('apps')
    .select('*')
    .eq('status', 'published')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  
  if (category && category !== 'All') {
    supaQuery = supaQuery.eq('category', category)
  }
  
  supaQuery = supaQuery.order('downloads', { ascending: false })
  
  const { data: apps, error } = await supaQuery
  
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
        tags: tags?.map(t => t.tag) || [],
      }
    })
  )
  
  return appsWithDetails
}

// Reviews
export const createReview = async (review: Omit<DbReview, 'id' | 'created_at' | 'helpful_count'>) => {
  const { data, error } = await supabase
    .from('app_reviews')
    .insert(review)
    .select('id')
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
  
  await supabase
    .from('apps')
    .update({ rating: roundedRating })
    .eq('id', appId)
}

// Versions
export const createVersion = async (version: Omit<DbVersion, 'id' | 'released_at'>) => {
  const { data, error } = await supabase
    .from('app_versions')
    .insert(version)
    .select('id')
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

// Downloads
export const recordDownload = async (appId: string, userEmail?: string, apiKey?: string) => {
  const { data, error } = await supabase
    .from('app_downloads')
    .insert({ app_id: appId, user_email: userEmail, api_key: apiKey })
    .select('id')
    .single()
  
  if (error) throw error
  
  // Increment downloads count
  await supabase.rpc('increment_downloads', { app_id: appId })
  
  return data.id
}

export const getDownloadStats = async (appId: string) => {
  const { data: app } = await supabase
    .from('apps')
    .select('downloads')
    .eq('id', appId)
    .single()
  
  const total = app?.downloads || 0
  
  const { count } = await supabase
    .from('app_downloads')
    .select('*', { count: 'exact', head: true })
    .eq('app_id', appId)
    .gte('downloaded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  
  return { total, last30Days: count || 0 }
}

// Security Scans
export const createSecurityScan = async (scan: Omit<DbSecurityScan, 'id' | 'scanned_at'>) => {
  const { data, error } = await supabase
    .from('security_scans')
    .insert({
      ...scan,
      checks: typeof scan.checks === 'string' ? scan.checks : JSON.stringify(scan.checks),
    })
    .select('id')
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

// User & Auth functions

/**
 * Get apps by user ID (for developers)
 */
export const getAppsByUserId = async (userId: string): Promise<DbAppWithDetails[]> => {
  const { data: apps, error } = await supabase
    .from('apps')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error || !apps) return []

  // Fetch features and tags for each app
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
        tags: tags?.map(t => t.tag) || [],
      } as DbAppWithDetails
    })
  )

  return appsWithDetails
}

/**
 * Get API key record by key string
 */
export const getApiKeyByKey = async (key: string) => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .single()

  if (error) return null
  return data
}

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, role: 'admin' | 'developer' | 'user') => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Verify or unverify developer
 */
export const verifyDeveloper = async (userId: string, verified: boolean) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ developer_verified: verified })
    .eq('id', userId)

  if (error) throw error
}

export default {
  createApp,
  addAppFeatures,
  addAppTags,
  getAppById,
  getAllApps,
  updateAppStatus,
  updateAppVerified,
  searchApps,
  createReview,
  getReviewsByApp,
  updateAppRating,
  createVersion,
  getVersionsByApp,
  recordDownload,
  getDownloadStats,
  createSecurityScan,
  getSecurityScansByApp,
  getLatestSecurityScan,
  getAppsByUserId,
  getApiKeyByKey,
  getUserProfile,
  updateUserRole,
  verifyDeveloper,
}
