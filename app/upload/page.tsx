'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth-context'

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
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

    if (!user) {
      router.push('/login?redirect=/upload')
      return
    }

    if (!file) {
      alert('Please select a file.')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('appData', JSON.stringify(formData))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (response.ok) {
        alert(`App uploaded successfully!\n\nFile hash: ${result.fileHash.substring(0, 16)}...\nStatus: ${result.status}\n\nPending review.`)
        router.push('/dashboard')
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Error during upload: ${error}`)
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Login Required</h1>
            <p className="text-gray-400 mb-6">
              You need to sign in as a developer to upload apps to MoltStore.
            </p>
            <div className="space-y-3">
              <Link
                href="/login?redirect=/upload"
                className="block w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold"
              >
                Sign In
              </Link>
              <Link
                href="/signup?redirect=/upload"
                className="block w-full px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition font-semibold"
              >
                Create Developer Account
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              Already have an account? Sign in to start uploading your apps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Your App</h1>
          <p className="text-gray-400">
            All apps are automatically verified by security agents. Only safe and reliable apps are approved.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Review Process</h2>
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-semibold">1</div>
              <span className="text-gray-400">Pending</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-800 text-gray-500 rounded-full flex items-center justify-center font-semibold">2</div>
              <span className="text-gray-400">In Review</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-800 text-gray-500 rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="text-gray-400">Approved</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-800 mx-2"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-800 text-gray-500 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="text-gray-400">Published</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">App Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome App"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Short Description *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your app"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Detailed description of your app's features and benefits"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="29.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Key Features</h3>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Feature description"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 text-orange-500 hover:bg-orange-500/10 rounded-lg text-sm font-medium"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-500"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) })}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 text-orange-500 hover:bg-orange-500/10 rounded-lg text-sm font-medium"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">App File Upload</h3>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".zip,.tar.gz"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {file ? (
                      <div className="text-white font-medium">{file.name}</div>
                    ) : (
                      <>
                        <div className="text-orange-500 font-medium">Click to select or drag & drop</div>
                        <div className="text-sm text-gray-500">ZIP, TAR.GZ (max 100MB)</div>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-800">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload App'}
              </button>
              <a
                href="/apps"
                className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition font-semibold text-center"
              >
                Cancel
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
