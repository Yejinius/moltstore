import { NextRequest, NextResponse } from 'next/server'
import { getAllApps, searchApps } from '@/lib/db-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    
    let apps
    
    if (query) {
      // 검색 쿼리가 있으면 검색
      apps = searchApps(query, category || undefined)
    } else if (category && category !== 'All') {
      // 카테고리 필터링
      apps = getAllApps('published').filter(app => app.category === category)
    } else {
      // 전체 공개 앱
      apps = getAllApps('published')
    }
    
    return NextResponse.json({
      success: true,
      apps,
    })
  } catch (error) {
    console.error('Get apps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps', details: String(error) },
      { status: 500 }
    )
  }
}
