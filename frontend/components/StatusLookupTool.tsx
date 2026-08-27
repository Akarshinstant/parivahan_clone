'use client'
import { useState } from 'react'

type Tab = 'rc' | 'dl' | 'challan'

const RC_RESULT = {
  owner: 'Rohan A. Sharma',
  class: 'Motor Car (LMV)',
  maker: 'Maruti Suzuki Swift VXi',
  regDate: '14-Mar-2021',
  fuel: 'Petrol',
  insurance: { label: '13-Mar-2027', status: 'Active' },
  fitness: { label: '13-Mar-2036', status: 'Active' },
  puc: { label: '02-Jun-2026', status: 'Expiring soon' },
  roadTax: 'Paid (LTT)',
  rto: 'Koramangala RTO, Bengaluru (KA-01)',
  hypothecation: 'HDFC Bank Ltd.',
}

const DL_RESULT = {
  holder: 'Rohan A. Sharma',
  status: 'Active',
  issuer: 'RTO Koramangala, Bengaluru',
  issued: '02-Jan-2021',
  validUpto: '01-Jan-2041',
  classes: 'LMV, MCWG',
  badge: 'None',
}

const CHALLANS = [
  { id: '#CH2026070045', desc: 'Signal jump, MG Road', date: '12-Jul-2026', amount: '₹1,000', paid: false },
  { id: '#CH2026041178', desc: 'No helmet, Outer Ring Rd', date: '09-Apr-2026', amount: '₹500', paid: true },
  { id: '#CH2025121890', desc: 'Overspeeding, NH-44', date: '21-Dec-2025', amount: '₹2,000', paid: true },
]

function Badge({ label, type }: { label: string; type: 'ok' | 'warn' | 'due' }) {
  const styles = {
    ok: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
    warn: { background: '#FFF7ED', color: '#B45309', border: '1px solid #FDE68A' },
    due: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
  }
  return (
    <span style={{ ...styles[type], fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, display: 'inline-block' }}>
      {label}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#111827' }}>{children}</div>
    </div>
  )
}

export function StatusLookupTool() {
  const [tab, setTab] = useState<Tab>('rc')
  const [rcNum, setRcNum] = useState('KA01AB1234')
  const [dlNum, setDlNum] = useState('KA0120210012345')
  const [dlDob, setDlDob] = useState('1996-07-22')
  const [challanNum, setChallanNum] = useState('KA01AB1234')
  const [rcResult, setRcResult] = useState(false)
  const [dlResult, setDlResult] = useState(false)
  const [challanResult, setChallanResult] = useState(false)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'rc', label: 'Vehicle / RC Status' },
    { id: 'dl', label: 'Driving Licence Status' },
    { id: 'challan', label: 'eChallan Status' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t.id ? '#003580' : '#fff',
              color: tab === t.id ? '#fff' : '#6B7280',
              border: `1px solid ${tab === t.id ? '#003580' : '#E5E7EB'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tool card */}
      <div className="card" style={{ padding: 20 }}>

        {/* RC Panel */}
        {tab === 'rc' && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>
                  Vehicle Registration Number
                </label>
                <input
                  value={rcNum}
                  onChange={e => { setRcNum(e.target.value.toUpperCase()); setRcResult(false) }}
                  placeholder="e.g. KA01AB1234"
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <button onClick={() => setRcResult(true)} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px', fontSize: 13 }}>
                Search Vehicle
              </button>
            </div>
            {rcResult && (
              <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#003580', marginBottom: 12 }}>
                  Registration Details — <span style={{ fontFamily: 'monospace' }}>{rcNum || 'KA01AB1234'}</span>
                  <span className="badge-mock" style={{ marginLeft: 8 }}>MOCK</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px 24px' }}>
                  <Field label="Owner Name">{RC_RESULT.owner}</Field>
                  <Field label="Vehicle Class">{RC_RESULT.class}</Field>
                  <Field label="Maker / Model">{RC_RESULT.maker}</Field>
                  <Field label="Registration Date">{RC_RESULT.regDate}</Field>
                  <Field label="Fuel Type">{RC_RESULT.fuel}</Field>
                  <Field label="Insurance Valid Upto">{RC_RESULT.insurance.label} <Badge label={RC_RESULT.insurance.status} type="ok" /></Field>
                  <Field label="Fitness Valid Upto">{RC_RESULT.fitness.label} <Badge label={RC_RESULT.fitness.status} type="ok" /></Field>
                  <Field label="PUC Valid Upto">{RC_RESULT.puc.label} <Badge label={RC_RESULT.puc.status} type="warn" /></Field>
                  <Field label="Road Tax"><Badge label={RC_RESULT.roadTax} type="ok" /></Field>
                  <Field label="RTO">{RC_RESULT.rto}</Field>
                  <Field label="Hypothecation">{RC_RESULT.hypothecation}</Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DL Panel */}
        {tab === 'dl' && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>
                  Driving Licence Number
                </label>
                <input
                  value={dlNum}
                  onChange={e => { setDlNum(e.target.value.toUpperCase()); setDlResult(false) }}
                  placeholder="e.g. KA0120210012345"
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>
                  Date of Birth
                </label>
                <input type="date" value={dlDob} onChange={e => { setDlDob(e.target.value); setDlResult(false) }} className="input-field" />
              </div>
              <button onClick={() => setDlResult(true)} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px', fontSize: 13 }}>
                Check DL Status
              </button>
            </div>
            {dlResult && (
              <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#003580', marginBottom: 12 }}>
                  Licence Details — <span style={{ fontFamily: 'monospace' }}>{dlNum || 'KA0120210012345'}</span>
                  <span className="badge-mock" style={{ marginLeft: 8 }}>MOCK</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px 24px' }}>
                  <Field label="Holder Name">{DL_RESULT.holder}</Field>
                  <Field label="Status"><Badge label={DL_RESULT.status} type="ok" /></Field>
                  <Field label="Issuing Authority">{DL_RESULT.issuer}</Field>
                  <Field label="Date of Issue">{DL_RESULT.issued}</Field>
                  <Field label="Valid Upto">{DL_RESULT.validUpto}</Field>
                  <Field label="Vehicle Classes">{DL_RESULT.classes}</Field>
                  <Field label="Badge / Endorsement">{DL_RESULT.badge}</Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Challan Panel */}
        {tab === 'challan' && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>
                  Challan / Vehicle / DL Number
                </label>
                <input
                  value={challanNum}
                  onChange={e => { setChallanNum(e.target.value.toUpperCase()); setChallanResult(false) }}
                  placeholder="e.g. KA01AB1234"
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <button onClick={() => setChallanResult(true)} className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 20px', fontSize: 13 }}>
                Check Challans
              </button>
            </div>
            {challanResult && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 12 }}>
                  Pending &amp; Past Challans — <span style={{ fontFamily: 'monospace' }}>{challanNum}</span>
                  <span className="badge-mock" style={{ marginLeft: 8 }}>MOCK</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                  {CHALLANS.map((c, i) => (
                    <div key={c.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                      padding: '12px 16px', background: 'white',
                      borderBottom: i < CHALLANS.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.id} — {c.desc}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Issued {c.date} · {c.amount}</div>
                      </div>
                      <Badge label={c.paid ? 'Paid' : 'Unpaid'} type={c.paid ? 'ok' : 'due'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
