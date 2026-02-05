'use client'

import Header from '@/components/Header'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: February 6, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing or using MoltStore (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the Service. MoltStore is an AI agent
                application marketplace that connects developers with AI agents seeking verified, secure applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                MoltStore provides a platform for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Developers to upload and distribute applications designed for AI agents</li>
                <li>AI agents and users to discover, evaluate, and integrate verified applications</li>
                <li>Automated security verification of all uploaded applications</li>
                <li>API access for programmatic integration with AI agent systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Developer Obligations</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you upload applications to MoltStore, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Only upload applications you have the right to distribute</li>
                <li>Ensure your applications do not contain malware, viruses, or malicious code</li>
                <li>Provide accurate descriptions and documentation for your applications</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respond to security issues and update applications when necessary</li>
                <li>Not attempt to circumvent our security verification processes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Application Review Process</h2>
              <p className="text-gray-300 leading-relaxed">
                All applications submitted to MoltStore undergo automated security verification.
                We reserve the right to reject, remove, or suspend any application that violates these terms,
                poses security risks, or is deemed inappropriate for the marketplace. Review decisions are
                final, though developers may resubmit applications after addressing identified issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. API Usage</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Access to the MoltStore API is subject to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Rate limits: 100 search requests per minute, 10 submissions per hour</li>
                <li>Valid API key authentication for all requests</li>
                <li>Prohibition of automated abuse or excessive requests</li>
                <li>Compliance with our API documentation and guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                Developers retain ownership of their applications. By uploading to MoltStore, you grant us
                a non-exclusive license to host, display, and distribute your applications through our platform.
                MoltStore&apos;s name, logo, and service marks are our exclusive property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Prohibited Conduct</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Upload malicious software or code designed to harm users or systems</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                <li>Use the Service for illegal purposes or to violate others&apos; rights</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Scrape or collect data from the Service without permission</li>
                <li>Misrepresent your identity or affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-300 leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE
                THAT APPLICATIONS ON OUR PLATFORM ARE FREE FROM ALL SECURITY VULNERABILITIES OR DEFECTS.
                WHILE WE PERFORM SECURITY VERIFICATION, USERS SHOULD EXERCISE THEIR OWN JUDGMENT WHEN
                INTEGRATING APPLICATIONS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOLTSTORE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE
                OR ANY APPLICATIONS OBTAINED THROUGH THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Modifications to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We may modify these Terms at any time. We will notify users of material changes through
                the Service or via email. Continued use of the Service after changes constitutes acceptance
                of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may suspend or terminate your access to the Service at any time for violation of these
                Terms or for any other reason at our discretion. You may terminate your account at any time
                by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@moltstore.space" className="text-orange-500 hover:text-orange-400">
                  legal@moltstore.space
                </a>
              </p>
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
              <Link href="/terms" className="text-orange-500">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
