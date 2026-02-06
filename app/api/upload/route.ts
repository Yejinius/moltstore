import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { createApp, addAppFeatures, addAppTags, updateAppStatus, createSecurityScan, createAIReview, updateAIReview, saveAIFindings } from '@/lib/db-adapter'
import { autoReviewApp } from '@/lib/security'
import { getUserFromRequest } from '@/lib/auth-supabase'

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Role check: only developers and admins can upload
    if (user.role !== 'developer' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only developers can upload apps' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const appDataStr = formData.get('appData') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!appDataStr) {
      return NextResponse.json(
        { error: 'No app data provided' },
        { status: 400 }
      )
    }

    const appData = JSON.parse(appDataStr)

    // 파일을 버퍼로 읽기
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // SHA-256 해시 생성
    const hash = crypto.createHash('sha256')
    hash.update(buffer)
    const fileHash = hash.digest('hex')

    // 파일 저장 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    // 파일 저장 (해시를 파일명으로 사용)
    const fileExt = path.extname(file.name)
    const filePath = path.join(uploadDir, `${fileHash}${fileExt}`)
    await fs.writeFile(filePath, buffer)

    // 데이터베이스에 앱 정보 저장
    const appId = createApp({
      name: appData.name,
      description: appData.description,
      long_description: appData.longDescription,
      category: appData.category,
      price: parseFloat(appData.price),
      currency: 'USD',
      version: appData.version,
      status: 'pending',
      file_hash: fileHash,
      file_path: filePath,
      api_access: 1,
      user_id: user.id,
      developer_name: user.full_name || user.email,
      developer_verified: user.developer_verified ? 1 : 0,
    })

    // 기능 및 태그 저장
    addAppFeatures(appId, appData.features.filter((f: string) => f.trim()))
    addAppTags(appId, appData.tags.filter((t: string) => t.trim()))

    // 자동 보안 검증 실행 (AI 리뷰 포함)
    const reviewResult = await autoReviewApp(appId, filePath, fileHash, {
      name: appData.name,
      description: appData.description,
      category: appData.category,
      price: parseFloat(appData.price),
    })

    // 보안 스캔 결과 저장
    await createSecurityScan({
      app_id: appId,
      scan_type: 'automatic',
      passed: reviewResult.securityReport.passed ? 1 : 0,
      score: reviewResult.securityReport.score,
      checks: JSON.stringify(reviewResult.securityReport.checks),
      recommendation: reviewResult.securityReport.recommendation,
    })

    // AI 리뷰 결과가 있으면 저장
    let aiReviewId: number | undefined
    if (reviewResult.aiResult?.completed && reviewResult.aiResult.result) {
      const aiResult = reviewResult.aiResult.result
      try {
        aiReviewId = await createAIReview({
          app_id: appId,
          file_hash: fileHash,
          status: 'completed',
          overall_score: aiResult.overallScore,
          security_score: aiResult.securityScore,
          agent_safety_score: aiResult.agentSafetyScore,
          sandbox_score: aiResult.sandboxScore,
          findings: aiResult.findings,
          recommendation: aiResult.recommendation,
          summary: aiResult.summary,
          tokens_used: aiResult.tokensUsed,
          cost_estimate: aiResult.costEstimate,
        })

        // 개별 findings 저장
        if (aiResult.findings && aiResult.findings.length > 0) {
          await saveAIFindings(aiReviewId, aiResult.findings)
        }
      } catch (err) {
        console.error('Failed to save AI review results:', err)
      }
    } else if (reviewResult.aiResult?.triggered && !reviewResult.aiResult.completed) {
      // AI 리뷰가 트리거되었지만 실패한 경우
      try {
        await createAIReview({
          app_id: appId,
          file_hash: fileHash,
          status: 'failed',
          summary: reviewResult.aiResult.error || 'AI review failed',
        })
      } catch (err) {
        console.error('Failed to save AI review error:', err)
      }
    }

    // 자동 심사 결과 적용
    if (reviewResult.status === 'approved') {
      await updateAppStatus(appId, 'approved', '자동 보안 검증 통과')
    } else if (reviewResult.status === 'rejected') {
      await updateAppStatus(appId, 'rejected', reviewResult.reason)
    } else {
      await updateAppStatus(appId, 'in_review', '수동 심사 필요')
    }

    // 응답 구성
    const response: any = {
      success: true,
      appId,
      fileHash,
      fileName: file.name,
      fileSize: buffer.length,
      status: reviewResult.status,
      securityScore: reviewResult.securityReport.score,
      message: reviewResult.approved
        ? '앱이 자동 승인되었습니다!'
        : reviewResult.status === 'rejected'
        ? `앱이 거부되었습니다: ${reviewResult.reason}`
        : '앱이 업로드되었습니다. 수동 심사 대기 중입니다.',
    }

    // AI 리뷰 정보 추가
    if (reviewResult.aiResult?.completed && reviewResult.aiResult.result) {
      response.aiReview = {
        enabled: true,
        score: reviewResult.aiResult.result.overallScore,
        recommendation: reviewResult.aiResult.result.recommendation,
        findingsCount: {
          critical: reviewResult.aiResult.result.criticalCount,
          high: reviewResult.aiResult.result.highCount,
          medium: reviewResult.aiResult.result.mediumCount,
          low: reviewResult.aiResult.result.lowCount,
        },
        costEstimate: reviewResult.aiResult.result.costEstimate,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}
