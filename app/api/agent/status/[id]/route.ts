import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'
import { getAppById } from '@/lib/db-adapter'

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

    // TODO: 실제로는 개발자 권한 확인 필요
    // if (app.developer_name !== keyData.developer_name) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized access', code: 'UNAUTHORIZED' },
    //     { status: 403 }
    //   )
    // }

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
