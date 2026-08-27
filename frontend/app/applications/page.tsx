import { backendFetch } from '@/lib/api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  submitted:     { bg: '#FFF7ED', text: '#B45309', label: 'Submitted' },
  assigned:      { bg: '#EFF6FF', text: '#1D4ED8', label: 'With RTO Officer' },
  under_review:  { bg: '#EFF6FF', text: '#1D4ED8', label: 'Under Review' },
  approved:      { bg: '#F0FDF4', text: '#166534', label: 'Approved' },
  rejected:      { bg: '#FEF2F2', text: '#B91C1C', label: 'Rejected' },
  test_scheduled:{ bg: '#EFF6FF', text: '#1D4ED8', label: 'Test Scheduled' },
  licence_issued:{ bg: '#F0FDF4', text: '#166534', label: 'Licence Issued' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default async function ApplicationsPage() {
  const cookieStore = cookies()
  const userId = cookieStore.get('userId')?.value
  const role = cookieStore.get('role')?.value

  if (!userId || !role) {
    redirect('/login?redirect_to=/applications')
  }

  if (role !== 'citizen') {
    // Officers/admins have their own portals
    redirect(role === 'officer' ? '/officer' : '/admin')
  }

  const result = await backendFetch<{ applications: any[] }>('/api/applications/my')
  const applications: any[] = result?.applications ?? []

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1 mb-4">
        <Link href="/" className="hover:text-gov-blue hover:underline">Home</Link>
        <span>›</span>
        <span aria-current="page">My Applications</span>
      </nav>

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gov-blue">My Applications</h1>
        <Link href="/apply" className="btn-primary text-sm py-2 px-4">
          + New Application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div className="text-5xl">📋</div>
          <div className="font-semibold text-gray-700">No applications yet</div>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            You haven't submitted any Learner's Licence applications. Start your application now.
          </p>
          <Link href="/apply" className="btn-primary inline-block mt-2">
            Apply for Learner's Licence →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => {
            const statusInfo = STATUS_COLORS[app.status] || STATUS_COLORS.submitted
            return (
              <Link
                key={app._id}
                href={`/status/${app._id}`}
                className="card block hover:border-gov-blue transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-bold text-gov-blue text-sm">
                      {String(app._id).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Submitted {formatDate(app.created_at)}
                      {app.form_data?.vehicle_class && (
                        <span className="ml-2 text-gray-400">· {app.form_data.vehicle_class}</span>
                      )}
                    </div>
                    {app.rejection_reason && (
                      <div className="text-xs text-red-600 mt-1 truncate">
                        Reason: {app.rejection_reason}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span style={{
                      background: statusInfo.bg,
                      color: statusInfo.text,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                    }}>
                      {statusInfo.label}
                    </span>
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>

                {app.status === 'rejected' && (
                  <div className="mt-3 text-xs bg-red-50 border border-red-100 rounded px-3 py-2 text-red-700">
                    ⚠ Your application was rejected. Click to see details and resubmit.
                  </div>
                )}
                {app.status === 'test_scheduled' && (
                  <div className="mt-3 text-xs bg-blue-50 border border-blue-100 rounded px-3 py-2 text-blue-700">
                    📅 Driving test scheduled — click to see date, time, and location.
                  </div>
                )}
                {app.status === 'licence_issued' && (
                  <div className="mt-3 text-xs bg-green-50 border border-green-100 rounded px-3 py-2 text-green-700">
                    🎉 Licence issued! Download from DigiLocker.
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 text-center">
        Showing {applications.length} application{applications.length !== 1 ? 's' : ''} for your account
      </div>
    </div>
  )
}
