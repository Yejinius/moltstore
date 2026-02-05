import { NextRequest, NextResponse } from 'next/server'
import { getAppById, getDownloadStats, getReviewsByApp, getVersionsByApp } from '@/lib/db-adapter'
import type { DbReview } from '@/lib/db-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const app = getAppById(id)
    
    if (!app) {
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      )
    }

    // 다운로드 통계
    const downloadStats = getDownloadStats(id)
    
    // 리뷰 통계
    const reviews = getReviewsByApp(id)
    const reviewStats = {
      total: reviews.length,
      average: app.rating,
      distribution: {
        5: reviews.filter((r: DbReview) => r.rating === 5).length,
        4: reviews.filter((r: DbReview) => r.rating === 4).length,
        3: reviews.filter((r: DbReview) => r.rating === 3).length,
        2: reviews.filter((r: DbReview) => r.rating === 2).length,
        1: reviews.filter((r: DbReview) => r.rating === 1).length,
      }
    }
    
    // 버전 이력
    const versions = getVersionsByApp(id)

    return NextResponse.json({
      success: true,
      appId: id,
      appName: app.name,
      stats: {
        downloads: downloadStats,
        reviews: reviewStats,
        versions: {
          total: versions.length,
          current: app.version,
          history: versions.slice(0, 5), // 최근 5개만
        },
      },
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
