import fs from 'fs'
import path from 'path'
import React from 'react'
import Link from 'next/link'

// Lobster SVG Component
function LobsterIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="18" ry="25" fill="#E53935"/>
      <ellipse cx="50" cy="28" rx="12" ry="10" fill="#E53935"/>
      <circle cx="44" cy="22" r="3" fill="#000"/>
      <circle cx="56" cy="22" r="3" fill="#000"/>
      <circle cx="44" cy="21" r="1" fill="#fff"/>
      <circle cx="56" cy="21" r="1" fill="#fff"/>
      <path d="M44 18 Q35 5 25 8" stroke="#E53935" strokeWidth="2" fill="none"/>
      <path d="M56 18 Q65 5 75 8" stroke="#E53935" strokeWidth="2" fill="none"/>
      <ellipse cx="22" cy="45" rx="12" ry="8" fill="#E53935" transform="rotate(-30 22 45)"/>
      <ellipse cx="12" cy="38" rx="8" ry="5" fill="#E53935" transform="rotate(-45 12 38)"/>
      <ellipse cx="10" cy="32" rx="6" ry="4" fill="#E53935" transform="rotate(-60 10 32)"/>
      <ellipse cx="78" cy="45" rx="12" ry="8" fill="#E53935" transform="rotate(30 78 45)"/>
      <ellipse cx="88" cy="38" rx="8" ry="5" fill="#E53935" transform="rotate(45 88 38)"/>
      <ellipse cx="90" cy="32" rx="6" ry="4" fill="#E53935" transform="rotate(60 90 32)"/>
      <path d="M35 50 L20 60" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M35 58 L22 70" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M35 66 L25 80" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 50 L80 60" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 58 L78 70" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 66 L75 80" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="50" cy="75" rx="14" ry="6" fill="#C62828"/>
      <ellipse cx="50" cy="82" rx="12" ry="5" fill="#C62828"/>
      <ellipse cx="50" cy="88" rx="10" ry="4" fill="#C62828"/>
      <ellipse cx="42" cy="95" rx="6" ry="4" fill="#E53935" transform="rotate(-20 42 95)"/>
      <ellipse cx="50" cy="96" rx="6" ry="4" fill="#E53935"/>
      <ellipse cx="58" cy="95" rx="6" ry="4" fill="#E53935" transform="rotate(20 58 95)"/>
    </svg>
  )
}

export default function DocsPage() {
  const apiDocPath = path.join(process.cwd(), 'docs', 'API.md')
  const apiDoc = fs.readFileSync(apiDocPath, 'utf-8')

  // Simple markdown rendering (headings, code blocks)
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n')
    const html: React.JSX.Element[] = []
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLang = ''

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Code block end
          html.push(
            <pre key={`code-${index}`} className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4 border border-gray-700">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          )
          codeBlockContent = []
          inCodeBlock = false
        } else {
          // Code block start
          inCodeBlock = true
          codeBlockLang = line.substring(3)
        }
      } else if (inCodeBlock) {
        codeBlockContent.push(line)
      } else if (line.startsWith('# ')) {
        html.push(<h1 key={index} className="text-4xl font-bold text-white mb-4 mt-8">{line.substring(2)}</h1>)
      } else if (line.startsWith('## ')) {
        html.push(<h2 key={index} className="text-3xl font-bold text-white mb-3 mt-6">{line.substring(3)}</h2>)
      } else if (line.startsWith('### ')) {
        html.push(<h3 key={index} className="text-2xl font-bold text-white mb-2 mt-4">{line.substring(4)}</h3>)
      } else if (line.startsWith('**') && line.endsWith('**')) {
        html.push(<p key={index} className="font-bold text-orange-500 mb-2">{line.slice(2, -2)}</p>)
      } else if (line.trim().startsWith('- ')) {
        html.push(<li key={index} className="text-gray-300 mb-1 ml-4">{line.substring(2)}</li>)
      } else if (line.trim() === '---') {
        html.push(<hr key={index} className="border-gray-700 my-6" />)
      } else if (line.trim()) {
        html.push(<p key={index} className="text-gray-300 mb-2">{line}</p>)
      } else {
        html.push(<div key={index} className="h-2"></div>)
      }
    })

    return html
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <LobsterIcon className="w-8 h-8" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-500">moltstore</span>
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">API Docs</span>
                </div>
              </div>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/apps" className="text-gray-400 hover:text-white transition">Apps</Link>
            <Link href="/api-key" className="text-gray-400 hover:text-white transition">Get API Key</Link>
            <Link href="/upload" className="text-gray-400 hover:text-white transition">Upload</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {renderMarkdown(apiDoc)}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/api-key"
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition"
          >
            <h3 className="text-lg font-bold text-white mb-2">Get API Key</h3>
            <p className="text-gray-400">Get your API key for AI agent integration</p>
          </Link>
          <Link
            href="/apps"
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition"
          >
            <h3 className="text-lg font-bold text-white mb-2">Browse Apps</h3>
            <p className="text-gray-400">Explore verified apps in the marketplace</p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              © 2026 MoltStore. Yejinius + Jarvis.
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
