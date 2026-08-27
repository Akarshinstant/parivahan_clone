import { ApplicationStatus, STATUS_ORDER, STATUS_LABELS } from '@/lib/types'
import { CheckCircle, Circle, Clock, AlertCircle } from './Icons'

type Props = {
  status: ApplicationStatus
  rejectionCode?: string | null
}

export function StatusStepper({ status, rejectionCode }: Props) {
  const isRejected = status === 'rejected'
  const steps = isRejected
    ? [...STATUS_ORDER.slice(0, 3), 'rejected' as ApplicationStatus]
    : STATUS_ORDER

  const currentIdx = isRejected ? 3 : STATUS_ORDER.indexOf(status)

  return (
    <ol className="relative" aria-label="Application progress">
      {steps.map((step, i) => {
        const isDone = i < currentIdx
        const isCurrent = i === currentIdx
        const isPending = i > currentIdx
        const isRej = step === 'rejected'

        return (
          <li key={step} className="flex gap-4 pb-6 last:pb-0">
            {/* Line connector */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  isRej && isCurrent ? 'bg-red-100 text-red-600 ring-2 ring-red-300' :
                  isDone ? 'bg-green-100 text-green-700' :
                  isCurrent ? 'bg-blue-100 text-gov-blue ring-2 ring-blue-300' :
                  'bg-gray-100 text-gray-400'
                }`}
                aria-hidden="true"
              >
                {isDone ? '✓' : isRej && isCurrent ? '✕' : isCurrent ? '●' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} aria-hidden="true" />
              )}
            </div>

            <div className="pt-1 flex-1 min-w-0">
              <div
                className={`text-sm font-semibold ${
                  isRej && isCurrent ? 'text-red-700' :
                  isDone ? 'text-green-700' :
                  isCurrent ? 'text-gov-blue' :
                  'text-gray-400'
                }`}
              >
                {step === 'assigned' ? 'Verified by RTO Officer — Karnataka' : STATUS_LABELS[step]}
                {isCurrent && !isRej && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              {isRej && isCurrent && rejectionCode && (
                <div className="text-xs text-red-600 mt-0.5">See details below</div>
              )}
              {isDone && (
                <div className="text-xs text-gray-500 mt-0.5">Completed</div>
              )}
              {isPending && !isRej && (
                <div className="text-xs text-gray-400 mt-0.5">Upcoming</div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
