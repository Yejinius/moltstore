import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'
import { getAppById, getApiKeyByKey } from '@/lib/db-adapter'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Rate limiting 체크 (60 requests/min)
    if (!checkRateLimit(apiKey, 'status', 60, 60)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // 앱 조회
    const app = getAppById(params.id)

    if (!app) {
      return NextResponse.json(
        { success: false, error: 'App not found', code: 'APP_NOT_FOUND' },
        { status: 404 }
      )
    }

    // 개발자 권한 확인: API 키의 user_id와 앱의 user_id 비교
    const apiKeyRecord = await getApiKeyByKey(apiKey)

    if (apiKeyRecord && apiKeyRecord.user_id && app.user_id) {
      // user_id가 있는 경우, 소유자만 상태 확인 가능
      if (apiKeyRecord.user_id !== app.user_id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized access to this app', code: 'UNAUTHORIZED' },
          { status: 403 }
        )
      }
    }
    // user_id가 없는 경우 (레거시 데이터), 권한 체크 스킵

    // 심사 상태 응답
    const response = {
      success: true,
      appId: app.id,
      name: app.name,
      status: app.status,
      uploadedAt: app.uploaded_at,
      lastUpdated: app.last_updated,
      reviewNotes: app.review_notes || null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
