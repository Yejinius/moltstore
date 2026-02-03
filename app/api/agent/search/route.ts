import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'
import { searchApps, getAllApps } from '@/lib/db-adapter'

export async function GET(request: NextRequest) {
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

    // Rate limiting 체크 (100 requests/min)
    if (!checkRateLimit(apiKey, 'search', 100, 60)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      )
    }

    // 검색 파라미터
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // 검색 실행
    let apps = searchApps(query, category || undefined)
    
    // 결과 제한
    apps = apps.slice(0, limit)

    // API 응답 형식으로 변환
    const results = apps.map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      category: app.category,
      price: app.price,
      currency: app.currency,
      verified: app.verified === 1,
      rating: app.rating,
      downloads: app.downloads,
      apiAccess: app.api_access === 1,
      tags: app.tags,
    }))

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
      category: category || 'All',
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
