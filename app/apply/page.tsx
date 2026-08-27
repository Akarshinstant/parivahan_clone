import Link from 'next/link'
import { Shield, CheckCircle, ChevronRight } from '@/components/Icons'

const DOCUMENTS = [
  { name: 'Identity proof', examples: 'Aadhaar card, PAN card, Voter ID, or Passport', required: true },
  { name: 'Address proof', examples: 'Utility bill (last 3 months), bank statement, or Aadhaar', required: true },
  { name: 'Passport-size photograph', examples: 'White background, taken within 6 months, face clearly visible', required: true },
  { name: 'Age proof', examples: 'Birth certificate or Class 10 marksheet', required: true },
  { name: 'Medical certificate', examples: 'Required only for commercial vehicle categories', required: false },
]

const STEPS = [
  'Verify identity with DigiLocker (mock)',
  'Fill application form — about 5 minutes',
  'Upload documents digitally',
  'Verify mobile number (OTP)',
  'Pay fee online — ₹250',
  'RTO officer reviews · 2–5 working days',
  'Book driving test slot',
  'Pass test · Licence issued same day',
]

export default function PrerequisitesPage() {
  return (
    <div className="py-6 space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1">
        <Link href="/" className="hover:text-gov-blue hover:underline">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">New Learner's Licence</span>
      </nav>

      {/* Hero */}
      <header>
        <h1 className="text-2xl font-bold text-gov-blue leading-tight">Apply for Learner's Licence</h1>
        <p className="text-gray-500 text-sm mt-1">
          Last updated: 1 August 2024 · Karnataka Motor Vehicles Act
        </p>
      </header>

      {/* Online notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-green-800 text-sm">This service can be completed fully online</div>
          <div className="text-green-700 text-xs mt-0.5">
            The <strong>only in-person requirement</strong> is your driving test. All paperwork, review, and fees are done digitally.
          </div>
        </div>
      </div>

      {/* Eligibility */}
      <section aria-labelledby="eligibility-heading" className="card">
        <h2 id="eligibility-heading" className="font-bold text-gray-900 mb-3">Eligibility</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Age 16+</strong> for motorcycles with engine up to 50cc</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Age 18+</strong> for all other motor vehicles (cars, motorcycles, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Resident of Karnataka (address proof required)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>No existing valid DL or pending suspension</span>
          </li>
        </ul>
      </section>

      {/* Fee */}
      <section aria-labelledby="fee-heading" className="card">
        <h2 id="fee-heading" className="font-bold text-gray-900 mb-3">Fees</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Learner's Licence application</span>
            <span className="font-medium">₹200</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Driving test slot fee</span>
            <span className="font-medium">₹50</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-gov-blue">₹250</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Pay online via UPI, debit/credit card, or net banking. <span className="badge-mock">MOCK — no real payment</span></p>
      </section>

      {/* Documents */}
      <section aria-labelledby="docs-heading" className="card">
        <h2 id="docs-heading" className="font-bold text-gray-900 mb-3">Documents to keep ready</h2>
        <ul className="space-y-3">
          {DOCUMENTS.map(d => (
            <li key={d.name} className="flex items-start gap-3 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${d.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`} aria-hidden="true">
                {d.required ? '!' : '?'}
              </div>
              <div>
                <div className="font-medium">{d.name} {!d.required && <span className="text-xs text-gray-400 font-normal">(if applicable)</span>}</div>
                <div className="text-gray-500 text-xs">{d.examples}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-4 bg-blue-50 rounded-lg p-2">
          💡 If you use DigiLocker login, your identity and address proof may be pre-filled automatically.
        </p>
      </section>

      {/* Process steps */}
      <section aria-labelledby="steps-heading" className="card">
        <h2 id="steps-heading" className="font-bold text-gray-900 mb-3">Process overview</h2>
        <ol className="space-y-2">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-gov-blue text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5" aria-hidden="true">
                {i + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <div className="bg-gov-blue text-white rounded-xl p-6 text-center space-y-4">
        <h2 className="font-bold text-xl">Ready to start?</h2>
        <p className="text-blue-200 text-sm">Takes about 5 minutes. You can save your progress and return anytime.</p>
        <Link
          href="/apply/form"
          className="inline-flex items-center gap-2 bg-gov-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-all focus-visible:ring-2 focus-visible:ring-white"
        >
          Start Application
          <ChevronRight className="w-5 h-5" />
        </Link>
        <p className="text-xs text-blue-300">
          <Shield className="w-3 h-3 inline mr-1" />
          Your data is encrypted and stored securely.
        </p>
      </div>
    </div>
  )
}
