import { NextRequest, NextResponse } from 'next/server'
import { getSecurityScansByApp, getLatestSecurityScan } from '@/lib/db-adapter'
import type { DbSecurityScan } from '@/lib/db-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const latest = searchParams.get('latest') === 'true'

    if (latest) {
      const scan = getLatestSecurityScan(id)
      
      if (!scan) {
        return NextResponse.json(
          { success: false, error: 'No security scans found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        scan: {
          ...scan,
          checks: JSON.parse(scan.checks),
        },
      })
    } else {
      const scans = getSecurityScansByApp(id)
      
      return NextResponse.json({
        success: true,
        scans: scans.map((s: DbSecurityScan) => ({
          ...s,
          checks: JSON.parse(s.checks),
        })),
        total: scans.length,
      })
    }
  } catch (error) {
    console.error('Get security scans error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch security scans' },
      { status: 500 }
    )
  }
}
