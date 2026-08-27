'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { applicationId: string; officerId: string }

export function OfficerClaimButton({ applicationId, officerId }: Props) {
  const [state, setstate] = useState<'idle' | 'loading' | 'claimed' | 'raced'>('idle')
  const router = useRouter()

  async function claim() {
    setstate('loading')
    const res = await fetch('/api/officer/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, officerId }),
    })
    const data = await res.json()
    if (data.success) {
      setstate('claimed')
      setTimeout(() => router.push(`/officer/review/${applicationId}`), 800)
    } else {
      setstate('raced')
    }
    router.refresh()
  }

  if (state === 'claimed') {
    return <div className="badge-verified flex-shrink-0 text-xs">✓ Claimed!</div>
  }

  if (state === 'raced') {
    return (
      <div className="flex-shrink-0 text-center">
        <div className="text-xs text-red-600 font-medium">⚡ Race lost!</div>
        <div className="text-xs text-gray-400">Another officer got it</div>
      </div>
    )
  }

  return (
    <button
      onClick={claim}
      disabled={state === 'loading'}
      className="flex-shrink-0 bg-gov-blue text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50"
      aria-label={`Claim application ${applicationId} for review`}
    >
      {state === 'loading' ? 'Claiming...' : 'Claim →'}
    </button>
  )
}
