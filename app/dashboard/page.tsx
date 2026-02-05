'use client'

import { useState, useEffect } from 'react'
import type { AppStatus } from '@/data/sample-apps'
import Header from '@/components/Header'

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
    reviewNotes: 'Security vulnerability detected: SQL Injection possible. Please fix and re-upload.',
    fileHash: 'old456hash789...',
  },
]

const statusConfig = {
  pending: { label: 'Pending', bgColor: 'bg-gray-800', textColor: 'text-gray-300' },
  in_review: { label: 'In Review', bgColor: 'bg-blue-900/50', textColor: 'text-blue-400' },
  approved: { label: 'Approved', bgColor: 'bg-green-900/50', textColor: 'text-green-400' },
  published: { label: 'Published', bgColor: 'bg-green-900/50', textColor: 'text-green-400' },
  rejected: { label: 'Rejected', bgColor: 'bg-red-900/50', textColor: 'text-red-400' },
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
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Developer Dashboard</h1>
            <p className="text-gray-400">Track the review status of your uploaded apps</p>
          </div>
          <a
            href="/upload"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold"
          >
            + Upload New App
          </a>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-1">Total Apps</div>
            <div className="text-3xl font-bold text-white">{apps.length}</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-1">Published</div>
            <div className="text-3xl font-bold text-green-500">
              {apps.filter(a => a.status === 'published').length}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-1">In Review</div>
            <div className="text-3xl font-bold text-orange-500">
              {apps.filter(a => a.status === 'in_review' || a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-500">
              {apps.filter(a => a.status === 'rejected').length}
            </div>
          </div>
        </div>

        {/* Apps List */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">My Apps</h2>
          </div>

          <div className="divide-y divide-gray-800">
            {apps.map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-800/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{app.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[app.status].bgColor} ${statusConfig[app.status].textColor}`}>
                        {statusConfig[app.status].label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div>Version: {app.version}</div>
                      <div>•</div>
                      <div>Uploaded: {new Date(app.uploadedAt).toLocaleDateString('en-US')}</div>
                      <div>•</div>
                      <div className="font-mono text-xs">Hash: {app.fileHash.substring(0, 16)}...</div>
                    </div>

                    {app.reviewNotes && (
                      <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div className="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</div>
                            <div className="text-sm text-red-300">{app.reviewNotes}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {app.status === 'published' && (
                      <a
                        href={`/apps/${app.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition text-sm font-medium"
                      >
                        View Details
                      </a>
                    )}
                    {app.status === 'rejected' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition text-sm font-medium">
                        Re-upload
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {apps.length === 0 && !loading && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">No apps uploaded yet</h3>
            <p className="text-gray-400 mb-6">Upload your first app and get it reviewed!</p>
            <a
              href="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold"
            >
              Upload App
            </a>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-20 text-center">
            <div className="text-gray-400">Loading your apps...</div>
          </div>
        )}
      </div>
    </div>
  )
}
