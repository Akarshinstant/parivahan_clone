import { connectDb, Application, Officer, AuditLog, FeedbackModel } from '@/lib/db'
import { cookies } from 'next/headers'
import { FEEDBACK_TYPE_LABELS, SEVERITY_COLORS } from '@/lib/types'
import type { FeedbackType, FeedbackSeverity } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminPage() {
  const cookieStore = cookies()
  const role = cookieStore.get('role')?.value
  if (role !== 'admin') {
    return (
      <div className="py-10 text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-gray-900">Admin Access Only</h1>
        <p className="text-gray-500 text-sm">Use the role switcher (top-right) to switch to Admin mode.</p>
      </div>
    )
  }

  await connectDb()

  const [total, submitted, processing, approved, rejected, issued] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ status: 'submitted' }),
    Application.countDocuments({ status: { $in: ['assigned', 'under_review'] } }),
    Application.countDocuments({ status: { $in: ['approved', 'test_scheduled', 'licence_issued'] } }),
    Application.countDocuments({ status: 'rejected' }),
    Application.countDocuments({ status: 'licence_issued' }),
  ])

  // Average processing time
  const reviewedApps = await Application.find({ reviewed_at: { $ne: null } }, { created_at: 1, reviewed_at: 1 }).lean() as any[]
  const avgHours = reviewedApps.length > 0
    ? reviewedApps.reduce((sum: number, a: any) => sum + (new Date(a.reviewed_at).getTime() - new Date(a.created_at).getTime()) / 3600000, 0) / reviewedApps.length
    : 0

  // Officer workload
  const officers = await Officer.find({}).lean() as any[]
  const officerWorkload = await Promise.all(officers.map(async (o: any) => {
    const reviewedByOfficer = await Application.find({ claimed_by: o._id, status: { $nin: ['submitted', 'assigned'] } }).lean() as any[]
    const approvedCount = reviewedByOfficer.filter((a: any) => ['approved', 'test_scheduled', 'licence_issued'].includes(a.status)).length
    const rejectedCount = reviewedByOfficer.filter((a: any) => a.status === 'rejected').length
    return { ...o, total_reviewed: reviewedByOfficer.length, approved: approvedCount, rejected: rejectedCount }
  }))
  officerWorkload.sort((a: any, b: any) => b.total_reviewed - a.total_reviewed)

  // Top rejection reasons
  const rejApps = await Application.find({ rejection_code: { $ne: null } }, { rejection_code: 1 }).lean() as any[]
  const rejCount: Record<string, number> = {}
  rejApps.forEach((a: any) => { rejCount[a.rejection_code] = (rejCount[a.rejection_code] || 0) + 1 })
  const rejectionReasons = Object.entries(rejCount).sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ rejection_code: code, count }))

  // Recent audit log
  const auditLog = await AuditLog.find({}).sort({ created_at: -1 }).limit(20).lean() as any[]

  // Stuck applications
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000)
  const stuckApps = await Application.find({ status: 'submitted', created_at: { $lt: threeDaysAgo } }).sort({ created_at: 1 }).lean() as any[]
  const { User } = await import('@/lib/db')
  const stuckUserIds = stuckApps.map((a: any) => a.user_id).filter(Boolean)
  const stuckUsers = await User.find({ _id: { $in: stuckUserIds } }, { _id: 1, name: 1 }).lean() as any[]
  const stuckUserMap = Object.fromEntries(stuckUsers.map((u: any) => [u._id, u.name]))
  const stuck = stuckApps.map((a: any) => ({ ...a, name: stuckUserMap[a.user_id as string] || 'Unknown' }))

  // Feedback submissions
  const feedbackItems = await FeedbackModel.find({}).sort({ created_at: -1 }).limit(30).lean() as any[]

  const serviceHealth = [
    { metric: 'Portal uptime (30d)', value: '99.7%', status: 'good' },
    { metric: 'Avg page load time', value: '1.2s', status: 'good' },
    { metric: 'Form completion rate', value: '78%', status: 'medium' },
    { metric: 'Accessibility score', value: 'WCAG 2.1 AA', status: 'good' },
    { metric: 'Payment success rate', value: '99.1%', status: 'good' },
    { metric: 'Avg time to first officer action', value: `${Math.round(avgHours)}h`, status: avgHours < 48 ? 'good' : 'medium' },
  ]

  const ACTION_LABELS: Record<string, string> = {
    application_submitted: 'Submitted', application_viewed: 'Viewed', application_claimed: 'Claimed',
    review_started: 'Review started', application_approved: 'Approved ✅', application_rejected: 'Rejected ❌',
    test_slot_assigned: 'Test slot assigned', licence_issued: 'Licence issued 🪪',
  }

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      <header>
        <div className="badge-info mb-1">Admin Dashboard</div>
        <h1 className="text-2xl font-bold text-gray-900">Operational Overview</h1>
        <p className="text-sm text-gray-500">Real-time data from the Karnataka RTO application system · MongoDB</p>
      </header>

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Applications', value: total, color: 'text-gray-900' },
            { label: 'In Queue', value: submitted, color: 'text-amber-700' },
            { label: 'Processing', value: processing, color: 'text-blue-700' },
            { label: 'Approved', value: approved, color: 'text-green-700' },
            { label: 'Rejected', value: rejected, color: 'text-red-700' },
            { label: 'Licences Issued', value: issued, color: 'text-purple-700' },
          ].map(m => (
            <div key={m.label} className="card text-center">
              <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="health-heading">
        <h2 id="health-heading" className="font-bold text-gray-900 mb-1">Service Health Scorecard</h2>
        <p className="text-xs text-gray-500 mb-3"><span className="badge-mock mr-1">SIMULATED</span>These are the kinds of metrics that would gate vendor payment/renewal under outcome-based procurement.</p>
        <div className="space-y-2">
          {serviceHealth.map(s => (
            <div key={s.metric} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">{s.metric}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{s.value}</span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'good' ? 'bg-green-500' : s.status === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} aria-label={`Status: ${s.status}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="workload-heading">
        <h2 id="workload-heading" className="font-bold text-gray-900 mb-3">Officer Workload Distribution</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Officer workload table">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Officer</th>
                <th className="pb-2 font-medium">District</th>
                <th className="pb-2 font-medium text-right">Reviewed</th>
                <th className="pb-2 font-medium text-right">Approved</th>
                <th className="pb-2 font-medium text-right">Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {officerWorkload.map((o: any) => (
                <tr key={o.employee_id}>
                  <td className="py-2.5"><div className="font-medium">{o.name}</div><div className="text-xs text-gray-400 font-mono">{o.employee_id}</div></td>
                  <td className="py-2.5 text-gray-600">{o.district}</td>
                  <td className="py-2.5 text-right font-semibold">{o.total_reviewed}</td>
                  <td className="py-2.5 text-right text-green-700">{o.approved}</td>
                  <td className="py-2.5 text-right text-red-700">{o.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {rejectionReasons.length > 0 && (
        <section className="card" aria-labelledby="rejection-heading">
          <h2 id="rejection-heading" className="font-bold text-gray-900 mb-3">Top Rejection Reasons</h2>
          <div className="space-y-2">
            {rejectionReasons.map((r: any) => (
              <div key={r.rejection_code} className="flex items-center gap-3">
                <div className="flex-1 text-sm text-gray-700">{r.rejection_code.replace(/_/g, ' ')}</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-red-200" style={{ width: `${Math.max(20, r.count * 30)}px` }} aria-hidden="true" />
                  <span className="text-sm font-semibold text-gray-900 w-6 text-right">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stuck.length > 0 && (
        <section className="card border-amber-200 bg-amber-50" aria-labelledby="stuck-heading">
          <h2 id="stuck-heading" className="font-bold text-amber-800 mb-3">⚠️ Applications Waiting &gt;3 Days ({stuck.length})</h2>
          <div className="space-y-2">
            {stuck.map((s: any) => (
              <div key={s._id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-gray-700">{s._id}</span>
                <span className="text-gray-600">{s.name}</span>
                <span className="text-amber-700 text-xs">{formatDate(s.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Feedback ──────────────────────────────────────────────────────── */}
      <section aria-labelledby="feedback-heading">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 id="feedback-heading" className="font-bold text-gray-900">User Feedback &amp; Bug Reports</h2>
            <p className="text-xs text-gray-500 mt-0.5">{feedbackItems.length} submission{feedbackItems.length !== 1 ? 's' : ''} · AI root-cause analysis · Linked to dummy Jira tickets</p>
          </div>
          <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-1 rounded font-semibold">
            {feedbackItems.filter((f: any) => f.status === 'open').length} Open
          </span>
        </div>

        {feedbackItems.length === 0 ? (
          <div className="card text-center py-10 text-gray-400 text-sm">
            No feedback submitted yet. The floating "Feedback" button on every page lets citizens report issues.
          </div>
        ) : (
          <div className="space-y-4">
            {feedbackItems.map((item: any) => {
              const analysis = item.ai_analysis
              const severityClass = analysis?.severity
                ? SEVERITY_COLORS[analysis.severity as FeedbackSeverity]
                : 'text-gray-600 bg-gray-50 border-gray-200'
              return (
                <div key={item._id} className="card border border-gray-200 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                          item.status === 'open'        ? 'bg-red-50 text-red-700 border-red-200' :
                          item.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {item.status === 'open' ? '🔴 Open' : item.status === 'in_progress' ? '🟡 In Progress' : '🟢 Resolved'}
                        </span>
                        {analysis?.severity && (
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${severityClass}`}>
                            {analysis.severity}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{FEEDBACK_TYPE_LABELS[item.type as FeedbackType] || item.type}</span>
                        <span>·</span>
                        <span className="font-mono text-gray-400">{item.page_url || '/'}</span>
                        <span>·</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    {/* Jira ticket badge */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                        {item.jira_ticket_id}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Jira ticket</div>
                    </div>
                  </div>

                  {/* User description */}
                  <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-3">{item.description}</p>

                  {/* AI Analysis */}
                  {analysis && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">🤖 AI Root-Cause Analysis</span>
                        {analysis.category && (
                          <span className="text-xs text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">{analysis.category}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-0.5">Root Cause</div>
                          <div className="text-gray-700">{analysis.root_cause}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-0.5">Journey Impact</div>
                          <div className="text-gray-700">{analysis.user_journey_impact}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] mb-0.5">Suggested Fix</div>
                          <div className="text-gray-700">{analysis.suggested_fix}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!analysis && (
                    <p className="text-xs text-gray-400 italic">AI analysis not available (OpenRouter key not set — offline mode)</p>
                  )}

                  {/* Dummy Jira link */}
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                    <a
                      href={`#jira-${item.jira_ticket_id}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                      aria-label={`View dummy Jira ticket ${item.jira_ticket_id}`}
                    >
                      🔗 View {item.jira_ticket_id} in Jira (mock)
                    </a>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">Reported by: {item.user_role || 'anonymous'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="audit-heading">
        <h2 id="audit-heading" className="font-bold text-gray-900 mb-1">Audit Log (Internal — Full Record)</h2>
        <p className="text-xs text-gray-500 mb-3">Append-only · Officer names visible internally · Anonymized version shown to citizens</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Audit log">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-200">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Application</th>
                <th className="pb-2 font-medium">Action</th>
                <th className="pb-2 font-medium">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditLog.map((entry: any) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-400 whitespace-nowrap">{formatDate(entry.created_at)}</td>
                  <td className="py-2 font-mono text-blue-700">{entry.application_id}</td>
                  <td className="py-2 font-medium">{ACTION_LABELS[entry.action] || entry.action}</td>
                  <td className="py-2 text-gray-600">{entry.actor_name || entry.actor_type}{entry.district && <span className="text-gray-400"> · {entry.district}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
