import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { developerName, developerEmail } = body

    // 필수 필드 검증
    if (!developerName || !developerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: developerName, developerEmail' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(developerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // API 키 생성
    const apiKey = generateApiKey(developerName, developerEmail)

    return NextResponse.json({
      success: true,
      apiKey,
      developerName,
      message: 'API key generated successfully. Keep it secure!',
      warning: 'This key will only be shown once. Store it safely.',
    })
  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate API key', details: String(error) },
      { status: 500 }
    )
  }
}
