import { NextRequest, NextResponse } from 'next/server'
import { getAllApps } from '@/lib/db-adapter'

export async function GET(request: NextRequest) {
  try {
    // TODO: 실제로는 사용자 인증 후 해당 개발자의 앱만 반환
    // 지금은 모든 앱 반환
    const apps = getAllApps()
    
    return NextResponse.json({
      success: true,
      apps,
    })
  } catch (error) {
    console.error('Get developer apps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps', details: String(error) },
      { status: 500 }
    )
  }
}
