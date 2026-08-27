import Link from 'next/link'
import { QueueIndicator } from '@/components/QueueIndicator'
import { StatusLookupTool } from '@/components/StatusLookupTool'
import { Suspense } from 'react'

const SERVICES = [
  {
    id: 'learners',
    icon: '🪪',
    title: "New Learner's Licence",
    titleHi: 'नया शिक्षार्थी लाइसेंस',
    subtitle: 'Apply online for first-time licence. Fully digital — no RTO visit needed.',
    time: '2–5 working days',
    built: true,
    href: '/apply',
    accentColor: '#003580',
    bgLight: '#EFF6FF',
  },
  {
    id: 'dl',
    icon: '🚗',
    title: 'Permanent Driving Licence',
    titleHi: 'स्थायी ड्राइविंग लाइसेंस',
    subtitle: 'Convert Learner\'s Licence after 30 days with a practical test.',
    time: '7–10 working days',
    built: false,
    href: '/service/permanent-dl',
    accentColor: '#6B7280',
    bgLight: '#F9FAFB',
  },
  {
    id: 'renewal',
    icon: '🔄',
    title: 'Renew Existing DL',
    titleHi: 'मौजूदा DL नवीनीकरण',
    subtitle: 'Renew before expiry or within 1 year of expiry.',
    time: '3–7 working days',
    built: false,
    href: '/service/renewal',
    accentColor: '#6B7280',
    bgLight: '#F9FAFB',
  },
  {
    id: 'duplicate',
    icon: '📋',
    title: 'Duplicate DL',
    titleHi: 'डुप्लीकेट DL',
    subtitle: 'Replace lost, stolen, or damaged driving licence.',
    time: '5–10 working days',
    built: false,
    href: '/service/duplicate',
    accentColor: '#6B7280',
    bgLight: '#F9FAFB',
  },
  {
    id: 'cov',
    icon: '🏍️',
    title: 'Add Vehicle Class',
    titleHi: 'वाहन श्रेणी जोड़ें',
    subtitle: 'Add motorcycle, commercial, or heavy vehicle class to existing DL.',
    time: '7–14 working days',
    built: false,
    href: '/service/add-class',
    accentColor: '#6B7280',
    bgLight: '#F9FAFB',
  },
  {
    id: 'international',
    icon: '✈️',
    title: 'International Driving Permit',
    titleHi: 'अंतर्राष्ट्रीय ड्राइविंग परमिट',
    subtitle: 'Drive in 100+ countries. Valid 1 year from issue date.',
    time: '3–5 working days',
    built: false,
    href: '/service/idp',
    accentColor: '#6B7280',
    bgLight: '#F9FAFB',
  },
]

