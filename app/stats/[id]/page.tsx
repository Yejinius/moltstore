'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Stats {
  downloads: {
    total: number
    last30Days: number
  }
  reviews: {
    total: number
    average: number
    distribution: {
      [key: number]: number
    }
  }
  versions: {
    total: number
    current: string
    history: any[]
  }
}

export default function StatsPage() {
  const params = useParams()
  const [stats, setStats] = useState<Stats | null>(null)
  const [appName, setAppName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setAppName(data.appName)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">통계를 불러올 수 없습니다</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">대시보드로 돌아가기</a>
        </div>
      </div>
    )
  }

  const maxReviews = Math.max(...Object.values(stats.reviews.distribution))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoltStore
              </h1>
            </a>
          </div>
          <nav className="flex gap-6">
            <a href="/dashboard" className="text-blue-600 font-semibold">Dashboard</a>
            <a href="/apps" className="text-gray-600 hover:text-gray-900">Apps</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{appName} - 통계</h1>
          <p className="text-gray-600">앱의 다운로드, 리뷰, 버전 통계를 확인하세요</p>
        </div>

        {/* Download Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">다운로드 통계</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">전체 다운로드</div>
                <div className="text-4xl font-bold text-blue-600">{stats.downloads.total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">최근 30일</div>
                <div className="text-2xl font-bold text-gray-900">{stats.downloads.last30Days.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">리뷰 통계</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">평균 평점</div>
                <div className="flex items-center gap-2">
                  <div className="text-4xl font-bold text-yellow-500">{stats.reviews.average.toFixed(1)}</div>
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">총 리뷰 수</div>
                <div className="text-2xl font-bold text-gray-900">{stats.reviews.total.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">평점 분포</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.reviews.distribution[rating] || 0
              const percentage = stats.reviews.total > 0 ? (count / stats.reviews.total) * 100 : 0
              const barWidth = maxReviews > 0 ? (count / maxReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-gray-100 rounded">
                      <div
                        className="absolute h-full bg-yellow-400 rounded transition-all"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-20 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Version History */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">버전 이력</h2>
            <div className="text-sm text-gray-600">
              현재 버전: <span className="font-semibold text-gray-900">v{stats.versions.current}</span>
            </div>
          </div>

          {stats.versions.history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              버전 이력이 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {stats.versions.history.map((version: any, index: number) => (
                <div key={version.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-900">
                      v{version.version}
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Latest</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(version.released_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  {version.release_notes && (
                    <p className="text-sm text-gray-600">{version.release_notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
