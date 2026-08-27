import Link from 'next/link'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { appId?: string }
}) {
  const appId = searchParams.appId || 'app-015'
  const receiptId = `RTO-KA-${new Date().getFullYear()}-${appId.slice(-3).toUpperCase()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  return (
    <div className="py-6 max-w-xl mx-auto space-y-6">
      <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 text-center space-y-3">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl" aria-hidden="true">✅</div>
        <h1 className="text-2xl font-bold text-green-800">Application Submitted!</h1>
        <p className="text-green-700 text-sm">
          Your payment of <strong>₹250</strong> was received and your application is in the queue.
        </p>
      </div>

      <div className="card text-center space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Application Number</div>
        <div className="font-mono text-2xl font-bold text-gov-blue tracking-wider">{appId.toUpperCase()}</div>
        <div className="text-xs text-gray-400">Payment receipt: {receiptId}</div>
        <div className="badge-mock mx-auto">MOCK receipt</div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">What happens next?</h2>
        <ol className="space-y-3">
          {[
            { icon: '📋', step: 'An RTO officer from anywhere in Karnataka will review your application', time: 'Within 2–5 working days' },
            { icon: '📞', step: "You'll get an SMS when your application is assigned and approved", time: 'No action needed' },
            { icon: '🚗', step: 'After approval, book a driving test slot at any authorized track in Karnataka', time: 'Slots open statewide' },
            { icon: '🪪', step: "Pass your test — your digital Learner's Licence is issued the same day", time: 'Physical copy by post in 7 days' },
          ].map(({ icon, step, time }) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
              <div>
                <div className="text-gray-700">{step}</div>
                <div className="text-xs text-gov-green font-medium mt-0.5">⏱ {time}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
          <strong>No office visit required</strong> until your driving test. The test is the only in-person step.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/status/${appId}`} className="flex-1 btn-primary text-center py-3 block">
          Track Application Status →
        </Link>
        <Link href="/" className="flex-1 btn-secondary text-center py-3 block">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