const NOTICES = [
  'New: Apply for Learner\'s Licence entirely online — no RTO office visit required.',
  'DigiLocker integration live: submit and verify documents digitally.',
  'System maintenance: Every 2nd Sunday, 2:00 AM – 6:00 AM IST.',
  'Decentralized officer pool: applications processed by any authorized Karnataka RTO officer.',
]

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Notice ticker */}
      <div style={{
        background: '#003580',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'stretch',
        boxShadow: '0 1px 4px rgba(0,53,128,0.12)',
      }}>
        <div style={{
          background: '#FF671F',
          padding: '8px 14px',
          fontSize: 11,
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
        }}>
          📢 NOTICES
        </div>
        <div style={{ overflow: 'hidden', padding: '8px 14px', flex: 1 }}>
          <div className="notice-ticker" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            {NOTICES.join('   ·   ')}
          </div>
        </div>
      </div>

      {/* Hero + Stats panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }} className="hero-grid">
        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(135deg, #003580 0%, #001f5b 60%, #0f7a9c 100%)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,53,128,0.18)',
          padding: '28px 28px 24px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: -40, bottom: -50,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,153,51,0.15)',
            pointerEvents: 'none',
          }} />
          <h1 style={{ color: 'white', fontWeight: 700, fontSize: 20, lineHeight: 1.35, marginBottom: 10, position: 'relative', zIndex: 1 }}>
            All your Driving Licence, RC &amp; Challan services — in one place
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13.5, marginBottom: 20, lineHeight: 1.6, maxWidth: 400, position: 'relative', zIndex: 1 }}>
            Apply for Learner's Licence, track your application, manage vehicle RC, and pay traffic challans entirely online.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Link href="/apply" style={{
              background: '#FF9933', color: '#3a2100', fontWeight: 700,
              padding: '9px 18px', borderRadius: 6, fontSize: 13.5, textDecoration: 'none', display: 'inline-block',
            }}>
              Apply for Learner's Licence
            </Link>
            <Link href="/applications" style={{
              background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.35)',
              fontWeight: 600, padding: '9px 18px', borderRadius: 6, fontSize: 13.5, textDecoration: 'none', display: 'inline-block',
            }}>
              Track Application
            </Link>
          </div>
          <div style={{
            marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.6)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
              Portal Online
            </span>
            <span>Updated: Today 08:30 AM</span>
            <span>Online Citizen Services · परिवहन सेवाएं</span>
          </div>
        </div>

        {/* Stats panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#003580', color: 'white', padding: '12px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
            PORTAL STATISTICS <span className="badge-mock" style={{ marginLeft: 6, color: '#FDE68A', borderColor: '#92400E', background: 'transparent', fontSize: 9 }}>MOCK</span>
          </div>
          {[
            { label: 'Registered Vehicles', value: '32.8 Cr', icon: '🚗' },
            { label: 'Driving Licences Issued', value: '18.4 Cr', icon: '🪪' },
            { label: 'Connected RTOs Nationwide', value: '1,347', icon: '🏛️' },
            { label: 'e-Challans Settled Today', value: '1,92,004', icon: '💳' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: i < arr.length - 1 ? '1px dashed #E5E7EB' : 'none',
            }}>
              <span style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{stat.icon}</span>{stat.label}
              </span>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#003580' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Queue status indicator */}
      <Suspense fallback={
        <div className="skeleton" style={{ height: 60, borderRadius: 6 }} />
      }>
        <QueueIndicator />
      </Suspense>

      {/* Services grid */}
      <section aria-labelledby="services-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 id="services-heading" style={{ fontWeight: 700, fontSize: 15, color: '#003580' }}>
            Online Services / ऑनलाइन सेवाएं
          </h2>
          <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>
            6 services available
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {SERVICES.map(s => (
            <Link
              key={s.id}
              href={s.href}
              className="service-card"
              aria-label={`${s.title}${!s.built ? ' — digitization in progress' : ''}`}
              style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: s.accentColor }}
            >
              {/* Card body */}
              <div style={{ padding: '16px 16px 12px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Icon in colored circle */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 8,
                    background: s.bgLight,
                    border: `1px solid ${s.built ? '#BFDBFE' : '#E5E7EB'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <h3 style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: s.built ? '#003580' : '#374151',
                        lineHeight: 1.3,
                      }}>
                        {s.title}
                      </h3>
                      {s.built ? (
                        <span style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 700,
                          background: '#ECFDF5', color: '#065F46',
                          border: '1px solid #A7F3D0',
                          padding: '2px 6px', borderRadius: 3,
                          letterSpacing: '0.03em',
                        }}>
                          LIVE ✓
                        </span>
                      ) : (
                        <span style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 700,
                          background: '#FFF7ED', color: '#9A3412',
                          border: '1px solid #FED7AA',
                          padding: '2px 6px', borderRadius: 3,
                          letterSpacing: '0.03em',
                        }}>
                          SOON
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'Noto Sans Devanagari, sans-serif', marginTop: 1 }}>
                      {s.titleHi}
                    </div>
                    <p style={{ fontSize: 12, color: '#4B5563', marginTop: 6, lineHeight: 1.5 }}>
                      {s.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div style={{
                borderTop: `1px solid ${s.built ? '#DBEAFE' : '#F3F4F6'}`,
                background: s.built ? '#F0F7FF' : '#FAFAFA',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⏱</span>
                  <span>{s.time}</span>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: s.built ? '#FF671F' : '#9CA3AF',
                }}>
                  {s.built ? 'Apply Now →' : 'View Details →'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Status Check */}
      <section aria-labelledby="status-check-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, background: '#FF9933', borderRadius: 2 }} />
          <h2 id="status-check-heading" style={{ fontWeight: 700, fontSize: 15, color: '#003580', margin: 0 }}>
            Quick Status Check
          </h2>
        </div>
        <StatusLookupTool />
      </section>

      {/* Connected Portals */}
      <section aria-labelledby="portals-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, background: '#FF9933', borderRadius: 2 }} />
          <h2 id="portals-heading" style={{ fontWeight: 700, fontSize: 15, color: '#003580', margin: 0 }}>
            Connected Portals
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="portals-grid">
          {[
            {
              pill: 'Driving Licence',
              title: 'Sarathi Parivahan',
              desc: "Learner's & permanent licence applications, test slot booking, renewal and duplicate DL.",
              gradient: 'linear-gradient(135deg, #003580, #155f8f)',
            },
            {
              pill: 'Vehicle Registration',
              title: 'VAHAN 4.0',
              desc: 'RC registration, ownership transfer, road tax payment, fitness & NOC services.',
              gradient: 'linear-gradient(135deg, #0f6b3a, #159c56)',
            },
            {
              pill: 'Traffic Enforcement',
              title: 'eChallan',
              desc: 'View and pay traffic violation fines issued across all connected states.',
              gradient: 'linear-gradient(135deg, #9c3412, #c9531f)',
            },
          ].map(p => (
            <div key={p.title} style={{
              background: p.gradient, borderRadius: 10, padding: 22, color: 'white',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                display: 'inline-block', background: 'rgba(255,255,255,0.18)',
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                marginBottom: 10,
              }}>
                {p.pill}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{p.title}</h3>
              <p style={{ margin: '0 0 14px', fontSize: 12.5, opacity: 0.88, lineHeight: 1.5 }}>{p.desc}</p>
              <span style={{ fontSize: 12, fontWeight: 700, borderBottom: '2px solid rgba(255,255,255,0.55)', paddingBottom: 1, cursor: 'default', opacity: 0.8 }}>
                Coming soon →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Updates + Forms & Downloads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }} className="updates-grid">
        {/* Latest Updates */}
        <section aria-labelledby="updates-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, background: '#FF9933', borderRadius: 2 }} />
            <h2 id="updates-heading" style={{ fontWeight: 700, fontSize: 15, color: '#003580', margin: 0 }}>Latest Updates</h2>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {[
              { text: 'Revised fee structure for International Driving Permit notified', date: '20 Aug 2026' },
              { text: 'Vahan 4.0 integration extended to 3 new Union Territories', date: '15 Aug 2026' },
              { text: 'Public notice: beware of fraudulent third-party DL agents', date: '08 Aug 2026' },
              { text: 'New CMVR guidelines for EV registration published', date: '02 Aug 2026' },
              { text: 'Fancy number e-auction results for July 2026 released', date: '28 Jul 2026' },
            ].map((item, i, arr) => (
              <div key={item.date + i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', fontSize: 13,
                borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <span style={{ color: '#1F2937', lineHeight: 1.5 }}>📌 {item.text}</span>
                <span style={{ color: '#9CA3AF', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Forms & Downloads */}
        <section aria-labelledby="downloads-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, background: '#FF9933', borderRadius: 2 }} />
            <h2 id="downloads-heading" style={{ fontWeight: 700, fontSize: 15, color: '#003580', margin: 0 }}>Forms &amp; Downloads</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Form 1 — Application for Learner\'s Licence', tag: 'PDF' },
              { name: 'Form 1A — Medical Certificate', tag: 'PDF' },
              { name: 'Form 20 — Application for Vehicle Registration', tag: 'PDF' },
              { name: 'Form 26 — Application for Duplicate RC', tag: 'PDF' },
              { name: 'Form 28 — NOC for Vehicle Re-registration', tag: 'PDF' },
            ].map(f => (
              <div key={f.name} className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', fontSize: 13,
              }}>
                <span style={{ color: '#1F2937' }}>📄 {f.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, background: '#EFF6FF', color: '#003580',
                  padding: '3px 8px', borderRadius: 4,
                  border: '1px solid #BFDBFE',
                }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Info section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {/* Documents */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📋</span> Documents Required
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Aadhaar card (identity + address proof)',
              'Recent passport-size photograph (white background)',
              'Age proof (Class 10 certificate / birth certificate)',
              'Medical certificate Form 1A — if applicant is 40+ years',
            ].map(doc => (
              <li key={doc} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#374151', alignItems: 'flex-start' }}>
                <span style={{ color: '#046A38', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                {doc}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#6B7280', background: '#F0F7FF', padding: '8px 10px', borderRadius: 4 }}>
            💡 DigiLocker-linked documents are preferred and speed up officer verification.
          </div>
        </div>

        {/* AI Assistant help */}
        <div className="card" style={{ background: '#F0F7FF', borderColor: '#BFDBFE' }}>
          <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🤖</span> AI Assistant
          </h2>
          <p style={{ fontSize: 12.5, color: '#374151', marginBottom: 12, lineHeight: 1.6 }}>
            Ask anything about eligibility, documents, or process steps — in English, हिन्दी, or ಕನ್ನಡ.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {["Am I eligible at 16?", "What documents do I need?", "How long does approval take?"].map(q => (
              <div key={q} style={{
                background: 'white',
                border: '1px solid #DBEAFE',
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 12,
                color: '#1D4ED8',
                cursor: 'pointer',
              }}>
                "{q}"
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#4B5563' }}>
            ⌨️ Click the chat bubble at bottom-right to start
          </div>
        </div>
      </div>

      {/* Helpline */}
      <div style={{
        background: '#003580',
        borderRadius: 6,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 2px 8px rgba(0,53,128,0.15)',
      }}>
        <div>
          <div style={{ color: '#FF9933', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Need Help?</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Toll-Free Helpline:
            <strong style={{ color: 'white', fontSize: 15, marginLeft: 6 }}>1800-XXX-XXXX</strong>
            <span className="badge-mock" style={{ marginLeft: 8, color: '#FDE68A', borderColor: '#92400E', background: 'transparent' }}>MOCK</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
            Monday – Saturday &nbsp;·&nbsp; 10:00 AM to 5:00 PM IST
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>📧 rto.help@karnataka.gov.in <span className="badge-mock" style={{ color: '#FDE68A', borderColor: '#92400E', background: 'transparent' }}>MOCK</span></div>
          <div>📍 Transport Dept, Shivajinagar, Bengaluru 560 001</div>
        </div>
      </div>
    </div>
  )
}
