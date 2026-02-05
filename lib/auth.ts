import crypto from 'crypto'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'moltstore.db')
const db = new Database(dbPath)

// API Keys 테이블 초기화
db.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    developer_id TEXT NOT NULL,
    developer_name TEXT NOT NULL,
    developer_email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_used_at TEXT,
    rate_limit_remaining INTEGER DEFAULT 100,
    rate_limit_reset_at TEXT
  )
`)

// Rate limit 테이블
db.exec(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    reset_at TEXT NOT NULL,
    UNIQUE(api_key, endpoint)
  )
`)

export interface ApiKey {
  id: number
  key: string
  developer_id: string
  developer_name: string
  developer_email: string
  created_at: string
  last_used_at?: string
}

// API 키 생성
export const generateApiKey = (developerName: string, developerEmail: string): string => {
  const developerId = `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const key = `molt_${crypto.randomBytes(32).toString('hex')}`
  
  const stmt = db.prepare(`
    INSERT INTO api_keys (key, developer_id, developer_name, developer_email)
    VALUES (?, ?, ?, ?)
  `)
  
  stmt.run(key, developerId, developerName, developerEmail)
  
  return key
}

// API 키 검증
export const validateApiKey = (key: string): ApiKey | null => {
  const stmt = db.prepare('SELECT * FROM api_keys WHERE key = ?')
  const result = stmt.get(key) as ApiKey | undefined
  
  if (result) {
    // 마지막 사용 시간 업데이트
    const updateStmt = db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key = ?')
    updateStmt.run(key)
  }
  
  return result || null
}

// Rate limiting 체크
export const checkRateLimit = (apiKey: string, endpoint: string, limit: number, windowSeconds: number): boolean => {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowSeconds * 1000).toISOString()
  
  // 기존 레코드 조회
  const stmt = db.prepare('SELECT * FROM rate_limits WHERE api_key = ? AND endpoint = ?')
  const record = stmt.get(apiKey, endpoint) as any
  
  if (!record) {
    // 첫 요청 - 새 레코드 생성
    const insertStmt = db.prepare(`
      INSERT INTO rate_limits (api_key, endpoint, count, reset_at)
      VALUES (?, ?, 1, ?)
    `)
    insertStmt.run(apiKey, endpoint, resetAt)
    return true
  }
  
  // 리셋 시간이 지났는지 확인
  const recordResetAt = new Date(record.reset_at)
  if (now > recordResetAt) {
    // 리셋 - 카운트 초기화
    const updateStmt = db.prepare(`
      UPDATE rate_limits 
      SET count = 1, reset_at = ?
      WHERE api_key = ? AND endpoint = ?
    `)
    updateStmt.run(resetAt, apiKey, endpoint)
    return true
  }
  
  // 제한 체크
  if (record.count >= limit) {
    return false
  }
  
  // 카운트 증가
  const updateStmt = db.prepare(`
    UPDATE rate_limits 
    SET count = count + 1
    WHERE api_key = ? AND endpoint = ?
  `)
  updateStmt.run(apiKey, endpoint)
  
  return true
}

// API 키 목록 조회 (개발자용)
export const getApiKeysByDeveloper = (developerId: string): ApiKey[] => {
  const stmt = db.prepare('SELECT * FROM api_keys WHERE developer_id = ?')
  return stmt.all(developerId) as ApiKey[]
}

// API 키 삭제
export const deleteApiKey = (key: string): void => {
  const stmt = db.prepare('DELETE FROM api_keys WHERE key = ?')
  stmt.run(key)
}

export default db
