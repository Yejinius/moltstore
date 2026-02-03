import { NextRequest, NextResponse } from 'next/server'
import { createReview, getReviewsByApp } from '@/lib/db-adapter'

// GET - 앱의 리뷰 목록
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appId = searchParams.get('appId')
    
    if (!appId) {
      return NextResponse.json(
        { success: false, error: 'Missing appId parameter' },
        { status: 400 }
      )
    }

    const reviews = getReviewsByApp(appId)
    
    return NextResponse.json({
      success: true,
      reviews,
      total: reviews.length,
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - 리뷰 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appId, userName, userEmail, rating, title, comment } = body

    // 필수 필드 검증
    if (!appId || !userName || !userEmail || !rating || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 평점 검증 (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // 리뷰 생성
    const reviewId = createReview({
      app_id: appId,
      user_name: userName,
      user_email: userEmail,
      rating: parseInt(rating),
      title,
      comment,
    })

    return NextResponse.json({
      success: true,
      reviewId,
      message: 'Review created successfully',
    })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
