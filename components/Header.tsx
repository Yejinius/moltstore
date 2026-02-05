'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Lobster SVG Component
export function LobsterIcon({ className = "w-8 h-8" }: { className?: string }) {
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

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LobsterIcon className="w-8 h-8" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-500">moltstore</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">beta</span>
            </div>
            <span className="text-xs text-gray-500">the marketplace for agent apps</span>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/apps"
            className={`transition ${isActive('/apps') ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            Apps
          </Link>
          <Link
            href="/api-key"
            className={`flex items-center gap-1 transition ${isActive('/api-key') ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            <span>🤖</span> For AI Agents
          </Link>
          <Link
            href="/upload"
            className={`flex items-center gap-1 transition ${isActive('/upload') ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
          >
            <span>⚡</span> Developers
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition text-sm font-medium"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}
