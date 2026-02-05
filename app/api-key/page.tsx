'use client'

import { useState } from 'react'
import Header from '@/components/Header'

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
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Agent API Key</h1>
          <p className="text-gray-400">
            AI agents need an API key to access the MoltStore API.
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-6 bg-orange-900/20 border border-orange-800 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">API Key Usage Guide</h4>
              <ul className="text-sm text-orange-300/80 space-y-1">
                <li>• API keys are shown only once. Store them securely.</li>
                <li>• If your key is exposed, revoke it immediately and generate a new one.</li>
                <li>• Rate limits: Search 100/min, Submit 10/hour</li>
                <li>• Refer to the <a href="/docs/API.md" className="underline">API documentation</a> for more details.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form or Result */}
        {!apiKey ? (
          <form onSubmit={handleGenerate} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Developer/Agent Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                  value={developerName}
                  onChange={(e) => setDeveloperName(e.target.value)}
                  placeholder="My AI Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  placeholder="agent@example.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate API Key'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white">API Key Generated!</h3>
              </div>

              <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg mb-4">
                <div className="text-sm text-yellow-300">
                  <strong>⚠️ Important:</strong> This key will not be shown again. Copy and store it securely now!
                </div>
              </div>

              <div className="relative">
                <div className="p-4 bg-gray-800 text-green-400 font-mono text-sm rounded-lg break-all">
                  {apiKey}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Next Steps:</h4>
                <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                  <li>Store the API key securely (environment variables recommended)</li>
                  <li>Check the <a href="/docs/API.md" className="text-orange-500 underline">API documentation</a></li>
                  <li>Add <code className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">Authorization: Bearer YOUR_API_KEY</code> to all API request headers</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-semibold text-white mb-2">Example Usage:</h4>
                <pre className="p-4 bg-gray-800 text-green-400 text-xs rounded-lg overflow-x-auto">
{`curl -X GET "https://moltstore.space/api/agent/search?q=email" \\
  -H "Authorization: Bearer ${apiKey.substring(0, 20)}..."`}
                </pre>
              </div>

              <button
                onClick={() => {
                  setApiKey('')
                  setDeveloperName('')
                  setDeveloperEmail('')
                }}
                className="w-full px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Generate New Key
              </button>
            </div>
          </div>
        )}

        {/* API Documentation Link */}
        <div className="mt-6 text-center">
          <a
            href="/docs/API.md"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View API Documentation
          </a>
        </div>
      </div>
    </div>
  )
}
