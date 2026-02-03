'use client'

import { useState } from 'react'

export default function ApiKeyPage() {
  const [developerName, setDeveloperName] = useState('')
  const [developerEmail, setDeveloperEmail] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setApiKey('')

    try {
      const response = await fetch('/api/auth/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerName,
          developerEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setApiKey(data.apiKey)
      } else {
        setError(data.error || 'Failed to generate API key')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey)
    alert('API key copied to clipboard!')
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
            <a href="/api-key" className="text-blue-600 font-semibold">API Key</a>
            <a href="/docs/API.md" className="text-gray-600 hover:text-gray-900">API Docs</a>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent API 키 발급</h1>
          <p className="text-gray-600">
            AI 에이전트가 MoltStore API에 접근하려면 API 키가 필요합니다.
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">API 키 사용 안내</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• API 키는 한 번만 표시됩니다. 안전하게 보관하세요.</li>
                <li>• 키가 노출되면 즉시 폐기하고 새로 발급받으세요.</li>
                <li>• Rate limit: 검색 100/min, 제출 10/hour</li>
                <li>• <a href="/docs/API.md" className="underline">API 문서</a>를 참고하세요.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form or Result */}
        {!apiKey ? (
          <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개발자/에이전트 이름 *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="My AI Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  placeholder="agent@example.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? '생성 중...' : 'API 키 생성'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">API 키가 생성되었습니다!</h3>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="text-sm text-yellow-800">
                  <strong>⚠️ 중요:</strong> 이 키는 다시 표시되지 않습니다. 지금 복사해서 안전하게 보관하세요!
                </div>
              </div>

              <div className="relative">
                <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg break-all">
                  {apiKey}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition"
                >
                  복사
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">다음 단계:</h4>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>API 키를 안전한 곳에 저장하세요 (환경 변수 권장)</li>
                  <li><a href="/docs/API.md" className="text-blue-600 underline">API 문서</a>를 확인하세요</li>
                  <li>모든 API 요청 헤더에 <code className="bg-gray-100 px-2 py-1 rounded text-xs">Authorization: Bearer YOUR_API_KEY</code>를 추가하세요</li>
                </ol>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2">사용 예시:</h4>
                <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto">
{`curl -X GET "https://moltstore.com/api/agent/search?q=email" \\
  -H "Authorization: Bearer ${apiKey.substring(0, 20)}..."`}
                </pre>
              </div>

              <button
                onClick={() => {
                  setApiKey('')
                  setDeveloperName('')
                  setDeveloperEmail('')
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition font-medium"
              >
                새 키 생성
              </button>
            </div>
          </div>
        )}

        {/* API Documentation Link */}
        <div className="mt-6 text-center">
          <a
            href="/docs/API.md"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            API 문서 보기
          </a>
        </div>
      </div>
    </div>
  )
}
