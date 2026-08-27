import { backendFetch } from '@/lib/api'
import { cookies } from 'next/headers'
import { REJECTION_MESSAGES } from '@/lib/types'
import { notFound, redirect } from 'next/navigation'
import { OfficerReviewForm } from '@/components/OfficerReviewForm'
import Link from 'next/link'

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const role = cookieStore.get('role')?.value

  if (role !== 'officer') redirect('/officer')

  const data = await backendFetch<any>(`/api/officer/applications/${params.id}/review-data`)
  if (!data?.application) notFound()

  const { application: app, user, claimingOfficer, slotsWithTrack = [] } = data
  const officerId: string = data.currentOfficerId || 'off-001'
  const formData = app.form_data || {}
  const isMyApp = app.claimed_by === officerId

  const CHECKLIST = [
    { id: 'photo', label: 'Photo meets requirements (white background, clear face, recent)' },
    { id: 'id_proof', label: 'Identity proof is valid, readable, and matches name in form' },
    { id: 'address_proof', label: 'Address proof is current (within 3 months) and address matches' },
    { id: 'age_proof', label: 'Age proof confirms applicant meets minimum age requirement' },
    { id: 'form_complete', label: 'All form fields are complete and consistent' },
    { id: 'no_duplicate', label: 'No duplicate application found for this Aadhaar/DigiLocker ID' },
  ]

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-5">
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1">
        <Link href="/officer" className="hover:text-gov-blue hover:underline">Officer Queue</Link>
        <span>›</span>
        <span aria-current="page">Review {params.id}</span>
      </nav>

      <header className="card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs text-gray-500">Application under review</div>
            <div className="font-mono font-bold text-gov-blue text-lg">{params.id}</div>
            <div className="font-semibold text-gray-900">{user?.name || 'Unknown'}</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${isMyApp ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            {isMyApp ? '✓ Your claim' : `Claimed by ${claimingOfficer?.name || 'another officer'}`}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div><span className="text-gray-400">DOB:</span> {user?.dob}</div>
          <div><span className="text-gray-400">Phone:</span> {user?.phone}</div>
          <div><span className="text-gray-400">Vehicle:</span> {formData.vehicle_class}</div>
          <div><span className="text-gray-400">DigiLocker:</span> {formData.digilocker_verified ? '✓ Verified' : '✗ Not verified'}</div>
          <div className="col-span-2"><span className="text-gray-400">Aadhaar:</span> <span className="font-mono text-amber-700">{user?.aadhaar_mock} <span className="text-amber-500">[SYNTHETIC]</span></span></div>
          <div className="col-span-2"><span className="text-gray-400">Address:</span> {user?.address || formData.address}</div>
        </div>
      </header>

      <section className="card" aria-labelledby="docs-heading">
        <h2 id="docs-heading" className="font-bold text-gray-900 mb-3">Uploaded Documents</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Identity Proof', 'Address Proof', 'Photograph', 'Age Proof'].map(d => (
            <div key={d} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400 bg-gray-50">
              <div className="text-2xl mb-1" aria-hidden="true">📄</div>
              <div>{d}</div>
              <div className="badge-mock mx-auto mt-1">MOCK</div>
            </div>
          ))}
        </div>
      </section>

      {isMyApp ? (
        <OfficerReviewForm
          applicationId={params.id}
          officerId={officerId}
          checklist={CHECKLIST}
          rejectionCodes={Object.entries(REJECTION_MESSAGES).map(([k, v]) => ({ code: k, label: v.title }))}
          availableSlots={slotsWithTrack}
          currentStatus={app.status}
        />
      ) : (
        <div className="card bg-amber-50 border-amber-200 text-center py-6 space-y-2">
          <div className="text-2xl">⚠️</div>
          <div className="font-semibold text-amber-800">This application is claimed by {claimingOfficer?.name || 'another officer'}</div>
          <div className="text-sm text-amber-700">Only the claiming officer can review it. Return to the queue to find an unclaimed application.</div>
          <Link href="/officer" className="btn-secondary text-sm px-4 py-2 inline-block mt-2">← Back to Queue</Link>
        </div>
      )}
    </div>
  )
}
