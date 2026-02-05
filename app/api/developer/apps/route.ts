import { NextRequest, NextResponse } from 'next/server'
import { getAllApps, getAppsByUserId } from '@/lib/db-adapter'
import { requireRole } from '@/lib/auth-supabase'

export async function GET(request: NextRequest) {
  try {
    // Require developer or admin role
    const user = await requireRole(['developer', 'admin'])

    if (!user) {
      return NextResponse.json(
        { error: 'Developer access required' },
        { status: 403 }
      )
    }

    // Admins can see all apps, developers only see their own
    const apps = user.role === 'admin'
      ? getAllApps()
      : await getAppsByUserId(user.id)

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
