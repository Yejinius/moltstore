import Link from 'next/link'

// Lobster SVG Component
function LobsterIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body */}
      <ellipse cx="50" cy="55" rx="18" ry="25" fill="#E53935"/>
      {/* Head */}
      <ellipse cx="50" cy="28" rx="12" ry="10" fill="#E53935"/>
      {/* Eyes */}
      <circle cx="44" cy="22" r="3" fill="#000"/>
      <circle cx="56" cy="22" r="3" fill="#000"/>
      <circle cx="44" cy="21" r="1" fill="#fff"/>
      <circle cx="56" cy="21" r="1" fill="#fff"/>
      {/* Antennae */}
      <path d="M44 18 Q35 5 25 8" stroke="#E53935" strokeWidth="2" fill="none"/>
      <path d="M56 18 Q65 5 75 8" stroke="#E53935" strokeWidth="2" fill="none"/>
      {/* Left claw */}
      <ellipse cx="22" cy="45" rx="12" ry="8" fill="#E53935" transform="rotate(-30 22 45)"/>
      <ellipse cx="12" cy="38" rx="8" ry="5" fill="#E53935" transform="rotate(-45 12 38)"/>
      <ellipse cx="10" cy="32" rx="6" ry="4" fill="#E53935" transform="rotate(-60 10 32)"/>
      {/* Right claw */}
      <ellipse cx="78" cy="45" rx="12" ry="8" fill="#E53935" transform="rotate(30 78 45)"/>
      <ellipse cx="88" cy="38" rx="8" ry="5" fill="#E53935" transform="rotate(45 88 38)"/>
      <ellipse cx="90" cy="32" rx="6" ry="4" fill="#E53935" transform="rotate(60 90 32)"/>
      {/* Legs */}
      <path d="M35 50 L20 60" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M35 58 L22 70" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M35 66 L25 80" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 50 L80 60" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 58 L78 70" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 66 L75 80" stroke="#E53935" strokeWidth="3" strokeLinecap="round"/>
      {/* Tail segments */}
      <ellipse cx="50" cy="75" rx="14" ry="6" fill="#C62828"/>
      <ellipse cx="50" cy="82" rx="12" ry="5" fill="#C62828"/>
      <ellipse cx="50" cy="88" rx="10" ry="4" fill="#C62828"/>
      {/* Tail fan */}
      <ellipse cx="42" cy="95" rx="6" ry="4" fill="#E53935" transform="rotate(-20 42 95)"/>
      <ellipse cx="50" cy="96" rx="6" ry="4" fill="#E53935"/>
      <ellipse cx="58" cy="95" rx="6" ry="4" fill="#E53935" transform="rotate(20 58 95)"/>
    </svg>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LobsterIcon className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-red-500">moltstore</span>
                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">beta</span>
              </div>
              <span className="text-xs text-gray-500">the marketplace for agent apps</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/apps" className="text-gray-400 hover:text-white transition">Apps</Link>
            <Link href="/api-key" className="text-gray-400 hover:text-white transition flex items-center gap-1">
              <span>🤖</span> For AI Agents
            </Link>
            <Link href="/upload" className="text-gray-400 hover:text-white transition flex items-center gap-1">
              <span>⚡</span> Developers
            </Link>
          </nav>
        </div>
      </header>

      {/* Developer Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-2 text-center">
        <Link href="/upload" className="text-sm font-medium hover:underline flex items-center justify-center gap-2">
          🚀 Build apps for AI agents — Get early access to our developer platform →
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <LobsterIcon className="w-24 h-24" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Trusted Apps for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            AI Agents
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          A verified backend app marketplace for AI agents and humans.{' '}
          <span className="underline decoration-orange-500">All apps are automatically verified by security agents</span>.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/apps"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
          >
            Browse Apps
          </Link>
          <Link
            href="/upload"
            className="px-8 py-4 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:border-gray-500 hover:text-white transition"
          >
            Upload App
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Security Verified</h3>
            <p className="text-gray-400">
              All apps are automatically verified by AI security agents, ensuring safety and reliability.
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Agent Ready</h3>
            <p className="text-gray-400">
              API-based access allows AI agents to search and purchase apps directly.
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fair Commission</h3>
            <p className="text-gray-400">
              Fair revenue distribution for developers. Build trust with a transparent commission system.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">0</div>
              <div className="text-gray-500">Verified Apps</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">0</div>
              <div className="text-gray-500">Active Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">0</div>
              <div className="text-gray-500">Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
              <div className="text-gray-500">Security Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              © 2026 MoltStore. Yejinius + Jarvis.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm">Privacy</a>
              <Link href="/docs" className="text-gray-500 hover:text-gray-300 text-sm">API Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
