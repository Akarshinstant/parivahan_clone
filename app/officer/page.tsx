import { connectDb, Application, Officer } from '@/lib/db'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { OfficerClaimButton } from '@/components/OfficerClaimButton'

function formatAge(iso: string) {
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 3600000)
  if (h < 1) return 'Just submitted'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default async function OfficerQueuePage() {
  const cookieStore = cookies()
  const role = cookieStore.get('role')?.value
  const officerId = cookieStore.get('officerId')?.value || 'off-001'

  if (role !== 'officer') {
    return (
      <div className="py-10 text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-gray-900">Officer Access Only</h1>
        <p className="text-gray-500 text-sm">Use the role switcher (top-right) to switch to Officer mode.</p>
      </div>
    )
  }

  await connectDb()
  const officer = await Officer.findOne({ _id: officerId })

  const queueApps = await Application.find({ status: 'submitted' }).sort({ created_at: 1 }).lean()
  const myClaimsApps = await Application.find({ claimed_by: officerId, status: { $in: ['assigned', 'under_review'] } }).sort({ claimed_at: -1 }).lean()
  const allClaimingCount = await Application.countDocuments({ status: { $in: ['assigned', 'under_review'] } })

  // Populate applicant names
  const { User } = await import('@/lib/db')
  const userIds = Array.from(new Set([...queueApps.map(a => a.user_id), ...myClaimsApps.map(a => a.user_id)].filter(Boolean)))
  const users = await User.find({ _id: { $in: userIds } }).lean()
  const userMap = Object.fromEntries(users.map(u => [u._id, u]))

  const queue = queueApps.map(a => ({ ...a, applicant_name: userMap[a.user_id as string]?.name || 'Unknown', dob: userMap[a.user_id as string]?.dob }))
  const myClaims = myClaimsApps.map(a => ({ ...a, applicant_name: userMap[a.user_id as string]?.name || 'Unknown' }))

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6">
      <header className="card bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="badge-info mb-1">Officer Portal</div>
            <h1 className="text-xl font-bold text-gov-blue">{officer?.name}</h1>
            <div className="text-sm text-gray-600">
              ID: <span className="font-mono">{officer?.employee_id}</span> · {officer?.district}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Statewide queue</div>
            <div className="text-3xl font-bold text-gov-blue">{queue.length}</div>
            <div className="text-xs text-gray-500">pending review</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="bg-white rounded-lg p-2">
            <div className="font-bold text-gray-900">{queue.length}</div>
            <div className="text-xs text-gray-500">Unclaimed</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="font-bold text-gov-blue">{myClaims.length}</div>
            <div className="text-xs text-gray-500">My active</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="font-bold text-gray-900">{allClaimingCount}</div>
            <div className="text-xs text-gray-500">All officers</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
          📡 This is a <strong>shared statewide queue</strong>. Any officer in Karnataka can claim any application.
          First click wins — this prevents double-processing.{' '}
          <span className="font-medium">Open two tabs to see the race condition demo.</span>
        </div>
      </header>

      {myClaims.length > 0 && (
        <section aria-labelledby="my-claims-heading">
          <h2 id="my-claims-heading" className="text-base font-bold text-gray-900 mb-3">My Active Claims</h2>
          <div className="space-y-3">
            {myClaims.map((app: any) => (
              <Link
                key={app._id}
                href={`/officer/review/${app._id}`}
                className="card flex items-center gap-4 hover:shadow-md hover:border-gov-blue/30 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{app.applicant_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.status === 'under_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">{app._id}</div>
                </div>
                <div className="text-xs text-gov-blue font-semibold group-hover:underline flex-shrink-0">Review →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading" className="text-base font-bold text-gray-900 mb-3">
          Statewide Queue — {queue.length} pending
        </h2>

        {queue.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✨</div>
            <div className="font-medium">Queue is clear!</div>
            <div className="text-sm">All applications have been claimed or processed.</div>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Applications awaiting review">
            {queue.map((app: any) => {
              const age = formatAge(app.created_at)
              const isOld = (Date.now() - new Date(app.created_at).getTime()) > 3 * 24 * 3600 * 1000
              const fd = app.form_data || {}
              return (
                <div key={app._id} className="card" role="listitem">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{app.applicant_name}</span>
                        {isOld ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Waiting {age}</span>
                        ) : (
                          <span className="text-xs text-gray-400">{age}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="font-mono">{app._id}</span>
                        {app.dob && ` · DOB: ${app.dob}`}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Vehicle: {fd.vehicle_class || 'LMV'} · DigiLocker: {fd.digilocker_verified ? '✓' : '✗'}
                      </div>
                    </div>
                    <OfficerClaimButton applicationId={app._id} officerId={officerId} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
