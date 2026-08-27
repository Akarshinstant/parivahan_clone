import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center gap-1">
        <Link href="/" className="hover:text-gov-blue hover:underline">Home</Link>
        <span>›</span>
        <span aria-current="page">About this Demo</span>
      </nav>

      <header>
        <div className="badge-mock mb-2">DEMO PROTOTYPE</div>
        <h1 className="text-2xl font-bold text-gray-900">About this Demo</h1>
        <p className="text-gray-500 text-sm mt-1">
          A hackathon prototype showing how the Parivahan/RTO Learner's Licence application could work differently.
        </p>
      </header>

      {/* Problem */}
      <section className="card" aria-labelledby="problem-heading">
        <h2 id="problem-heading" className="font-bold text-gray-900 mb-2">The Problem We're Fixing</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Indian government digital services — RTO portals, EPFO, IRCTC, Income Tax — share a recurring set of failure patterns: slow loads, session timeouts, rigid forms, desktop-first interfaces in a mobile-first country, single-officer bottlenecks, no offline fallback, and status pages that say "under process" without telling citizens what to do next.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-2">
          This prototype focuses on the <strong>Parivahan RTO Learner's Licence</strong> journey and shows what "fixed" looks like.
        </p>
      </section>

      {/* Core innovation */}
      <section className="card border-blue-200 bg-blue-50" aria-labelledby="innovation-heading">
        <h2 id="innovation-heading" className="font-bold text-gov-blue mb-3">Core Process Innovation</h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Decentralized statewide officer pool</strong> — any authorized RTO officer in Karnataka can claim and review any application, eliminating the single-officer bottleneck (backlog + corruption risk). This is a process change, not just a UI change.
          </p>
          <p>
            Citizens never see internal government structure. Status reads "Verified by RTO Officer — Karnataka" — never a name or district. Internally, the system records everything for the audit log.
          </p>
          <p>
            <strong>Optimistic locking</strong> prevents two officers from claiming the same application simultaneously. Open two browser tabs as different officers to see the race condition in action.
          </p>
        </div>
      </section>

      {/* What's functional */}
      <section className="card border-green-200 bg-green-50" aria-labelledby="functional-heading">
        <h2 id="functional-heading" className="font-bold text-green-800 mb-3">✅ What's Functional</h2>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Full citizen Learner's Licence journey (form → OTP → payment → status tracking)</li>
          <li>Multi-step progressive form with save-and-resume (server-persisted via MongoDB)</li>
          <li>Tolerant validation (apostrophes, hyphens, regional characters in names)</li>
          <li>OTP screen with recovery path (alternate number / DigiLocker fallback)</li>
          <li>Payment reconciliation demo (simulate deducted-but-not-updated scenario)</li>
          <li>Real statewide queue with optimistic-lock claim race (demo with two tabs)</li>
          <li>Officer checklist review with specific rejection reason codes</li>
          <li>Decentralized test slot assignment from any authorized track in Karnataka</li>
          <li>Citizen-visible anonymized audit trail (same data as admin view, names removed)</li>
          <li>Admin dashboard: metrics, workload distribution, service health scorecard, full audit log</li>
          <li>AI assistant wired to <strong>stealth/ox-alpha via OpenRouter</strong>, reasoning continuity, server-only key</li>
          <li>Scripted fallback (8-10 Q&A) when API key is missing or call fails, with badge</li>
          <li>Language switcher: English, हिन्दी, ಕನ್ನಡ (assistant responses + UI labels)</li>
          <li>Low-bandwidth mode toggle (hides images, simplifies layout)</li>
          <li>Queue wait indicator on landing page</li>
          <li>Status language: every screen says what the citizen should do next (or that no action is needed)</li>
          <li>Specific rejection messages with correction instructions (not generic "Rejected")</li>
        </ul>
      </section>

      {/* What's mocked */}
      <section className="card border-amber-200 bg-amber-50" aria-labelledby="mocked-heading">
        <h2 id="mocked-heading" className="font-bold text-amber-800 mb-3">⚠️ What's Mocked</h2>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>DigiLocker — simulated consent screen and fake identity; no real DigiLocker API</li>
          <li>OTP — any 6 digits accepted; no real SMS gateway</li>
          <li>Payments — always succeed; no real payment gateway; reconciliation demo is scripted</li>
          <li>Document OCR/validation — mock upload button; rule-based fake validation</li>
          <li>Service-health scorecard numbers — simulated but structured as a real pipeline would produce</li>
          <li>Driving test outcome — correctly stays offline/out-of-scope</li>
          <li>All citizen/officer data — synthetic, clearly labeled MOCK-DL-XXXX / MOCK-AADHAAR-XXXX / SYNTHETIC</li>
        </ul>
        <div className="mt-3 text-xs text-amber-700">
          ⚠️ Aadhaar/PAN patterns used here are obviously fake and labeled SYNTHETIC. No real government ID formats with valid checksums are used.
        </div>
      </section>

      {/* What's not built */}
      <section className="card" aria-labelledby="notbuilt-heading">
        <h2 id="notbuilt-heading" className="font-bold text-gray-900 mb-3">🚧 Not Built (Deliberately Out of Scope)</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Any other licence type or renewal flow (disabled "coming soon" cards)</li>
          <li>Real RTO backend integration</li>
          <li>Real officer PKI/authentication</li>
          <li>Production security hardening</li>
          <li>Full multilingual coverage beyond English, Hindi, Kannada demo</li>
          <li>Real government procurement reform (written recommendation only)</li>
        </ul>
      </section>

      {/* Tech stack */}
      <section className="card" aria-labelledby="tech-heading">
        <h2 id="tech-heading" className="font-bold text-gray-900 mb-3">Tech Stack</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>Frontend/Backend:</strong> Next.js 14 App Router + TypeScript + Tailwind CSS</div>
          <div><strong>Database:</strong> MongoDB via Mongoose (runs locally at <code className="bg-gray-100 px-1 rounded">mongodb://localhost:27017/parivahan-rto</code>)</div>
          <div><strong>AI Model:</strong> <code className="bg-gray-100 px-1 rounded">stealth/ox-alpha</code> via OpenRouter API, reasoning enabled</div>
          <div><strong>API key:</strong> Server-side only (<code className="bg-gray-100 px-1 rounded">OPENROUTER_API_KEY</code> in <code className="bg-gray-100 px-1 rounded">.env.local</code>)</div>
          <div><strong>Fallback:</strong> Scripted FAQ if key missing or call fails — demo never breaks during judging</div>
          <div><strong>Auth:</strong> Cookie-based role switcher (citizen / officer / admin) — no real auth provider</div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="card border-blue-200" aria-labelledby="a11y-heading">
        <h2 id="a11y-heading" className="font-bold text-gray-900 mb-2">Accessibility</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div>• WCAG 2.1 AA target: semantic HTML, ARIA roles/labels, visible focus states, skip links</div>
          <div>• Full keyboard navigation throughout</div>
          <div>• Sufficient color contrast on all text</div>
          <div>• All form fields labeled; errors linked by aria-describedby</div>
          <div>• AI assistant text always available alongside any voice output (voice is an enhancement, not a requirement)</div>
          <div className="badge-mock mt-2">Run Lighthouse or axe-core to verify current score</div>
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="btn-primary inline-block py-3 px-6">← Back to Demo</Link>
      </div>
    </div>
  )
}
