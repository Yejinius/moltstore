// Database adapter - automatically uses Supabase on Vercel, SQLite locally

import { DbApp, DbAppWithDetails, DbReview, DbVersion, DbDownload, DbSecurityScan } from './db-types'

// Check if we're on Vercel with Supabase configured
const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY

// Import the appropriate database module
const db = isSupabase 
  ? require('./db-supabase')
  : require('./db')

// Re-export all functions
export const {
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
} = db

export default db
