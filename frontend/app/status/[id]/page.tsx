import { backendFetch } from '@/lib/api'
import { REJECTION_MESSAGES } from '@/lib/types'
import { StatusStepper } from '@/components/StatusStepper'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ACTION_LABELS: Record<string, string> = {
  application_submitted: 'Application received',
  application_viewed: 'Application opened by an officer',
  application_claimed: 'Assigned for review',
  review_started: 'Documents under review',
  application_approved: 'Application approved',
  application_rejected: 'Application rejected (see below)',
  test_slot_assigned: 'Driving test slot allocated',
  licence_issued: "Learner's Licence issued",
}

export default async function StatusPage({ params }: { params: { id: string } }) {
  const data = await backendFetch<any>(`/api/applications/${params.id}/detail`)
  if (!data?.application) notFound()

  const { application: app, user, slot, track, audit = [] } = data
  const formData = app.form_data || {}
  const rejMsg = app.rejection_code ? REJECTION_MESSAGES[app.rejection_code as keyof typeof REJECTION_MESSAGES] : null

  const nextAction = (() => {
    switch (app.status) {
      case 'submitted': return 'Your application is in queue. No action needed until an officer reviews it.'
      case 'assigned': return 'An RTO officer is reviewing your documents. No action needed.'
      case 'under_review': return 'Documents are being verified. No action needed.'
      case 'approved': return 'Your application is approved! Your driving test slot will be assigned shortly.'
      case 'rejected': return 'Your application was rejected. See details and resubmit below.'
      case 'test_scheduled': return slot ? `Your driving test is booked. Visit ${track?.name} on ${slot.slot_date} at ${slot.slot_time}.` : 'Driving test slot assigned.'
      case 'licence_issued': return "Your Learner's Licence has been issued. Download it from DigiLocker."
    }
  })()

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1">
        <Link href="/" className="hover:text-gov-blue hover:underline">Home</Link>
        <span>›</span>
        <span aria-current="page">Application Status</span>
      </nav>

      <header className="card space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Application</div>
            <div className="font-mono font-bold text-gov-blue text-lg">{params.id.toUpperCase()}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            app.status === 'approved' || app.status === 'licence_issued' ? 'bg-green-100 text-green-800' :
            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
            app.status === 'test_scheduled' ? 'bg-blue-100 text-blue-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {app.status === 'assigned' ? 'With RTO Officer' : app.status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
        {user?.name && (
          <div className="text-sm text-gray-600">Applicant: <span className="font-medium">{user.name}</span></div>
        )}
        <div className="text-xs text-gray-400">Submitted: {formatDate(app.created_at)}</div>
      </header>

      <div
        className={`rounded-xl p-4 text-sm ${
          app.status === 'rejected' ? 'bg-red-50 border border-red-200' :
          app.status === 'approved' ? 'bg-green-50 border border-green-200' :
          'bg-blue-50 border border-blue-200'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="font-semibold mb-1 text-gray-900">
          {app.status === 'rejected' ? '⚠️ Action required' :
           app.status === 'approved' ? '🎉 Next step:' : '📋 Current status:'}
        </div>
        <div className="text-gray-700">{nextAction}</div>
      </div>

      {app.status === 'rejected' && rejMsg && (
        <div className="card border-red-200 bg-red-50 space-y-3">
          <h2 className="font-bold text-red-800">Why your application was rejected</h2>
          <div className="bg-white rounded-lg p-3 text-sm space-y-1">
            <div className="font-semibold text-red-700">{rejMsg.title}</div>
            <div className="text-gray-700 mt-1"><strong>How to fix it:</strong> {rejMsg.fix}</div>
          </div>
          <Link href="/apply/form" className="block w-full btn-primary text-center py-3">
            Resubmit Application →
          </Link>
        </div>
      )}

      {app.status === 'test_scheduled' && slot && track && (
        <div className="card border-blue-200 bg-blue-50 space-y-2">
          <h2 className="font-bold text-blue-900">Driving Test Details</h2>
          <div className="text-sm space-y-1">
            <div>📍 <strong>{track.name}</strong></div>
            <div className="text-gray-600 ml-6">{track.address}</div>
            <div>📅 <strong>{new Date(slot.slot_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            <div>⏰ <strong>{slot.slot_time}</strong></div>
          </div>
          <div className="text-xs bg-white rounded-lg p-2 text-blue-700">
            Bring your original identity documents. Arrive 15 minutes early.
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Application Progress</h2>
        <StatusStepper status={app.status} rejectionCode={app.rejection_code} />
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-1">Activity Timeline</h2>
        <p className="text-xs text-gray-500 mb-4">Real-time activity log · Officer identity is anonymized for privacy</p>
        {audit.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ol className="relative border-l border-gray-200 ml-3 space-y-4" aria-label="Application timeline">
            {(audit as any[]).map((entry: any) => (
              <li key={entry._id} className="ml-4">
                <div className="absolute w-3 h-3 bg-gov-blue rounded-full -left-1.5 border-2 border-white" aria-hidden="true" />
                <div className="text-sm font-medium text-gray-900">{ACTION_LABELS[entry.action] || entry.action}</div>
                {entry.actor_type === 'officer' && <div className="text-xs text-gray-500">By RTO Officer — Karnataka</div>}
                {entry.actor_type === 'system' && <div className="text-xs text-gray-500">Automated system</div>}
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(entry.created_at)}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {(app.status === 'approved' || app.status === 'test_scheduled' || app.status === 'licence_issued') && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0" aria-hidden="true">🛡️</span>
          <div>
            <div className="font-semibold">Verified by RTO Officer — Karnataka</div>
            <div className="text-xs text-green-700 mt-0.5">
              Your documents were reviewed by an authorized RTO officer from the Karnataka statewide pool.
              Officer identity is kept internal for privacy.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
