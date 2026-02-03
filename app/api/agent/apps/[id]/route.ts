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
    if (!checkRateLimit(apiKey, 'app_details', 60, 60)) {
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

    // 공개된 앱만 반환
    if (app.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'App not available', code: 'APP_NOT_FOUND' },
        { status: 404 }
      )
    }

    // API 응답 형식으로 변환
    const response = {
      success: true,
      app: {
        id: app.id,
        name: app.name,
        description: app.description,
        longDescription: app.long_description,
        category: app.category,
        price: app.price,
        currency: app.currency,
        verified: app.verified === 1,
        rating: app.rating,
        downloads: app.downloads,
        features: app.features,
        tags: app.tags,
        developer: {
          name: app.developer_name,
          verified: app.developer_verified === 1,
        },
        apiDocs: `/docs/${app.id}`,
        version: app.version,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get app error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
