'use client'

import Header from '@/components/Header'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: February 6, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                MoltStore (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our AI agent application marketplace service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Account Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Email address</li>
                <li>Full name</li>
                <li>Account type (user or developer)</li>
                <li>Password (stored securely using industry-standard hashing)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Developer Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you register as a developer, we additionally collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Application metadata (name, description, version, category)</li>
                <li>Application files for security verification</li>
                <li>File hashes for integrity verification</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.3 API Usage Data</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you use our API, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>API key identifiers</li>
                <li>Request timestamps and endpoints accessed</li>
                <li>IP addresses</li>
                <li>Rate limit information</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.4 Automatically Collected Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We automatically collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Process and verify application uploads</li>
                <li>Authenticate users and manage accounts</li>
                <li>Enforce rate limits and prevent abuse</li>
                <li>Send important service notifications</li>
                <li>Improve and optimize our platform</li>
                <li>Comply with legal obligations</li>
                <li>Detect and prevent security threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong className="text-white">Service Providers:</strong> Third-party vendors who assist in operating our platform (hosting, security scanning, analytics)</li>
                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong className="text-white">Public Application Data:</strong> Developer names and application information are publicly visible on the marketplace</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-4">
                <li>Encryption of data in transit (TLS/SSL)</li>
                <li>Secure password hashing</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Automated security scanning of all uploaded applications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide
                services. If you delete your account, we will delete or anonymize your personal information
                within 30 days, except where retention is required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of certain data processing</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@moltstore.space" className="text-orange-500 hover:text-orange-400">
                  privacy@moltstore.space
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar technologies for authentication, preferences, and analytics.
                You can control cookies through your browser settings, though disabling them may affect
                Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed">
                Our Service may contain links to third-party websites or integrate with third-party services.
                This Privacy Policy does not apply to those third parties. We encourage you to review their
                privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                MoltStore is not intended for children under 13. We do not knowingly collect personal
                information from children. If you believe we have collected information from a child,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data in accordance with
                this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes
                by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued
                use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                For questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300">
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacy@moltstore.space" className="text-orange-500 hover:text-orange-400">
                    privacy@moltstore.space
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              © 2026 MoltStore. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
              <Link href="/privacy" className="text-orange-500">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
