'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

const DEMO_ACCOUNTS = [
  { email: 'anjali.sharma@gmail.com', name: 'Anjali Sharma', role: 'citizen', aadhaar: 'MOCK-2847-XXXX' },
  { email: 'fatima.begum@gmail.com', name: 'Fatima Begum', role: 'citizen', aadhaar: 'MOCK-6284-XXXX' },
  { email: 'suresh.reddy@rediffmail.com', name: 'Suresh Reddy', role: 'citizen', aadhaar: 'MOCK-7391-XXXX' },
  { email: 'rajesh.kumar@karnataka.gov.in', name: 'Rajesh Kumar', role: 'officer', aadhaar: null },
  { email: 'priya.nair@karnataka.gov.in', name: 'Priya Nair', role: 'officer', aadhaar: null },
]

const PROVIDER_CONFIG = {
  google: {
    label: 'Gmail',
    title: 'Sign in with Gmail',
    subtitle: 'Enter your Gmail address to continue',
    btnText: 'Continue with Gmail',
    btnColor: '#DB4437',
    headerGradient: 'linear-gradient(135deg, #DB4437 0%, #E57373 100%)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.95 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    ),
    shareText: 'Google will share your name and email with Parivahan Sewa.',
    inputLabel: 'Gmail Address',
    inputPlaceholder: 'e.g. anjali.sharma@gmail.com',
  },
  microsoft: {
    label: 'Outlook',
    title: 'Sign in with Outlook',
    subtitle: 'Enter your Microsoft email to continue',
    btnText: 'Continue with Outlook',
    btnColor: '#0078D4',
    headerGradient: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 23 23">
        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
        <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
        <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
        <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
      </svg>
    ),
    shareText: 'Microsoft will share your name and email with Parivahan Sewa.',
    inputLabel: 'Microsoft / Outlook Email',
    inputPlaceholder: 'e.g. anjali@outlook.com',
  },
  digilocker: {
    label: 'DigiLocker',
    title: 'Sign in with DigiLocker',
    subtitle: 'Enter your registered email to continue',
    btnText: 'Continue with DigiLocker',
    btnColor: '#1F3A8F',
    headerGradient: 'linear-gradient(135deg, #1F3A8F 0%, #1565C0 100%)',
    icon: <span style={{ fontSize: 36 }}>🔒</span>,
    shareText: 'DigiLocker will share your name, photo, and Aadhaar-linked documents with Parivahan Sewa.',
    inputLabel: 'Registered Email / Mobile',
    inputPlaceholder: 'e.g. anjali.sharma@gmail.com',
  },
}

function DigiLockerContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const prefillEmail = params.get('email') || ''
  const redirectTo = params.get('redirect_to') || '/'
  const providerKey = (params.get('provider') || 'digilocker') as keyof typeof PROVIDER_CONFIG
  const provider = PROVIDER_CONFIG[providerKey] ?? PROVIDER_CONFIG.digilocker

  const [email, setEmail] = useState(prefillEmail)
  const [loading, setLoading] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4F8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Tricolor top stripe */}
      <div style={{ width: '100%', height: 5, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33% 66.66%, #046A38 66.66%)' }} />

      {/* DigiLocker Header */}
      <div style={{
        width: '100%',
        background: '#1F3A8F',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        {/* Emblem */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '2px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>🇮🇳</div>

        <div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Government of India · Ministry of Electronics &amp; IT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
              Digi
            </span>
            <span style={{
              background: '#FF671F',
              color: '#fff',
              fontWeight: 800,
              fontSize: 22,
              padding: '0 6px',
              borderRadius: 3,
              letterSpacing: '-0.02em',
            }}>
              Locker
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 }}>
            Secure Document &amp; Identity Platform
          </div>
        </div>

        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{
            background: 'rgba(255,103,31,0.2)',
            border: '1px solid rgba(255,103,31,0.5)',
            borderRadius: 4,
            padding: '4px 10px',
            color: '#FFD580',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            DEMO / MOCK
          </div>
        </div>
      </div>

      {/* Connected app banner */}
      <div style={{
        width: '100%',
        background: '#E8F0FE',
        borderBottom: '1px solid #C5D5F5',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: '#1A3A8F',
      }}>
        <span style={{ fontSize: 16 }}>🔗</span>
        <span>
          <strong>Parivahan Sewa</strong> (Ministry of Road Transport &amp; Highways) is requesting access to your DigiLocker profile
        </span>
        <span style={{
          marginLeft: 'auto',
          background: '#1F3A8F',
          color: '#fff',
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          VERIFIED APP
        </span>
      </div>

      {/* Main card */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          background: provider.headerGradient,
          padding: '24px 28px 20px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{provider.icon}</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            {provider.title}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            {provider.subtitle}
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Error messages */}
          {error === 'not_found' && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 6, padding: '12px 14px', marginBottom: 18,
              color: '#991B1B', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>❌</span>
              <span>
                <strong>Email not found.</strong> This email is not registered in DigiLocker.
                Try a different email or use the demo accounts below.
              </span>
            </div>
          )}
          {error === 'no_email' && (
            <div style={{
              background: '#FFF7ED', border: '1px solid #FED7AA',
              borderRadius: 6, padding: '12px 14px', marginBottom: 18,
              color: '#9A3412', fontSize: 13,
            }}>
              ⚠ Please enter your email address to continue.
            </div>
          )}

          {/* Form */}
          <form action="/auth/digilocker" method="POST" onSubmit={() => setLoading(true)}>
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="provider" value={providerKey} />

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {provider.inputLabel}
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={provider.inputPlaceholder}
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = provider.btnColor}
                onBlur={e => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>

            <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 18 }}>
              {provider.shareText}
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#9CA3AF' : provider.btnColor,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Authenticating…
                </>
              ) : (
                provider.btnText
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>DEMO ACCOUNTS — click to fill</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setEmail(acc.email)}
                style={{
                  textAlign: 'left',
                  background: email === acc.email ? '#EFF6FF' : '#F9FAFB',
                  border: `1.5px solid ${email === acc.email ? '#3B82F6' : '#E5E7EB'}`,
                  borderRadius: 6,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: acc.role === 'officer' ? '#DBEAFE' : '#D1FAE5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {acc.role === 'officer' ? '👮' : '👤'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{acc.name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {acc.email}
                  </div>
                </div>
                <div style={{
                  flexShrink: 0,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: acc.role === 'officer' ? '#DBEAFE' : '#D1FAE5',
                  color: acc.role === 'officer' ? '#1E40AF' : '#166534',
                }}>
                  {acc.role}
                </div>
              </button>
            ))}
          </div>

          {/* Back link */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              href="/login"
              style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}
            >
              ← Sign in with username &amp; password instead
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: 11,
          color: '#9CA3AF',
        }}>
          <div>Powered by <strong>National e-Governance Division (NeGD)</strong> · MeitY, Government of India</div>
          <div style={{ marginTop: 2, color: '#F59E0B', fontWeight: 600 }}>
            DEMO PROTOTYPE — Not a real DigiLocker service
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function DigiLockerPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#1F3A8F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <DigiLockerContent />
    </Suspense>
  )
}
