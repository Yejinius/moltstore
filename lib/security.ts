import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export interface SecurityCheckResult {
  passed: boolean
  score: number
  checks: {
    name: string
    passed: boolean
    message: string
  }[]
  recommendation: 'approve' | 'reject' | 'manual_review'
}

// 파일 형식 검증
export const validateFileType = async (filePath: string): Promise<boolean> => {
  try {
    const allowedExtensions = ['.zip', '.tar.gz', '.tgz', '.tar']
    const ext = path.extname(filePath).toLowerCase()
    
    return allowedExtensions.includes(ext)
  } catch {
    return false
  }
}

// 파일 크기 검증 (100MB 제한)
export const validateFileSize = async (filePath: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(filePath)
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    return stats.size <= maxSize
  } catch {
    return false
  }
}

// SHA-256 해시 검증
export const verifyFileHash = async (filePath: string, expectedHash: string): Promise<boolean> => {
  try {
    const buffer = await fs.readFile(filePath)
    const hash = crypto.createHash('sha256')
    hash.update(buffer)
    const actualHash = hash.digest('hex')
    
    return actualHash === expectedHash
  } catch {
    return false
  }
}

// 악성 파일명 패턴 검사
export const checkMaliciousPatterns = async (filePath: string): Promise<boolean> => {
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.dll$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.vbs$/i,
    /\.ps1$/i,
    /\.sh$/i,
    /malware/i,
    /virus/i,
    /trojan/i,
    /ransomware/i,
  ]
  
  const fileName = path.basename(filePath)
  return !suspiciousPatterns.some(pattern => pattern.test(fileName))
}

// 메타데이터 검증
export const validateMetadata = (metadata: {
  name: string
  description: string
  category: string
  price: number
}): boolean => {
  // 이름 길이 (3-50자)
  if (metadata.name.length < 3 || metadata.name.length > 50) return false
  
  // 설명 길이 (10-500자)
  if (metadata.description.length < 10 || metadata.description.length > 500) return false
  
  // 가격 범위 (0-1000)
  if (metadata.price < 0 || metadata.price > 1000) return false
  
  // 카테고리 검증
  const validCategories = ['Productivity', 'Automation', 'Data', 'Integration', 'AI', 'Security']
  if (!validCategories.includes(metadata.category)) return false
  
  return true
}

// 종합 보안 검사
export const runSecurityChecks = async (
  filePath: string,
  fileHash: string,
  metadata: any
): Promise<SecurityCheckResult> => {
  const checks = []
  let score = 0
  
  // 1. 파일 형식 검증
  const fileTypeValid = await validateFileType(filePath)
  checks.push({
    name: 'File Type',
    passed: fileTypeValid,
    message: fileTypeValid ? 'Valid archive format' : 'Invalid file format. Only ZIP, TAR.GZ allowed.',
  })
  if (fileTypeValid) score += 20
  
  // 2. 파일 크기 검증
  const fileSizeValid = await validateFileSize(filePath)
  checks.push({
    name: 'File Size',
    passed: fileSizeValid,
    message: fileSizeValid ? 'File size within limit' : 'File too large (max 100MB)',
  })
  if (fileSizeValid) score += 15
  
  // 3. 해시 검증
  const hashValid = await verifyFileHash(filePath, fileHash)
  checks.push({
    name: 'Hash Verification',
    passed: hashValid,
    message: hashValid ? 'File integrity verified' : 'File hash mismatch',
  })
  if (hashValid) score += 20
  
  // 4. 악성 패턴 검사
  const noMaliciousPatterns = await checkMaliciousPatterns(filePath)
  checks.push({
    name: 'Malicious Patterns',
    passed: noMaliciousPatterns,
    message: noMaliciousPatterns ? 'No suspicious patterns detected' : 'Suspicious file patterns found',
  })
  if (noMaliciousPatterns) score += 25
  
  // 5. 메타데이터 검증
  const metadataValid = validateMetadata(metadata)
  checks.push({
    name: 'Metadata Validation',
    passed: metadataValid,
    message: metadataValid ? 'Valid metadata' : 'Invalid metadata (name, description, price, or category)',
  })
  if (metadataValid) score += 20
  
  // 점수 기반 추천
  let recommendation: 'approve' | 'reject' | 'manual_review'
  const allPassed = checks.every(c => c.passed)
  
  if (allPassed) {
    recommendation = 'approve'
  } else if (score >= 70) {
    recommendation = 'manual_review'
  } else {
    recommendation = 'reject'
  }
  
  return {
    passed: allPassed,
    score,
    checks,
    recommendation,
  }
}

// ClamAV 스캔 (선택적 - ClamAV 설치 필요)
export const scanWithClamAV = async (filePath: string): Promise<boolean> => {
  try {
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    // ClamAV가 설치되어 있는지 확인
    try {
      await execAsync('which clamscan')
    } catch {
      console.log('ClamAV not installed. Skipping virus scan.')
      return true // ClamAV 없으면 통과 (선택적)
    }
    
    // 바이러스 스캔
    const { stdout } = await execAsync(`clamscan --no-summary "${filePath}"`)
    return !stdout.includes('FOUND')
  } catch (error) {
    console.error('ClamAV scan error:', error)
    return true // 에러 시 통과 (선택적 기능)
  }
}

// 자동 심사 워크플로우
export const autoReviewApp = async (
  appId: string,
  filePath: string,
  fileHash: string,
  metadata: any
): Promise<{
  approved: boolean
  status: 'approved' | 'rejected' | 'manual_review'
  reason?: string
  securityReport: SecurityCheckResult
}> => {
  // 보안 검사 실행
  const securityReport = await runSecurityChecks(filePath, fileHash, metadata)
  
  // ClamAV 스캔 (선택적)
  const virusScanPassed = await scanWithClamAV(filePath)
  if (!virusScanPassed) {
    return {
      approved: false,
      status: 'rejected',
      reason: 'Malware detected by antivirus scan',
      securityReport,
    }
  }
  
  // 결과 반환
  if (securityReport.recommendation === 'approve') {
    return {
      approved: true,
      status: 'approved',
      securityReport,
    }
  } else if (securityReport.recommendation === 'manual_review') {
    return {
      approved: false,
      status: 'manual_review',
      reason: `Manual review required. Security score: ${securityReport.score}/100`,
      securityReport,
    }
  } else {
    const failedChecks = securityReport.checks.filter(c => !c.passed)
    const reason = failedChecks.map(c => c.message).join('; ')
    
    return {
      approved: false,
      status: 'rejected',
      reason,
      securityReport,
    }
  }
}
