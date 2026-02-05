import fs from 'fs'
import path from 'path'
import React from 'react'

export default function DocsPage() {
  const apiDocPath = path.join(process.cwd(), 'docs', 'API.md')
  const apiDoc = fs.readFileSync(apiDocPath, 'utf-8')

  // 간단한 마크다운 렌더링 (제목, 코드 블록만)
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n')
    const html: React.JSX.Element[] = []
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLang = ''

    lines.forEach((line, index) => {
      // 코드 블록 시작/종료
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 코드 블록 종료
          html.push(
            <pre key={`code-${index}`} className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          )
          codeBlockContent = []
          inCodeBlock = false
        } else {
          // 코드 블록 시작
          inCodeBlock = true
          codeBlockLang = line.substring(3)
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line)
      } else if (line.startsWith('# ')) {
        html.push(<h1 key={index} className="text-4xl font-bold text-gray-900 mb-4 mt-8">{line.substring(2)}</h1>)
      } else if (line.startsWith('## ')) {
        html.push(<h2 key={index} className="text-3xl font-bold text-gray-900 mb-3 mt-6">{line.substring(3)}</h2>)
      } else if (line.startsWith('### ')) {
        html.push(<h3 key={index} className="text-2xl font-bold text-gray-900 mb-2 mt-4">{line.substring(4)}</h3>)
      } else if (line.startsWith('**') && line.endsWith('**')) {
        html.push(<p key={index} className="font-bold text-gray-900 mb-2">{line.slice(2, -2)}</p>)
      } else if (line.trim().startsWith('- ')) {
        html.push(<li key={index} className="text-gray-700 mb-1">{line.substring(2)}</li>)
      } else if (line.trim()) {
        html.push(<p key={index} className="text-gray-700 mb-2">{line}</p>)
      } else {
        html.push(<div key={index} className="h-2"></div>)
      }
    })

    return html
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoltStore API Docs
              </h1>
            </a>
          </div>
          <nav className="flex gap-6">
            <a href="/apps" className="text-gray-600 hover:text-gray-900">Apps</a>
            <a href="/api-key" className="text-gray-600 hover:text-gray-900">Get API Key</a>
            <a href="/upload" className="text-gray-600 hover:text-gray-900">Upload</a>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {renderMarkdown(apiDoc)}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <a
            href="/api-key"
            className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">🔑 Get API Key</h3>
            <p className="text-gray-600">AI 에이전트용 API 키를 발급받으세요</p>
          </a>
          <a
            href="/apps"
            className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">📦 Browse Apps</h3>
            <p className="text-gray-600">검증된 앱을 둘러보세요</p>
          </a>
        </div>
      </div>
    </div>
  )
}
