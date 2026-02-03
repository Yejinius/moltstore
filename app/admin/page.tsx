'use client'

import { useState, useEffect } from 'react'
import type { AppStatus } from '@/data/sample-apps'

interface AdminApp {
  id: string
  name: string
  description: string
  category: string
  price: number
  version: string
  status: AppStatus
  file_hash?: string
  developer_name: string
  uploaded_at: string
  review_notes?: string
}

export default function AdminPage() {
  const [apps, setApps] = useState<AdminApp[]>([])
  const [filter, setFilter] = useState<'all' | AppStatus>('all')
  const [selectedApp, setSelectedApp] = useState<AdminApp | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/admin/apps')
      const data = await response.json()
      setApps(data.apps || [])
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appId: string, newStatus: AppStatus) => {
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          status: newStatus,
          reviewNotes: newStatus === 'rejected' ? reviewNotes : undefined,
        }),
      })

      if (response.ok) {
        alert('상태가 변경되었습니다!')
        setSelectedApp(null)
        setReviewNotes('')
        fetchApps()
      } else {
        alert('상태 변경 실패')
      }
    } catch (error) {
      console.error('Status change error:', error)
      alert('오류가 발생했습니다')
    }
  }

  const filteredApps = filter === 'all' 
    ? apps 
    : apps.filter(app => app.status === filter)

  const statusConfig = {
    pending: { label: '대기 중', color: 'bg-gray-100 text-gray-700' },
    in_review: { label: '심사 중', color: 'bg-blue-100 text-blue-700' },
    approved: { label: '승인됨', color: 'bg-green-100 text-green-700' },
    published: { label: '판매 중', color: 'bg-green-100 text-green-700' },
    rejected: { label: '거부됨', color: 'bg-red-100 text-red-700' },
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
                MoltStore Admin
              </h1>
            </a>
          </div>
          <nav className="flex gap-6">
            <a href="/apps" className="text-gray-600 hover:text-gray-900">Apps</a>
            <a href="/admin" className="text-blue-600 font-semibold">Admin</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">앱 심사 관리</h1>
          <p className="text-gray-600">업로드된 앱을 검토하고 승인/거부하세요</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">전체</div>
            <div className="text-3xl font-bold text-gray-900">{apps.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">대기 중</div>
            <div className="text-3xl font-bold text-gray-600">
              {apps.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">심사 중</div>
            <div className="text-3xl font-bold text-blue-600">
              {apps.filter(a => a.status === 'in_review').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">판매 중</div>
            <div className="text-3xl font-bold text-green-600">
              {apps.filter(a => a.status === 'published').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">거부됨</div>
            <div className="text-3xl font-bold text-red-600">
              {apps.filter(a => a.status === 'rejected').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            대기 중
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'in_review' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            심사 중
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'published' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            판매 중
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
            }`}
          >
            거부됨
          </button>
        </div>

        {/* Apps List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="p-20 text-center text-gray-500">로딩 중...</div>
          ) : filteredApps.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">앱이 없습니다</h3>
              <p className="text-gray-600">해당 상태의 앱이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredApps.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[app.status].color}`}>
                          {statusConfig[app.status].label}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{app.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div>카테고리: {app.category}</div>
                        <div>•</div>
                        <div>가격: ${app.price}</div>
                        <div>•</div>
                        <div>버전: {app.version}</div>
                        <div>•</div>
                        <div>개발자: {app.developer_name}</div>
                      </div>

                      {app.file_hash && (
                        <div className="mt-2 text-xs text-gray-500 font-mono">
                          Hash: {app.file_hash.substring(0, 32)}...
                        </div>
                      )}

                      {app.review_notes && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                          <strong>거부 사유:</strong> {app.review_notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'in_review')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                          >
                            심사 시작
                          </button>
                        </>
                      )}
                      
                      {app.status === 'in_review' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app)
                              setReviewNotes('')
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            거부
                          </button>
                        </>
                      )}

                      {app.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(app.id, 'published')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          판매 시작
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">앱 거부 사유</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{selectedApp.name}</strong>를 거부하는 이유를 입력하세요.
            </p>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="거부 사유를 상세히 입력해주세요..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!reviewNotes.trim()) {
                    alert('거부 사유를 입력해주세요')
                    return
                  }
                  handleStatusChange(selectedApp.id, 'rejected')
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                거부 확정
              </button>
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setReviewNotes('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
