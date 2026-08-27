import type { Metadata } from 'next'
import './globals.css'
import { LowBandwidthToggle } from '@/components/LowBandwidthToggle'
import { AIAssistant } from '@/components/AIAssistant'
import { FontSizeControls } from '@/components/FontSizeControls'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { FeedbackWidget } from '@/components/FeedbackWidget'

export const metadata: Metadata = {
  title: 'Parivahan Sewa | परिवहन सेवा | Karnataka Motor Vehicles Department',
  description: 'Apply for driving licence, track applications, and access RTO services online. Karnataka Transport Department — Parivahan Sewa portal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const role = cookieStore.get('role')?.value || ''
  const userNameRaw = cookieStore.get('userName')?.value || ''
  const userName = userNameRaw ? decodeURIComponent(userNameRaw) : ''
  const isLoggedIn = !!role

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#003580" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to Main Content / मुख्य विषय पर जाएं</a>

        {/* Tricolor top stripe */}
        <div className="tricolor-stripe" role="presentation" />

        {/* Utility / accessibility bar */}
        <div className="utility-bar" role="navigation" aria-label="Utility navigation">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gray-400">भारत सरकार | Government of India</span>
              <span className="hidden sm:inline text-gray-600">|</span>
              <a href="#main-content" className="text-gray-400 hover:text-white underline text-xs">
                Skip to Content
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-gray-500">Screen Reader</span>
              <FontSizeControls />
              <div className="border-l border-gray-700 pl-3">
                <LowBandwidthToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Main government header */}
        <header className="gov-header" role="banner">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-5">

            {/* India emblem */}
            <div className="gov-emblem" aria-hidden="true">
              🏛️
            </div>

            {/* Site identity */}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                Government of India &nbsp;·&nbsp; Ministry of Road Transport &amp; Highways
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gov-blue mt-0.5 leading-tight tracking-tight">
                Parivahan Sewa
              </h1>
              <div className="text-sm text-gray-600 font-hindi mt-0.5">
                परिवहन सेवा &nbsp;—&nbsp; Motor Vehicles Department, Karnataka
              </div>
            </div>

            {/* Right: NIC + login state */}
            <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-gov-blue">NIC · MeITY</div>
                <div className="text-xs text-gray-400">Powered by National Informatics Centre</div>
              </div>
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-right">
                    <div className="font-semibold text-gov-blue">{userName || 'User'}</div>
                    <div className="text-gray-500 capitalize">{role}</div>
                  </div>
                  <a
                    href="/auth/logout"
                    className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 transition-colors font-medium"
                  >
                    Sign Out
                  </a>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs bg-gov-orange text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition-colors"
                >
                  🔐 Sign In
                </Link>
              )}
            </div>
          </div>

          {/* DEMO warning */}
          <div className="bg-amber-50 border-t border-amber-200 py-1.5 text-center">
            <span className="text-xs text-amber-800 font-medium">
              ⚠ PROTOTYPE / DEMO — Not a real government portal. All data is entirely synthetic.
            </span>
          </div>
        </header>

        {/* Navigation bar — role-based */}
        <nav className="gov-nav" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <Link href="/" className="gov-nav-link">🏠 Home</Link>

            {/* Citizen / public links */}
            {role !== 'officer' && role !== 'admin' && (
              <>
                <Link href="/apply" className="gov-nav-link">Apply Online</Link>
                <Link href="/applications" className="gov-nav-link">Track Application</Link>
              </>
            )}

            {/* Officer-only link */}
            {role === 'officer' && (
              <Link href="/officer" className="gov-nav-link">👮 Officer Portal</Link>
            )}

            {/* Admin-only link */}
            {role === 'admin' && (
              <>
                <Link href="/officer" className="gov-nav-link">👮 Officer Portal</Link>
                <Link href="/admin" className="gov-nav-link">📊 Admin Dashboard</Link>
              </>
            )}

            <div className="flex-1" />
            {isLoggedIn ? (
              <a href="/auth/logout" className="gov-nav-link text-red-300 hover:text-red-100 border-l border-white/10 pl-4">
                Sign Out
              </a>
            ) : (
              <Link href="/login" className="gov-nav-link bg-gov-orange/90 hover:bg-gov-orange font-semibold">
                🔐 Sign In / SSO
              </Link>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 pb-16 pt-4 min-h-screen">
          {children}
        </main>

        {/* AI Assistant floating button */}
        <AIAssistant />

        {/* Feedback floating button */}
        <FeedbackWidget />

        {/* Footer */}
        <footer className="bg-gov-blue text-white mt-8" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-gov-saffron font-bold mb-3 text-sm tracking-wide">PARIVAHAN SEWA</div>
                <div className="text-blue-200 text-xs leading-relaxed">
                  Karnataka Motor Vehicles Department<br />
                  Online Citizen Services Portal<br />
                  A prototype for modernized RTO services.
                </div>
                <div className="mt-4 text-xs text-blue-400">
                  Powered by NIC · Ministry of Road Transport &amp; Highways
                </div>
              </div>
              <div>
                <div className="text-gov-saffron font-bold mb-3 text-sm tracking-wide">QUICK LINKS</div>
                <div className="space-y-2 text-xs text-blue-200">
                  <div><Link href="/apply" className="hover:text-white hover:underline">New Learner's Licence</Link></div>
                  <div><Link href="/applications" className="hover:text-white hover:underline">Track Application Status</Link></div>
                  <div><Link href="/officer" className="hover:text-white hover:underline">Officer Login Portal</Link></div>
                  <div><Link href="/admin" className="hover:text-white hover:underline">Admin Dashboard</Link></div>
                  <div><Link href="/about-this-demo" className="hover:text-white hover:underline">About This Demo</Link></div>
                </div>
              </div>
              <div>
                <div className="text-gov-saffron font-bold mb-3 text-sm tracking-wide">HELP &amp; CONTACT</div>
                <div className="space-y-2 text-xs text-blue-200">
                  <div>
                    Helpline: <strong className="text-white">1800-XXX-XXXX</strong>
                    <span className="badge-mock ml-1 !text-amber-300 !border-amber-600 !bg-transparent">MOCK</span>
                  </div>
                  <div>Mon–Sat &nbsp;10:00 AM – 5:00 PM</div>
                  <div className="mt-3">
                    <a href="#" className="hover:text-white hover:underline">Accessibility Statement</a>
                  </div>
                  <div><a href="#" className="hover:text-white hover:underline">Privacy Policy</a></div>
                  <div><a href="#" className="hover:text-white hover:underline">Terms of Use</a></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gov-navy border-t border-blue-800 text-center py-3">
            <span className="text-xs text-blue-300">
              © 2024 Government of Karnataka · Motor Vehicles Department ·
              Designed &amp; Developed by NIC Karnataka
            </span>
          </div>
          <div className="bg-amber-900/30 border-t border-amber-700/50 text-center py-2">
            <span className="text-xs text-amber-400">
              ⚠ DEMO PROTOTYPE — Not a real government service. Data is entirely synthetic.
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
