import { backendFetch } from '@/lib/api'

export async function QueueIndicator() {
  const result = await backendFetch<{ pending: number }>('/api/queue-count')
  const pending = result?.pending ?? 0

  const estHours = Math.max(1, Math.round(pending * 0.3))
  const urgency = pending > 15 ? 'high' : pending > 8 ? 'medium' : 'low'

  const colors = {
    low: 'bg-green-50 border-green-200 text-green-800',
    medium: 'bg-amber-50 border-amber-200 text-amber-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
  }

  return (
    <aside
      className={`rounded-xl border p-4 ${colors[urgency]}`}
      role="status"
      aria-label="Current queue status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0" aria-hidden="true">
          {urgency === 'low' ? '🟢' : urgency === 'medium' ? '🟡' : '🟠'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            Current wait: ~{estHours} {estHours === 1 ? 'hour' : 'hours'} · {pending} applications in queue
          </div>
          <div className="text-xs mt-1 opacity-80">
            You can save your form and return anytime — your progress won't be lost.
            Processing is handled by officers across all of Karnataka.
          </div>
        </div>
      </div>
    </aside>
  )
}
