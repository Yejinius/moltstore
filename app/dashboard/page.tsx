'use client'

import { useState, useEffect } from 'react'
import type { AppStatus } from '@/data/sample-apps'

interface DashboardApp {
  id: string
  name: string
  version: string
  status: AppStatus
  uploadedAt: string
  reviewNotes?: string
  fileHash: string
}

const sampleDashboardApps: DashboardApp[] = [
  {
    id: '1',
    name: 'My Awesome App',
    version: '1.0.0',
    status: 'published',
    uploadedAt: '2026-01-28T10:00:00Z',
    fileHash: 'abc123def456...',
  },
  {
    id: '2',
    name: 'Test API Tool',
    version: '0.5.0',
    status: 'in_review',
    uploadedAt: '2026-02-01T14:30:00Z',
    fileHash: 'xyz789uvw012...',
  },
  {
    id: '3',
    name: 'Old Plugin',
    version: '2.1.0',
    status: 'rejected',
    uploadedAt: '2026-01-20T08:15:00Z',
    reviewNotes: '보안 취약점 발견: SQL Injection 가능성. 수정 후 재업로드 바랍니다.',
    fileHash: 'old456hash789...',
  },
]

const statusConfig = {
  pending: { label: '대기 중', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  in_review: { label: '심사 중', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  approved: { label: '승인됨', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  published: { label: '판매 중', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: '거부됨', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
}

export default function DashboardPage() {
  const [apps, setApps] = useState<DashboardApp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/developer/apps')
      const data = await response.json()
      setApps(data.apps || [])
    } catch (error) {
      console.error('Failed to fetch apps:', error)
      setApps(sampleDashboardApps) // fallback
    } finally {
      setLoading(false)
    }
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
                MoltStore
              </h1>
            </a>
          </div>
          <nav className="flex gap-6">
            <a href="/apps" className="text-gray-600 hover:text-gray-900">Apps</a>
            <a href="/upload" className="text-gray-600 hover:text-gray-900">Upload App</a>
            <a href="/dashboard" className="text-blue-600 font-semibold">Dashboard</a>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">개발자 대시보드</h1>
            <p className="text-gray-600">업로드한 앱의 심사 상태를 확인하세요</p>
          </div>
          <a
            href="/upload"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + 새 앱 업로드
          </a>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">전체 앱</div>
            <div className="text-3xl font-bold text-gray-900">{apps.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">판매 중</div>
            <div className="text-3xl font-bold text-green-600">
              {apps.filter(a => a.status === 'published').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">심사 중</div>
            <div className="text-3xl font-bold text-blue-600">
              {apps.filter(a => a.status === 'in_review' || a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">거부됨</div>
            <div className="text-3xl font-bold text-red-600">
              {apps.filter(a => a.status === 'rejected').length}
            </div>
          </div>
        </div>

        {/* Apps List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">내 앱 목록</h2>
          </div>
          
          <div className="divide-y">
            {apps.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[app.status].bgColor} ${statusConfig[app.status].textColor}`}>
                        {statusConfig[app.status].label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div>버전: {app.version}</div>
                      <div>•</div>
                      <div>업로드: {new Date(app.uploadedAt).toLocaleDateString('ko-KR')}</div>
                      <div>•</div>
                      <div className="font-mono text-xs">Hash: {app.fileHash.substring(0, 16)}...</div>
                    </div>

                    {app.reviewNotes && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-red-900 mb-1">심사 거부 사유:</div>
                            <div className="text-sm text-red-800">{app.reviewNotes}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {app.status === 'published' && (
                      <a
                        href={`/apps/${app.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        상세 보기
                      </a>
                    )}
                    {app.status === 'rejected' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                        재업로드
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      편집
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {apps.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">아직 업로드한 앱이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 앱을 업로드하고 심사를 받아보세요!</p>
            <a
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              앱 업로드하기
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
