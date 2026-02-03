'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface SecurityCheck {
  name: string
  passed: boolean
  message: string
}

interface SecurityScan {
  id: number
  app_id: string
  scan_type: string
  passed: boolean
  score: number
  checks: SecurityCheck[]
  recommendation: string
  scanned_at: string
}

export default function SecurityReportPage() {
  const params = useParams()
  const [scan, setScan] = useState<SecurityScan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScan()
  }, [])

  const fetchScan = async () => {
    try {
      const response = await fetch(`/api/security/${params.id}?latest=true`)
      const data = await response.json()
      
      if (data.success) {
        setScan(data.scan)
      }
    } catch (error) {
      console.error('Failed to fetch security scan:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">보안 검증 기록이 없습니다</h1>
          <a href="/admin" className="text-blue-600 hover:underline">관리자 페이지로 돌아가기</a>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getRecommendationBadge = (recommendation: string) => {
    const config = {
      approve: { bg: 'bg-green-100', text: 'text-green-700', label: '승인 권장' },
      manual_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '수동 심사 필요' },
      reject: { bg: 'bg-red-100', text: 'text-red-700', label: '거부 권장' },
    }
    
    const style = config[recommendation as keyof typeof config] || config.manual_review
    
    return (
      <span className={`px-4 py-2 ${style.bg} ${style.text} rounded-lg font-medium`}>
        {style.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoltStore Security
              </h1>
            </a>
          </div>
          <nav className="flex gap-6">
            <a href="/admin" className="text-blue-600 font-semibold">Admin</a>
            <a href="/apps" className="text-gray-600 hover:text-gray-900">Apps</a>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">보안 검증 리포트</h1>
          <p className="text-gray-600">
            자동 보안 검증 결과 - {new Date(scan.scanned_at).toLocaleString('ko-KR')}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">보안 점수</div>
              <div className={`text-6xl font-bold ${getScoreColor(scan.score)}`}>
                {scan.score}<span className="text-3xl">/100</span>
              </div>
            </div>
            <div className="text-right">
              {getRecommendationBadge(scan.recommendation)}
            </div>
          </div>

          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute h-full ${getScoreBgColor(scan.score)} transition-all`}
              style={{ width: `${scan.score}%` }}
            ></div>
          </div>
        </div>

        {/* Checks */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">검증 항목</h2>
          
          <div className="space-y-4">
            {scan.checks.map((check, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                  check.passed
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {check.passed ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-semibold mb-1 ${check.passed ? 'text-green-900' : 'text-red-900'}`}>
                    {check.name}
                  </div>
                  <div className={`text-sm ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {check.message}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    check.passed
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {check.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">자동 보안 검증 시스템</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 파일 형식 및 크기 검증</li>
                <li>• SHA-256 해시 무결성 확인</li>
                <li>• 악성 패턴 탐지</li>
                <li>• 메타데이터 유효성 검사</li>
                <li>• ClamAV 바이러스 스캔 (선택적)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            관리자 페이지로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
