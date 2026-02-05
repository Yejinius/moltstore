import { NextRequest, NextResponse } from 'next/server'
import { getAllApps, updateAppStatus, getAppById } from '@/lib/db-adapter'
import { requireRole } from '@/lib/auth-supabase'

// GET - 모든 앱 조회 (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const user = await requireRole('admin')

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const apps = status ? getAllApps(status) : getAllApps()
    
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

// PATCH - 앱 상태 변경 (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Admin authentication check
    const user = await requireRole('admin')

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { appId, status, reviewNotes } = body
    
    if (!appId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 상태 유효성 검증
    const validStatuses = ['pending', 'in_review', 'approved', 'published', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // 거부 시 사유 필수
    if (status === 'rejected' && !reviewNotes) {
      return NextResponse.json(
        { error: 'Review notes required for rejection' },
        { status: 400 }
      )
    }

    updateAppStatus(appId, status, reviewNotes)
    
    const updatedApp = getAppById(appId)
    
    return NextResponse.json({
      success: true,
      app: updatedApp,
      message: 'App status updated successfully',
    })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { error: 'Failed to update status', details: String(error) },
      { status: 500 }
    )
  }
}
