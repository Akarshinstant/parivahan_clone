'use client'
import { useState, useEffect } from 'react'

type FeedbackType = 'bug' | 'ux' | 'feature' | 'general'

const TYPE_OPTIONS: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'bug',     label: 'Bug Report',        emoji: '🐛' },
  { value: 'ux',      label: 'UX / Usability',    emoji: '🖥️' },
  { value: 'feature', label: 'Feature Request',   emoji: '✨' },
  { value: 'general', label: 'General Feedback',  emoji: '💬' },
]

type AiAnalysis = {
  root_cause: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  suggested_fix: string
  user_journey_impact: string
}

type SubmitResult = {
  jira_ticket_id: string
  ai_analysis: AiAnalysis | null
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high:     'bg-orange-100 text-orange-800 border-orange-300',
  medium:   'bg-amber-100 text-amber-800 border-amber-300',
  low:      'bg-blue-100 text-blue-800 border-blue-300',
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('bug')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    if (open) setPageUrl(window.location.pathname)
  }, [open])

  function reset() {
    setType('bug')
    setTitle('')
    setDescription('')
    setResult(null)
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, page_url: pageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Floating button — bottom-left, away from AI assistant (bottom-right) */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) reset() }}
        className="fixed bottom-6 left-4 z-50 bg-white border border-gray-300 text-gov-blue rounded-full shadow-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:border-gov-blue hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-gov-orange"
        aria-label="Open feedback form"
        aria-expanded={open}
      >
        <span aria-hidden="true">📝</span> Feedback
      </button>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Submit feedback"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gov-blue text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <div className="font-semibold">Share Feedback</div>
                <div className="text-xs text-blue-200 mt-0.5">Help us improve the Parivahan portal</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-blue-200 hover:text-white text-xl leading-none"
                aria-label="Close feedback form"
              >
                ×
              </button>
            </div>

            {result ? (
              /* Success state */
              <div className="p-5 space-y-4">
                <div className="text-center space-y-1">
                  <div className="text-3xl">✅</div>
                  <h2 className="font-bold text-gray-900 text-lg">Thank you!</h2>
                  <p className="text-sm text-gray-500">Your feedback has been submitted and a ticket has been created.</p>
                </div>

                {/* Dummy Jira ticket card */}
                <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Jira Ticket</span>
                    <span className="text-xs bg-blue-200 text-blue-800 font-mono px-2 py-0.5 rounded font-bold">{result.jira_ticket_id}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{title}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{TYPE_OPTIONS.find(t => t.value === type)?.emoji} {type}</span>
                    <span>·</span>
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs font-medium">Open</span>
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    Track at: <span className="font-mono">/admin → Feedback → {result.jira_ticket_id}</span>
                  </div>
                </div>

                {/* AI Analysis card */}
                {result.ai_analysis && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">🤖 AI Root-Cause Analysis</span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${SEVERITY_STYLES[result.ai_analysis.severity] || SEVERITY_STYLES.medium}`}>
                        {result.ai_analysis.severity}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-700">
                      <div>
                        <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Root Cause</span>
                        <p className="mt-0.5">{result.ai_analysis.root_cause}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Journey Impact</span>
                        <p className="mt-0.5">{result.ai_analysis.user_journey_impact}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Suggested Fix</span>
                        <p className="mt-0.5">{result.ai_analysis.suggested_fix}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!result.ai_analysis && (
                  <p className="text-xs text-gray-400 text-center">AI analysis unavailable — ticket created successfully.</p>
                )}

                <button
                  onClick={() => { reset(); setOpen(false) }}
                  className="w-full py-2.5 bg-gov-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={submit} className="p-5 space-y-4">
                {/* Feedback type */}
                <fieldset>
                  <legend className="text-xs font-semibold text-gray-700 mb-2">Type of feedback</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPE_OPTIONS.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer text-sm transition-all ${
                          type === opt.value
                            ? 'border-gov-blue bg-blue-50 text-gov-blue font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedback-type"
                          value={opt.value}
                          checked={type === opt.value}
                          onChange={() => setType(opt.value)}
                          className="sr-only"
                        />
                        <span aria-hidden="true">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Title */}
                <div>
                  <label htmlFor="fb-title" className="text-xs font-semibold text-gray-700 mb-1 block">
                    Title <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="fb-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Short summary of the issue"
                    maxLength={120}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-gov-blue focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="fb-desc" className="text-xs font-semibold text-gray-700 mb-1 block">
                    Description <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="fb-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what happened, what you expected, and what went wrong. The more detail, the better."
                    rows={4}
                    maxLength={1000}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-gov-blue focus:outline-none resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-0.5">{description.length}/1000</div>
                </div>

                {/* Page context (read-only) */}
                <div className="text-xs text-gray-400">
                  📍 Reporting from: <span className="font-mono text-gray-500">{pageUrl || '/'}</span>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !description.trim()}
                    className="flex-1 py-2.5 bg-gov-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting…' : 'Submit Feedback'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  AI will analyze your feedback to help the team prioritize fixes.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
