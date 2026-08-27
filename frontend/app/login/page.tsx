'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

const DEMO_CREDENTIALS = [
  { label: 'Citizen — Anjali Sharma', username: 'anjali.sharma', password: 'demo123', role: 'citizen' },
  { label: 'Citizen — Fatima Begum', username: 'fatima.begum', password: 'demo123', role: 'citizen' },
  { label: 'Citizen — Suresh Reddy', username: 'suresh.reddy', password: 'demo123', role: 'citizen' },
  { label: 'Officer — Rajesh Kumar (Bengaluru)', username: 'rajesh.kumar', password: 'officer123', role: 'officer' },
  { label: 'Officer — Priya Nair (Mysuru)', username: 'priya.nair', password: 'officer123', role: 'officer' },
  { label: 'Admin — System Administrator', username: 'admin', password: 'admin@rto', role: 'admin' },
]

function LoginContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const msg = params.get('msg')
  const redirectTo = params.get('redirect_to') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  function fillDemo(cred: typeof DEMO_CREDENTIALS[0]) {
    setUsername(cred.username)
    setPassword(cred.password)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 32 }}>
      {/* NIC SSO Header band */}
      <div className="w-full max-w-md mb-0">
        {/* Tricolor mini stripe */}
        <div style={{ height: 4, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33% 66.66%, #046A38 66.66%)' }} />

        <div className="sso-card fade-in">
          {/* SSO header */}
          <div className="sso-header">
            <div className="flex justify-center mb-3">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                🏛️
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 2 }}>
              GOVERNMENT OF INDIA
            </div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
              Parivahan Sewa — SSO Portal
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              Secure Sign-In via NIC eAuth · DigiLocker · Gmail · Outlook
            </div>
            <div style={{
              marginTop: 12,
              background: 'rgba(255,103,31,0.25)',
              border: '1px solid rgba(255,103,31,0.5)',
              borderRadius: 4,
              padding: '6px 10px',
              color: '#FFD580',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              ⚠ DEMO PORTAL — Mock authentication only
            </div>
          </div>

          {/* Body */}
          <div className="sso-body">
            {/* Error / success messages */}
            {error === 'invalid_credentials' && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 4, padding: '10px 14px', marginBottom: 16,
                color: '#991B1B', fontSize: 13,
              }}>
                ❌ Invalid credentials. Please check your username and password.
              </div>
            )}
            {msg === 'logged_out' && (
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 4, padding: '10px 14px', marginBottom: 16,
                color: '#166534', fontSize: 13,
              }}>
                ✓ Signed out successfully.
              </div>
            )}

            {/* Login form — submits to Express /auth/login */}
            <form action="/auth/login" method="POST" onSubmit={() => setLoading(true)}>
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  DigiLocker ID / Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="e.g. anjali.sharma"
                  required
                  autoComplete="username"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  Password / OTP
                  <span className="badge-mock ml-2">MOCK</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="demo123 for citizens · officer123 for officers"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <><span className="spinner" /> Authenticating…</>
                ) : (
                  '🔐 Sign In to Parivahan Sewa'
                )}
              </button>
            </form>

            {/* SSO buttons */}
            <div style={{ textAlign: 'center', margin: '14px 0 10px', color: '#9CA3AF', fontSize: 12 }}>
              — or sign in with —
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* DigiLocker */}
              <a
                href={`/digilocker?redirect_to=${encodeURIComponent(redirectTo)}&provider=digilocker`}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1.5px solid #1F3A8F',
                  borderRadius: 4,
                  background: '#EFF6FF',
                  color: '#1F3A8F',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ fontSize: 18 }}>🔒</span>
                <span>Digi</span>
                <span style={{
                  background: '#FF671F',
                  color: '#fff',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: 13,
                }}>Locker</span>
                <span>— Sign in with Aadhaar</span>
              </a>

              {/* Gmail / Google */}
              <a
                href={`/digilocker?redirect_to=${encodeURIComponent(redirectTo)}&provider=google`}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1.5px solid #DB4437',
                  borderRadius: 4,
                  background: '#FFF5F5',
                  color: '#B91C1C',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.95 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>Continue with Gmail</span>
                <span style={{
                  marginLeft: 2,
                  background: '#FECACA',
                  color: '#991B1B',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 10,
                }}>MOCK</span>
              </a>

              {/* Outlook / Microsoft */}
              <a
                href={`/digilocker?redirect_to=${encodeURIComponent(redirectTo)}&provider=microsoft`}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1.5px solid #0078D4',
                  borderRadius: 4,
                  background: '#EFF6FF',
                  color: '#0369A1',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 23 23" style={{ flexShrink: 0 }}>
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                </svg>
                <span>Continue with Outlook</span>
                <span style={{
                  marginLeft: 2,
                  background: '#BFDBFE',
                  color: '#1E40AF',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 10,
                }}>MOCK</span>
              </a>
            </div>

            {/* Demo credentials */}
            <div style={{
              marginTop: 20,
              background: '#F8FAFF',
              border: '1px solid #DBEAFE',
              borderRadius: 6,
              padding: '14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 10, letterSpacing: '0.05em' }}>
                DEMO CREDENTIALS — Click to fill
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO_CREDENTIALS.map(cred => (
                  <button
                    key={cred.username}
                    type="button"
                    onClick={() => fillDemo(cred)}
                    style={{
                      textAlign: 'left',
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: 4,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'border-color 0.15s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = '#003580')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
                  >
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      background: cred.role === 'officer' ? '#EFF6FF' : cred.role === 'admin' ? '#FEF3C7' : '#F0FDF4',
                      color: cred.role === 'officer' ? '#1E40AF' : cred.role === 'admin' ? '#92400E' : '#166534',
                      minWidth: 48,
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}>
                      {cred.role}
                    </span>
                    <span style={{ color: '#374151' }}>{cred.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            padding: '12px 28px',
            textAlign: 'center',
            fontSize: 11,
            color: '#9CA3AF',
          }}>
            This portal is operated by NIC on behalf of Ministry of Road Transport &amp; Highways
            <br />
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>DEMO PROTOTYPE — Not a real government service</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
        <div className="sso-card" style={{ width: '100%', maxWidth: 420 }}>
          <div className="sso-header">
            <div style={{ height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
          </div>
          <div className="sso-body">
            <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 44 }} />
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
