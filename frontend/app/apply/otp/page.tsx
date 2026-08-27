'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function OTPContent() {
  const params = useSearchParams()
  const appId = params.get('appId') || ''
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [phase, setPhase] = useState<'otp' | 'recovery' | 'verified'>('otp')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => { refs.current[0]?.focus() }, [])

  function handleDigit(i: number, v: string) {
    if (!/^\d?$/.test(v)) return
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  async function verify() {
    const code = digits.join('')
    if (code.length < 6) { setError('Please enter all 6 digits'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    // Accept any 6-digit code for demo
    setPhase('verified')
    setLoading(false)
    setTimeout(() => router.push(`/apply/payment?appId=${appId}`), 1200)
  }

  function resend() {
    setResendCount(c => c + 1)
    setDigits(['', '', '', '', '', ''])
    setError('')
    refs.current[0]?.focus()
  }

  if (phase === 'verified') {
    return (
      <div className="py-10 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
        <h1 className="text-xl font-bold text-green-700">Number Verified!</h1>
        <p className="text-gray-500 text-sm">Redirecting to payment...</p>
      </div>
    )
  }

  return (
    <div className="py-6 max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gov-blue">Verify Your Number</h1>

      {phase === 'otp' && (
        <>
          <div className="card space-y-4">
            <p className="text-sm text-gray-600">
              We sent a 6-digit OTP to your mobile number.{' '}
              <span className="badge-mock">MOCK — any 6 digits work</span>
            </p>

            <div className="flex gap-2 justify-center" role="group" aria-label="Enter 6-digit OTP">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { refs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:border-gov-blue outline-none transition-all"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {error && <p className="text-red-600 text-sm text-center" role="alert">{error}</p>}

            <button
              onClick={verify}
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center space-y-2 text-sm">
              {resendCount < 2 ? (
                <button onClick={resend} className="text-gov-blue hover:underline">
                  Resend OTP
                </button>
              ) : (
                <div className="text-amber-600 text-xs">
                  OTP resent {resendCount} times. Still not receiving it?
                </div>
              )}
              <div>
                <button
                  onClick={() => setPhase('recovery')}
                  className="text-gray-500 hover:text-gov-blue hover:underline text-xs"
                >
                  Didn't receive it? Try another way →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 'recovery' && (
        <div className="card space-y-4">
          <div className="text-amber-600 font-semibold text-sm">⚠️ OTP Recovery</div>
          <p className="text-sm text-gray-600">
            Can't receive OTP on your registered number? Choose an alternative:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setPhase('otp')}
              className="w-full border-2 border-gov-blue text-gov-blue text-sm font-medium py-3 rounded-xl hover:bg-blue-50 transition-all text-left px-4 flex items-center gap-3"
            >
              <span className="text-xl">📱</span>
              <div>
                <div className="font-semibold">Use a different mobile number</div>
                <div className="text-xs text-gray-500">Add an alternate number temporarily</div>
              </div>
            </button>
            <button
              onClick={() => {
                // Skip OTP via DigiLocker verification
                setPhase('verified')
                setTimeout(() => router.push(`/apply/payment?appId=${appId}`), 1200)
              }}
              className="w-full border-2 border-gov-blue text-gov-blue text-sm font-medium py-3 rounded-xl hover:bg-blue-50 transition-all text-left px-4 flex items-center gap-3"
            >
              <span className="text-xl">🏛️</span>
              <div>
                <div className="font-semibold">Verify via DigiLocker instead</div>
                <div className="text-xs text-gray-500">Your DigiLocker login confirms your identity</div>
              </div>
            </button>
          </div>
          <button onClick={() => setPhase('otp')} className="w-full text-xs text-gray-400 hover:underline">
            ← Back to OTP entry
          </button>
          <div className="badge-mock mx-auto w-fit">MOCK — Recovery flow simulated</div>
        </div>
      )}
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-gray-400">Loading...</div>}>
      <OTPContent />
    </Suspense>
  )
}
