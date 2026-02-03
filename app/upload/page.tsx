'use client'

import { useState } from 'react'

type AppStatus = 'pending' | 'in_review' | 'approved' | 'published' | 'rejected'

export default function UploadPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    category: 'Productivity',
    price: '',
    features: [''],
    tags: [''],
    version: '1.0.0',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      alert('파일을 선택해주세요.')
      return
    }

    setUploading(true)

    try {
      // 파일 업로드
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('appData', JSON.stringify(formData))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (response.ok) {
        alert(`앱이 성공적으로 업로드되었습니다!\n\n파일 해시: ${result.fileHash.substring(0, 16)}...\n상태: ${result.status}\n\n심사 대기 중입니다.`)
        // 대시보드로 리디렉션
        window.location.href = '/dashboard'
      } else {
        alert(`업로드 실패: ${result.error}`)
      }
    } catch (error) {
      alert(`업로드 중 오류 발생: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] })
  }

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    setFormData({ ...formData, tags: newTags })
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
            <a href="/upload" className="text-blue-600 font-semibold">Upload App</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Developers</a>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your App</h1>
          <p className="text-gray-600">
            모든 앱은 시큐리티 에이전트의 자동 검증을 거쳐 심사됩니다. 안전하고 신뢰할 수 있는 앱만 승인됩니다.
          </p>
        </div>

        {/* Upload Process */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">심사 프로세스</h2>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">1</div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold">2</div>
              <span className="text-gray-600">In Review</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="text-gray-600">Approved</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="text-gray-600">Published</span>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">앱 이름 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome App"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">짧은 설명 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your app"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Detailed description of your app's features and benefits"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Productivity</option>
                      <option>Automation</option>
                      <option>Data</option>
                      <option>Integration</option>
                      <option>AI</option>
                      <option>Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가격 (USD) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="29.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">버전 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">주요 기능</h3>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Feature description"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  + 기능 추가
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">태그</h3>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) })}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                >
                  + 태그 추가
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">앱 파일 업로드</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".zip,.tar.gz"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {file ? (
                      <div className="text-gray-900 font-medium">{file.name}</div>
                    ) : (
                      <>
                        <div className="text-blue-600 font-medium">파일 선택 또는 드래그 앤 드롭</div>
                        <div className="text-sm text-gray-500">ZIP, TAR.GZ (최대 100MB)</div>
                      </>
                    )}
                  </div>
                </label>
              </div>
              {file && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-900">
                      <strong>해시 검증:</strong> 업로드 시 파일의 SHA-256 해시가 자동으로 생성되어 무결성이 보장됩니다.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
              >
                {uploading ? '업로드 중...' : '앱 업로드'}
              </button>
              <a
                href="/apps"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-semibold"
              >
                취소
              </a>
            </div>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">심사 안내</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 심사는 보통 1-3일 소요됩니다</li>
                <li>• 시큐리티 에이전트가 자동으로 보안 검증을 수행합니다</li>
                <li>• 거부된 경우 상세한 사유와 함께 알림을 받습니다</li>
                <li>• 승인 후 즉시 마켓플레이스에 공개됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
