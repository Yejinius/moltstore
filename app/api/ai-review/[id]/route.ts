/**
 * AI Code Review API
 * GET - Get AI review results for an app
 * POST - Trigger AI review for an app
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-supabase'
import { getAppById, getAIReviewByApp, createAIReview, updateAIReview, saveAIFindings } from '@/lib/db-adapter'
import { runAIReview, runQuickReview, isEnabled, getConfig } from '@/lib/ai-review'
import path from 'path'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/ai-review/[id]
 * Get AI review results for an app
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: appId } = await params

    // Check authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get app to verify ownership/admin access
    const app = await getAppById(appId)
    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwner = app.user_id === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Fetch AI review from database
    const aiReview = await getAIReviewByApp(appId)

    if (!aiReview) {
      return NextResponse.json({
        success: true,
        appId,
        aiReviewEnabled: isEnabled(),
        hasReview: false,
        message: 'No AI review has been performed for this app yet'
      })
    }

    return NextResponse.json({
      success: true,
      appId,
      aiReviewEnabled: isEnabled(),
      hasReview: true,
      review: {
        id: aiReview.id,
        status: aiReview.status,
        overallScore: aiReview.overall_score,
        securityScore: aiReview.security_score,
        agentSafetyScore: aiReview.agent_safety_score,
        sandboxScore: aiReview.sandbox_score,
        recommendation: aiReview.recommendation,
        summary: aiReview.summary,
        findings: aiReview.findings,
        tokensUsed: aiReview.tokens_used,
        costEstimate: aiReview.cost_estimate,
        createdAt: aiReview.created_at,
        completedAt: aiReview.completed_at
      }
    })

  } catch (error: any) {
    console.error('Error fetching AI review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI review' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai-review/[id]
 * Trigger AI review for an app
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: appId } = await params

    // Check if AI review is enabled
    if (!isEnabled()) {
      return NextResponse.json(
        { error: 'AI review is not enabled' },
        { status: 503 }
      )
    }

    // Check authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins can trigger AI review
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get app
    const app = await getAppById(appId)
    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    // Check if file exists
    if (!app.file_path) {
      return NextResponse.json(
        { error: 'App has no uploaded file' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { quick = false, force = false } = body

    // Run AI review
    console.log(`Triggering AI review for app ${appId}`)

    const archivePath = path.resolve(app.file_path)
    const fileHash = app.file_hash || 'unknown'

    // Create pending AI review record
    const reviewId = await createAIReview({
      app_id: appId,
      file_hash: fileHash,
      status: 'processing'
    })

    let result
    try {
      if (quick) {
        result = await runQuickReview(appId, archivePath, fileHash)
      } else {
        result = await runAIReview(appId, archivePath, fileHash)
      }

      // Update AI review with results
      await updateAIReview(reviewId, {
        status: 'completed',
        overall_score: result.overallScore,
        security_score: result.securityScore,
        agent_safety_score: result.agentSafetyScore,
        sandbox_score: result.sandboxScore,
        findings: result.findings,
        recommendation: result.recommendation,
        summary: result.summary,
        tokens_used: result.tokensUsed,
        cost_estimate: result.costEstimate
      })

      // Save individual findings
      if (result.findings && result.findings.length > 0) {
        await saveAIFindings(reviewId, result.findings)
      }

    } catch (reviewError: any) {
      // Update AI review with failure
      await updateAIReview(reviewId, {
        status: 'failed',
        summary: reviewError.message || 'AI review failed'
      })
      throw reviewError
    }

    return NextResponse.json({
      success: true,
      review: {
        id: reviewId,
        appId: result.appId,
        fileHash: result.fileHash,
        status: result.status,
        overallScore: result.overallScore,
        securityScore: result.securityScore,
        recommendation: result.recommendation,
        summary: result.summary,
        findingsCount: {
          critical: result.criticalCount,
          high: result.highCount,
          medium: result.mediumCount,
          low: result.lowCount
        },
        tokensUsed: result.tokensUsed,
        costEstimate: result.costEstimate,
        processingTimeMs: result.processingTimeMs
      }
    })

  } catch (error: any) {
    console.error('Error running AI review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run AI review' },
      { status: 500 }
    )
  }
}
