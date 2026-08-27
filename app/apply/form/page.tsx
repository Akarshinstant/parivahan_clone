'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type FormState = {
  name: string
  dob: string
  phone: string
  email: string
  vehicle_class: string
  address: string
  pincode: string
  id_proof_type: string
  address_proof_type: string
  digilocker_verified: boolean
  digilocker_id: string
}

const INITIAL: FormState = {
  name: '', dob: '', phone: '', email: '',
  vehicle_class: 'LMV', address: '', pincode: '',
  id_proof_type: 'aadhaar', address_proof_type: 'utility_bill',
  digilocker_verified: false, digilocker_id: '',
}

const TOTAL_STEPS = 5

export default function FormPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)
  const [digilockerRedirecting, setDigilockerRedirecting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Load saved draft on mount; after draft loads, pre-fill from DigiLocker SSO if returning from sign-in
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromDigiLocker = params.get('digilocker_done') === '1'

    // Load draft first, then optionally overlay DigiLocker identity data on top
    fetch('/api/draft')
      .then(r => r.json())
      .then(async data => {
        if (data.form_data) {
          setForm(f => ({ ...f, ...data.form_data }))
          setStep(data.step || 1)
        }
        if (fromDigiLocker) {
          const auth = await fetch('/auth/status').then(r => r.json()).catch(() => null)
          if (auth?.authenticated && auth.user?.role === 'citizen') {
            const u = auth.user
            setForm(f => ({
              ...f,
              name: u.name || f.name,
              dob: u.dob || f.dob,
              phone: u.phone || f.phone,
              email: u.email || f.email,
              digilocker_verified: true,
              digilocker_id: `MOCK-DL-${Date.now().toString(36).slice(-6).toUpperCase()}`,
            }))
            setStep(2) // DigiLocker done — skip to personal details
            window.history.replaceState({}, '', '/apply/form')
          }
        }
      })
      .catch(() => {})
  }, [])

  // Auto-save draft
  useEffect(() => {
    const t = setTimeout(() => {
      setSaving(true)
      fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: form, step }),
      }).finally(() => setSaving(false))
    }, 1000)
    return () => clearTimeout(t)
  }, [form, step])

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  function set(key: keyof FormState, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validateStep(): boolean {
    const errs: typeof errors = {}
    if (step === 1 && !form.digilocker_verified) {
      errs.digilocker_verified = 'Please complete DigiLocker verification to continue'
    }
    if (step === 2) {
      if (!form.name.trim()) errs.name = 'Full name is required'
      else if (!/^[a-zA-Zऀ-ॿ'\-\s.]+$/.test(form.name)) errs.name = 'Name contains invalid characters'
      if (!form.dob) errs.dob = 'Date of birth is required'
      else {
        const age = (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 3600 * 1000)
        if (age < 16) errs.dob = 'You must be at least 16 years old to apply'
      }
      if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = 'Enter a valid 10-digit Indian mobile number'
    }
    if (step === 3) {
      if (!form.address.trim()) errs.address = 'Address is required'
      if (!form.pincode.match(/^\d{6}$/)) errs.pincode = 'Enter a valid 6-digit PIN code'
    }
    if (step === 4) {
      if (!uploadedFiles.id_proof) errs.id_proof_type = 'Please upload your identity proof document'
      if (!uploadedFiles.address_proof) errs.address_proof_type = 'Please upload your address proof document'
      if (!uploadedFiles.photo) errs.email = 'Please upload your photograph'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validateStep()) setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  function mockUpload(field: string) {
    setUploadedFiles(f => ({ ...f, [field]: true }))
  }

  function goToDigiLocker() {
    setDigilockerRedirecting(true)
    window.location.href = `/digilocker?redirect_to=${encodeURIComponent('/apply/form?digilocker_done=1')}`
  }

  async function submit() {
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: { ...form, ...uploadedFiles } }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/apply/otp?appId=${data.id}`)
      } else {
        setSubmitError(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100)
  const stepTitles = ['Identity Verification', 'Personal Details', 'Address', 'Documents', 'Review & Submit']

  return (
    <div className="py-6 max-w-xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1 mb-4">
        <Link href="/" className="hover:text-gov-blue hover:underline">Home</Link>
        <span>›</span>
        <Link href="/apply" className="hover:text-gov-blue hover:underline">Learner's Licence</Link>
        <span>›</span>
        <span aria-current="page">Application Form</span>
      </nav>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gov-blue" aria-live="polite">
            Step {step} of {TOTAL_STEPS}: {stepTitles[step - 1]}
          </span>
          <span className="text-xs text-gray-500">
            {saving ? '💾 Saving...' : '✓ Progress saved'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% complete`}>
          <div className="h-full bg-gov-blue rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-gray-900 mb-5 focus:outline-none"
        >
          {stepTitles[step - 1]}
        </h1>

        {/* Step 1: DigiLocker */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Link your DigiLocker to pre-fill your personal details and verify your identity. This saves time and reduces errors.
            </p>
            {form.digilocker_verified ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="badge-verified mb-2">✓ DigiLocker Verified</div>
                <div className="text-sm space-y-1">
                  <div><span className="text-gray-500">ID:</span> <span className="font-mono text-xs bg-amber-50 border border-amber-200 px-1 rounded">{form.digilocker_id} <span className="text-amber-600">[SYNTHETIC]</span></span></div>
                  <div><span className="text-gray-500">Name:</span> {form.name}</div>
                  <div><span className="text-gray-500">DOB:</span> {form.dob}</div>
                </div>
                <div className="mt-3 text-xs text-green-700">✓ Identity pre-filled. You can review and edit on the next screen.</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                  <strong>Step 1:</strong> Sign in with DigiLocker to verify your identity and auto-fill your details.
                </div>
                <button
                  onClick={goToDigiLocker}
                  disabled={digilockerRedirecting}
                  className="w-full bg-gov-blue text-white font-semibold py-4 rounded-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 text-base disabled:opacity-70"
                  aria-label="Sign in with DigiLocker to verify identity"
                >
                  <span>🏛️</span> {digilockerRedirecting ? 'Redirecting to DigiLocker…' : 'Sign in with DigiLocker'}
                </button>
                <p className="text-center text-xs text-gray-500">
                  You will be redirected to DigiLocker to sign in, then brought back here with your details pre-filled.{' '}
                  <span className="badge-mock">MOCK</span>
                </p>
                {errors.digilocker_verified && (
                  <p className="text-red-600 text-sm" role="alert">{errors.digilocker_verified}</p>
                )}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">or skip for now</span></div>
                </div>
                <button
                  onClick={() => { setForm(f => ({ ...f, digilocker_verified: false })); setStep(2) }}
                  className="w-full border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
                >
                  Fill form manually (more steps)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal details */}
        {step === 2 && (
          <div className="space-y-4">
            {form.digilocker_verified && (
              <div className="badge-verified w-fit">✓ Pre-filled from DigiLocker · Review below</div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name <span aria-label="required" className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                placeholder="e.g. Priya Nair or Ravi O'Brien"
                autoComplete="name"
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
              />
              <p className="text-xs text-gray-400 mt-1">Hyphens, apostrophes, and regional characters accepted</p>
              {errors.name && <p id="name-error" className="text-red-600 text-sm mt-1" role="alert">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of birth <span aria-label="required" className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={e => set('dob', e.target.value)}
                className={`input-field ${errors.dob ? 'border-red-400' : ''}`}
                max={new Date().toISOString().split('T')[0]}
                aria-describedby={errors.dob ? 'dob-error' : undefined}
                aria-invalid={!!errors.dob}
              />
              {errors.dob && <p id="dob-error" className="text-red-600 text-sm mt-1" role="alert">{errors.dob}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile number <span aria-label="required" className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="input-field w-14 text-center bg-gray-50 text-gray-600 flex-shrink-0">+91</span>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`input-field flex-1 ${errors.phone ? 'border-red-400' : ''}`}
                  placeholder="9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && <p id="phone-error" className="text-red-600 text-sm mt-1" role="alert">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="vehicle_class" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle class <span aria-label="required" className="text-red-500">*</span>
              </label>
              <select
                id="vehicle_class"
                value={form.vehicle_class}
                onChange={e => set('vehicle_class', e.target.value)}
                className="input-field"
              >
                <option value="LMV">LMV — Light Motor Vehicle (car, jeep)</option>
                <option value="MCWG">MCWG — Motorcycle with gear</option>
                <option value="MCWOG">MCWOG — Motorcycle without gear / scooter</option>
                <option value="LMV+MCWG">LMV + MCWG (both)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Current residential address <span aria-label="required" className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                className={`input-field min-h-[80px] resize-none ${errors.address ? 'border-red-400' : ''}`}
                placeholder="House/flat no., street, area, city"
                aria-describedby={errors.address ? 'address-error' : undefined}
                aria-invalid={!!errors.address}
              />
              {errors.address && <p id="address-error" className="text-red-600 text-sm mt-1" role="alert">{errors.address}</p>}
            </div>

            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                PIN code <span aria-label="required" className="text-red-500">*</span>
              </label>
              <input
                id="pincode"
                type="text"
                value={form.pincode}
                onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={`input-field ${errors.pincode ? 'border-red-400' : ''}`}
                placeholder="560001"
                inputMode="numeric"
                maxLength={6}
                aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                aria-invalid={!!errors.pincode}
              />
              {errors.pincode && <p id="pincode-error" className="text-red-600 text-sm mt-1" role="alert">{errors.pincode}</p>}
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Your address must match your address proof document exactly. Minor variations (floor/flat details) are acceptable.
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Upload clear photos or scans. Max file size: 2 MB per document.</p>

            {[
              { key: 'id_proof', label: 'Identity proof', examples: 'Aadhaar, PAN, Voter ID, Passport', field: 'id_proof_type' as keyof FormState },
              { key: 'address_proof', label: 'Address proof', examples: 'Utility bill (last 3 months), bank statement', field: 'address_proof_type' as keyof FormState },
              { key: 'photo', label: 'Passport-size photograph', examples: 'White background, face clearly visible', field: null },
              { key: 'age_proof', label: 'Age proof', examples: 'Birth certificate or 10th marksheet', field: null },
            ].map(d => (
              <div key={d.key} className={`border-2 rounded-xl p-4 transition-all ${uploadedFiles[d.key] ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{d.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{d.examples}</div>
                    {errors[d.field as keyof FormState] && (
                      <p className="text-red-600 text-xs mt-1" role="alert">{errors[d.field as keyof FormState]}</p>
                    )}
                  </div>
                  {uploadedFiles[d.key] ? (
                    <div className="badge-verified flex-shrink-0">✓ Uploaded</div>
                  ) : (
                    <button
                      onClick={() => mockUpload(d.key)}
                      className="flex-shrink-0 bg-gov-blue text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-all"
                      aria-label={`Upload ${d.label}`}
                    >
                      Upload <span className="badge-mock !text-white !border-white/30 ml-1">MOCK</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              ⚠️ Review your details before submitting. After payment, changes require a new application.
            </div>
            {[
              ['Name', form.name],
              ['Date of birth', form.dob],
              ['Mobile', `+91 ${form.phone}`],
              ['Email', form.email || '(not provided)'],
              ['Vehicle class', form.vehicle_class],
              ['Address', form.address],
              ['PIN code', form.pincode],
              ['DigiLocker', form.digilocker_verified ? '✓ Verified' : 'Not verified'],
              ['Documents', `${Object.values(uploadedFiles).filter(Boolean).length} uploaded`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-500 flex-shrink-0 w-32">{label}</span>
                <span className="font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        {submitError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700" role="alert">
            ⚠ {submitError}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <button onClick={back} className="flex-1 btn-secondary" disabled={submitting}>
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={next} className="flex-1 btn-primary">
              Continue →
            </button>
          ) : (
            <button onClick={submit} className="flex-1 btn-orange" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Proceed to OTP & Payment →'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
