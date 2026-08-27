'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Slot = { id: string; slot_date: string; slot_time: string; track_name: string; district: string; address: string }

type Props = {
  applicationId: string
  officerId: string
  checklist: { id: string; label: string }[]
  rejectionCodes: { code: string; label: string }[]
  availableSlots: Slot[]
  currentStatus: string
}

export function OfficerReviewForm({ applicationId, officerId, checklist, rejectionCodes, availableSlots, currentStatus }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [rejCode, setRejCode] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null)
  const router = useRouter()

  const allChecked = checklist.every(c => checked[c.id])

  async function submit() {
    if (!decision) return
    if (decision === 'reject' && !rejCode) { alert('Please select a rejection reason code'); return }
    if (decision === 'approve' && !selectedSlot) { alert('Please assign a test slot'); return }

    setSubmitting(true)
    const res = await fetch('/api/officer/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId, officerId, decision, rejectionCode: rejCode, notes, slotId: selectedSlot,
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (data.success) {
      setResult(decision === 'approve' ? 'approved' : 'rejected')
      setTimeout(() => router.push('/officer'), 2000)
    }
  }

  if (result) {
    return (
      <div className="card text-center py-8 space-y-3">
        <div className="text-4xl">{result === 'approved' ? '✅' : '❌'}</div>
        <div className="text-xl font-bold text-gray-900">
          Application {result === 'approved' ? 'Approved' : 'Rejected'}
        </div>
        <div className="text-sm text-gray-500">Audit log updated · Citizen notified · Returning to queue...</div>
      </div>
    )
  }

  if (currentStatus !== 'assigned' && currentStatus !== 'under_review') {
    return (
      <div className="card bg-green-50 border-green-200 text-center py-6 space-y-2">
        <div className="text-2xl">✅</div>
        <div className="font-semibold text-green-800">Already {currentStatus.replace('_', ' ')}</div>
        <div className="text-sm text-green-700">This application has already been processed.</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Checklist */}
      <section className="card" aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className="font-bold text-gray-900 mb-3">
          Verification Checklist
          {allChecked && <span className="ml-2 badge-verified text-xs">All verified</span>}
        </h2>
        <fieldset>
          <legend className="sr-only">Document verification checklist</legend>
          <div className="space-y-3">
            {checklist.map(item => (
              <label key={item.id} className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${checked[item.id] ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="checkbox"
                  checked={checked[item.id] || false}
                  onChange={e => setChecked(c => ({ ...c, [item.id]: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 accent-gov-green flex-shrink-0"
                  aria-label={item.label}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Decision */}
      <section className="card" aria-labelledby="decision-heading">
        <h2 id="decision-heading" className="font-bold text-gray-900 mb-3">Decision</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setDecision('approve')}
            className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${decision === 'approve' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}
            aria-pressed={decision === 'approve'}
          >
            ✅ Approve
          </button>
          <button
            onClick={() => setDecision('reject')}
            className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${decision === 'reject' ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
            aria-pressed={decision === 'reject'}
          >
            ❌ Reject
          </button>
        </div>

        {decision === 'reject' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="rej-code" className="block text-sm font-medium text-gray-700 mb-1">
                Rejection reason <span className="text-red-500">*</span>
              </label>
              <select
                id="rej-code"
                value={rejCode}
                onChange={e => setRejCode(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a specific reason...</option>
                {rejectionCodes.map(r => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">This exact reason is shown to the citizen with specific correction instructions.</p>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional notes (internal)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field min-h-[60px] resize-none text-sm"
                placeholder="Internal notes for audit log (not shown to citizen)..."
              />
            </div>
          </div>
        )}

        {decision === 'approve' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-1">
                Assign driving test slot <span className="text-red-500">*</span>
              </label>
              <select
                id="slot"
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a slot at any track in Karnataka...</option>
                {availableSlots.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.slot_date} {s.slot_time} — {s.track_name} ({s.district})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Any track statewide — citizen can travel to whichever suits them.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Submit */}
      {decision && (
        <button
          onClick={submit}
          disabled={submitting || (decision === 'approve' && !selectedSlot) || (decision === 'reject' && !rejCode)}
          className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
            decision === 'approve' ? 'bg-gov-green text-white hover:bg-green-700 disabled:opacity-50' :
            'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
          }`}
          aria-label={decision === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
        >
          {submitting ? 'Submitting...' :
           decision === 'approve' ? '✅ Confirm Approval & Assign Test Slot' :
           '❌ Confirm Rejection'}
        </button>
      )}
    </div>
  )
}
