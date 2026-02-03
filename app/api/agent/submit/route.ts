import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'
import { createApp, addAppFeatures, addAppTags, updateAppStatus, createSecurityScan } from '@/lib/db-adapter'
import { runSecurityChecks } from '@/lib/security'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // API 키 검증
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)
    const keyData = validateApiKey(apiKey)
    
    if (!keyData) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Rate limiting 체크 (10 requests/hour)
    if (!checkRateLimit(apiKey, 'submit', 10, 3600)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Maximum 10 submissions per hour.', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    const {
      name,
      description,
      longDescription,
      category,
      price,
      version,
      features,
      tags,
      fileUrl,
      developerName,
      contactEmail,
    } = body

    // 필수 필드 검증
    if (!name || !description || !longDescription || !category || price === undefined || !version || !fileUrl || !developerName || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // 카테고리 검증
    const validCategories = ['Productivity', 'Automation', 'Data', 'Integration', 'AI', 'Security']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // 메타데이터 검증
    const { validateMetadata } = await import('@/lib/security')
    const metadataValid = validateMetadata({
      name,
      description,
      category,
      price: parseFloat(price),
    })

    if (!metadataValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid metadata. Please check name length (3-50), description (10-500), price (0-1000), and category.', 
          code: 'INVALID_REQUEST' 
        },
        { status: 400 }
      )
    }

    // 파일 다운로드 (보안상 직접 다운로드하지 않고 URL만 저장)
    // TODO: 실제로는 파일을 다운로드하고 검증해야 함
    // 지금은 URL만 저장하고 해시는 나중에 생성
    const fileHash = crypto.createHash('sha256').update(fileUrl).digest('hex')

    // 데이터베이스에 앱 정보 저장
    const appId = createApp({
      name,
      description,
      long_description: longDescription,
      category,
      price: parseFloat(price),
      currency: 'USD',
      version,
      status: 'pending',
      file_hash: fileHash,
      file_path: fileUrl, // URL을 파일 경로로 저장
      api_access: 1,
      developer_name: developerName || keyData.developer_name,
      developer_verified: 0,
    })

    // 기능 및 태그 저장
    if (features && Array.isArray(features)) {
      addAppFeatures(appId, features.filter((f: string) => f.trim()))
    }
    
    if (tags && Array.isArray(tags)) {
      addAppTags(appId, tags.filter((t: string) => t.trim()))
    }

    // 메타데이터 기반 보안 스캔 (파일 없이)
    const securityChecks = [
      { name: 'Metadata Validation', passed: true, message: 'All metadata fields are valid' },
      { name: 'URL Format', passed: fileUrl.startsWith('https://'), message: fileUrl.startsWith('https://') ? 'Secure URL provided' : 'URL should use HTTPS' },
    ]
    
    const score = securityChecks.every(c => c.passed) ? 70 : 40
    const recommendation = score >= 70 ? 'manual_review' : 'reject'

    createSecurityScan({
      app_id: appId,
      scan_type: 'agent_api',
      passed: 0,
      score,
      checks: JSON.stringify(securityChecks),
      recommendation,
    })

    // 수동 심사 필요 상태로 설정
    updateAppStatus(appId, 'in_review', 'Agent API 제출 - 수동 심사 필요')

    return NextResponse.json({
      success: true,
      appId,
      status: 'in_review',
      fileHash,
      securityScore: score,
      message: '앱이 성공적으로 제출되었습니다. 심사는 1-3일 소요됩니다.',
      estimatedReviewTime: '1-3 days',
      trackingUrl: `/api/agent/status/${appId}`,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR', details: String(error) },
      { status: 500 }
    )
  }
}
