'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PaymentContent() {
  const params = useSearchParams()
  const appId = params.get('appId') || ''
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [loading, setLoading] = useState(false)
  const [showReconciliation, setShowReconciliation] = useState(false)
  const [paid, setPaid] = useState(false)
  const router = useRouter()

  async function pay() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setPaid(true)
    await new Promise(r => setTimeout(r, 500))
    router.push(`/apply/confirmation?appId=${appId}`)
  }

  async function simulatePartialFailure() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setShowReconciliation(true)
  }

  async function reconcile() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setPaid(true)
    await new Promise(r => setTimeout(r, 500))
    router.push(`/apply/confirmation?appId=${appId}`)
  }

  if (paid) {
    return (
      <div className="py-10 text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">💳</div>
        <h1 className="text-xl font-bold text-green-700">Payment Successful!</h1>
        <p className="text-gray-500 text-sm">Confirming your application...</p>
      </div>
    )
  }

  return (
    <div className="py-6 max-w-sm mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gov-blue">Pay Application Fee</h1>
      <div className="badge-mock">MOCK — No real payment processed</div>

      {showReconciliation ? (
        <div className="card space-y-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">⚠️</div>
            <div>
              <h2 className="font-bold text-amber-800">Payment debited — status updating</h2>
              <p className="text-sm text-amber-700 mt-1">
                ₹250 was deducted from your account but the application status hasn't updated yet. This is a known reconciliation delay.
              </p>
              <p className="text-sm text-amber-800 font-medium mt-2">
                Your money is safe. We are auto-reconciling this payment now.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-xs space-y-1 font-mono">
            <div>Bank Ref: HDFC-MOCK-{Date.now().toString().slice(-8)}</div>
            <div>Amount: ₹250.00</div>
            <div className="text-amber-600">Status: Pending reconciliation...</div>
          </div>
          <button
            onClick={reconcile}
            disabled={loading}
            className="w-full btn-orange py-3"
          >
            {loading ? '🔄 Reconciling...' : '✓ Confirm Payment & Continue'}
          </button>
          <p className="text-xs text-center text-gray-500">
            This resolves automatically within 5 minutes. You don't need to pay again.
          </p>
        </div>
      ) : (
        <>
          <div className="card space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Learner's Licence application</span>
              <span className="font-medium">₹200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Driving test slot fee</span>
              <span className="font-medium">₹50</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-gov-blue">₹250</span>
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm">Payment method</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['upi', 'card', 'netbanking'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-lg text-xs font-medium border-2 transition-all ${method === m ? 'border-gov-blue bg-blue-50 text-gov-blue' : 'border-gray-200 text-gray-600'}`}
                  aria-pressed={method === m}
                >
                  {m === 'upi' ? '📱 UPI' : m === 'card' ? '💳 Card' : '🏦 Net Banking'}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div>
                <label htmlFor="upi-id" className="block text-xs text-gray-600 mb-1">UPI ID</label>
                <input id="upi-id" type="text" className="input-field" placeholder="yourname@upi" defaultValue="demo@mock" readOnly />
              </div>
            )}

            <button onClick={pay} disabled={loading} className="w-full btn-primary py-3">
              {loading ? '⏳ Processing...' : `Pay ₹250`}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={simulatePartialFailure}
              className="text-xs text-gray-400 hover:text-amber-600 hover:underline"
            >
              🔧 Demo: Simulate payment deducted but status not updated
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-gray-400">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
