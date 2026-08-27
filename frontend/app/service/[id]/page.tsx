import Link from 'next/link'
import { notFound } from 'next/navigation'

type ServiceDef = {
  icon: string
  title: string
  titleHi: string
  subtitle: string
  time: string
  accentColor: string
  docs: { label: string; note?: string }[]
  eligibility: string[]
  steps: { title: string; description: string }[]
  formFields: { label: string; type: string; placeholder?: string }[]
  expectedLaunch: string
}

const SERVICES: Record<string, ServiceDef> = {
  'permanent-dl': {
    icon: '🚗',
    title: 'Permanent Driving Licence',
    titleHi: 'स्थायी ड्राइविंग लाइसेंस',
    subtitle: 'Convert your Learner\'s Licence to a full Permanent DL after holding it for 30+ days.',
    time: '7–10 working days',
    accentColor: '#003580',
    docs: [
      { label: 'Valid Learner\'s Licence (original)', note: 'Must be at least 30 days old' },
      { label: 'Aadhaar card', note: 'For identity and address verification' },
      { label: 'Passport-size photograph', note: 'White background, taken within 3 months' },
      { label: 'Medical certificate — Form 1A', note: 'Required if applicant is 40+ years old' },
    ],
    eligibility: [
      'Valid Learner\'s Licence held for at least 30 days',
      'Minimum age 18 years (16 for gearless two-wheelers)',
      'Must pass the practical driving test at RTO',
    ],
    steps: [
      { title: 'Check eligibility', description: 'Verify your LL is at least 30 days old and you meet the age requirement.' },
      { title: 'Upload documents', description: 'Upload clear photos of all required documents via DigiLocker or direct upload.' },
      { title: 'Book driving test', description: 'Choose a convenient test slot at any Karnataka RTO track.' },
      { title: 'Appear for test', description: 'Attend your test slot with the test vehicle. RTO officer evaluates your driving skills.' },
      { title: 'Collect DL', description: 'After passing, your Permanent DL is issued digitally and available on DigiLocker.' },
    ],
    formFields: [
      { label: 'Learner\'s Licence Number', type: 'text', placeholder: 'e.g. KA01 20230001234' },
      { label: 'LL Issue Date', type: 'date' },
      { label: 'Vehicle Class', type: 'select', placeholder: 'LMV / Motorcycle / HMV' },
      { label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX' },
      { label: 'Mobile Number (OTP)', type: 'tel', placeholder: '10-digit mobile number' },
    ],
    expectedLaunch: 'Phase 2 · Q1 2025',
  },
  'renewal': {
    icon: '🔄',
    title: 'Renew Existing Driving Licence',
    titleHi: 'मौजूदा DL नवीनीकरण',
    subtitle: 'Renew your DL before expiry or within 1 year after expiry to continue driving legally.',
    time: '3–7 working days',
    accentColor: '#046A38',
    docs: [
      { label: 'Existing / expired DL (original)', note: 'Will be surrendered on renewal' },
      { label: 'Aadhaar card', note: 'Address must match DL address, or change of address form needed' },
      { label: 'Passport-size photograph', note: 'White background, recent' },
      { label: 'Medical certificate — Form 1A', note: 'Mandatory if age 40+' },
    ],
    eligibility: [
      'DL is nearing expiry, or expired within the last 1 year',
      'Original DL is available (not lost or damaged)',
      'Aadhaar number matches the existing DL record',
    ],
    steps: [
      { title: 'Verify DL details', description: 'Enter your existing DL number. System verifies expiry date and owner details.' },
      { title: 'Upload documents', description: 'Upload current DL photo, Aadhaar, and photograph.' },
      { title: 'Medical check (if applicable)', description: 'Upload Form 1A if you are 40 or above.' },
      { title: 'Pay renewal fee', description: 'Online payment via UPI, net banking, or debit/credit card.' },
      { title: 'Receive renewed DL', description: 'Renewed DL is processed and issued digitally within the stated timeline.' },
    ],
    formFields: [
      { label: 'Existing DL Number', type: 'text', placeholder: 'e.g. KA01 1990 0001234' },
      { label: 'Date of Birth', type: 'date' },
      { label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX' },
      { label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile' },
      { label: 'Reason for renewal', type: 'select', placeholder: 'Expiry / Before expiry / Address change' },
    ],
    expectedLaunch: 'Phase 2 · Q1 2025',
  },
  'duplicate': {
    icon: '📋',
    title: 'Duplicate Driving Licence',
    titleHi: 'डुप्लीकेट DL',
    subtitle: 'Apply for a certified duplicate if your licence was lost, stolen, or irreparably damaged.',
    time: '5–10 working days',
    accentColor: '#DC2626',
    docs: [
      { label: 'FIR copy', note: 'Mandatory for lost or stolen DL. File at nearest police station.' },
      { label: 'Affidavit on non-judicial stamp paper', note: 'Stating the loss/damage and requesting duplicate' },
      { label: 'Aadhaar card' },
      { label: 'Passport-size photograph' },
      { label: 'Damaged DL (if applicable)', note: 'Must be physically surrendered at RTO counter' },
    ],
    eligibility: [
      'Must have previously held a valid Karnataka DL',
      'FIR copy is mandatory for lost or stolen DL',
      'No active warrant or court order blocking the licence',
    ],
    steps: [
      { title: 'File FIR', description: 'Visit nearest police station and file an FIR for lost/stolen DL. Keep the copy.' },
      { title: 'Prepare affidavit', description: 'Get an affidavit notarized on stamp paper stating the loss and requesting a duplicate.' },
      { title: 'Apply online', description: 'Submit the application with FIR copy, affidavit, and other documents.' },
      { title: 'Verification', description: 'RTO officer verifies your original DL record in the system.' },
      { title: 'Collect duplicate DL', description: 'Duplicate DL is issued and also available via DigiLocker.' },
    ],
    formFields: [
      { label: 'Original DL Number', type: 'text', placeholder: 'e.g. KA01 2018 0001234' },
      { label: 'Reason for Duplicate', type: 'select', placeholder: 'Lost / Stolen / Damaged' },
      { label: 'FIR Number', type: 'text', placeholder: 'From police station' },
      { label: 'FIR Date', type: 'date' },
      { label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX' },
    ],
    expectedLaunch: 'Phase 2 · Q2 2025',
  },
  'add-class': {
    icon: '🏍️',
    title: 'Add Vehicle Class to DL',
    titleHi: 'वाहन श्रेणी जोड़ें',
    subtitle: 'Upgrade your Driving Licence to include motorcycle, commercial, or heavy vehicle class.',
    time: '7–14 working days',
    accentColor: '#7C3AED',
    docs: [
      { label: 'Existing valid DL (original)' },
      { label: 'Aadhaar card' },
      { label: 'Passport-size photograph' },
      { label: 'Form 9', note: 'Application form for addition of vehicle class' },
    ],
    eligibility: [
      'Must hold a valid Permanent DL',
      'Age 18+ for LMV / 20+ for heavy motor vehicles',
      'Separate Learner\'s Licence must be obtained for the new class',
      'Must pass a separate practical test for the new class',
    ],
    steps: [
      { title: 'Apply for Learner\'s Licence', description: 'First obtain a Learner\'s Licence for the new vehicle class (motorcyle, HMV, etc.).' },
      { title: 'Wait 30 days', description: 'Hold the LL for the new class for at least 30 days before applying for the test.' },
      { title: 'Apply for class addition', description: 'Submit Form 9 along with your existing DL and other documents.' },
      { title: 'Book driving test', description: 'Attend a practical test for the new class at any Karnataka RTO track.' },
      { title: 'Receive updated DL', description: 'DL is updated with the new vehicle class after passing the test.' },
    ],
    formFields: [
      { label: 'Existing DL Number', type: 'text', placeholder: 'e.g. KA01 2015 0001234' },
      { label: 'Current Vehicle Class(es)', type: 'text', placeholder: 'e.g. LMV' },
      { label: 'Class to be Added', type: 'select', placeholder: 'Motorcycle / HMV / Transport Vehicle' },
      { label: 'Learner\'s Licence Number for New Class', type: 'text', placeholder: 'LL number for new class' },
      { label: 'Aadhaar Number', type: 'text', placeholder: 'XXXX XXXX XXXX' },
    ],
    expectedLaunch: 'Phase 3 · Q2 2025',
  },
  'idp': {
    icon: '✈️',
    title: 'International Driving Permit',
    titleHi: 'अंतर्राष्ट्रीय ड्राइविंग परमिट',
    subtitle: 'Drive legally in 100+ countries under the 1968 Vienna Convention on Road Traffic.',
    time: '3–5 working days',
    accentColor: '#0369A1',
    docs: [
      { label: 'Valid Indian Driving Licence (original)', note: 'Must be valid throughout the IDP validity period' },
      { label: 'Valid Indian Passport (original)', note: 'Mandatory — IDP is linked to your passport' },
      { label: 'Visa / travel documents', note: 'For the destination country' },
      { label: 'Aadhaar card' },
      { label: '2 passport-size photographs', note: 'White background, 35mm x 45mm' },
    ],
    eligibility: [
      'Must hold a valid Indian Permanent DL for the vehicle class',
      'Valid Indian Passport is mandatory',
      'IDP is valid for 1 year from date of issue',
      'Does not replace the Indian DL — both must be carried while driving abroad',
    ],
    steps: [
      { title: 'Apply online or at RTO', description: 'Submit the online application with all required documents.' },
      { title: 'Pay IDP fee', description: 'One-time fee payable online or at RTO counter.' },
      { title: 'Document verification', description: 'RTO verifies DL, passport, and travel documents.' },
      { title: 'IDP issued', description: 'Collect IDP from your designated RTO office within the stated timeline.' },
      { title: 'Carry both documents', description: 'Always carry your Indian DL along with the IDP when driving abroad.' },
    ],
    formFields: [
      { label: 'DL Number', type: 'text', placeholder: 'e.g. KA01 2010 0001234' },
      { label: 'Passport Number', type: 'text', placeholder: 'e.g. A1234567' },
      { label: 'Passport Expiry Date', type: 'date' },
      { label: 'Destination Country', type: 'text', placeholder: 'e.g. France, Germany' },
      { label: 'Intended Travel Date', type: 'date' },
    ],
    expectedLaunch: 'Phase 3 · Q3 2025',
  },
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = SERVICES[params.id]
  if (!service) notFound()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
        <Link href="/" className="hover:underline" style={{ color: '#003580' }}>Home</Link>
        <span>›</span>
        <Link href="/" className="hover:underline" style={{ color: '#003580' }}>Online Services</Link>
        <span>›</span>
        <span aria-current="page">{service.title}</span>
      </nav>

      {/* Service header */}
      <div className="card" style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: service.accentColor }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 10,
            background: '#EFF3F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
            border: '1px solid #DCE6F0',
          }}>
            {service.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: 18, color: '#003580', marginBottom: 2 }}>{service.title}</h1>
                <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Noto Sans Devanagari, sans-serif' }}>{service.titleHi}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: '#FFF7ED', color: '#9A3412',
                border: '1px solid #FED7AA',
                padding: '4px 10px', borderRadius: 4,
                letterSpacing: '0.04em', flexShrink: 0,
              }}>
                🔧 DIGITIZATION IN PROGRESS
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: '#4B5563', marginTop: 8, lineHeight: 1.6 }}>{service.subtitle}</p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280', display: 'flex', gap: 16 }}>
              <span>⏱ Processing: <strong style={{ color: '#1F2937' }}>{service.time}</strong></span>
              <span>Expected online: <strong style={{ color: service.accentColor }}>{service.expectedLaunch}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Coming soon notice */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #F59E0B',
        borderRadius: 6,
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: 22, flexShrink: 0 }}>🚧</div>
        <div>
          <div style={{ fontWeight: 700, color: '#92400E', marginBottom: 4, fontSize: 13.5 }}>
            Online application coming soon
          </div>
          <p style={{ fontSize: 12.5, color: '#78350F', lineHeight: 1.6 }}>
            This service is being digitized. Until launch, please visit your nearest Karnataka RTO office
            with the required documents. The application preview below shows what the online form will look like.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>
              ← Back to Services
            </Link>
            <Link href="/apply" className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>
              Apply for Learner's Licence (Live) →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>

        {/* Documents required */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            📋 Documents Required
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {service.docs.map((doc, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: service.accentColor, color: 'white',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 12.5, color: '#1F2937', fontWeight: 500 }}>{doc.label}</div>
                  {doc.note && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{doc.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✅ Eligibility Criteria
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {service.eligibility.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12.5, color: '#374151', alignItems: 'flex-start' }}>
                <span style={{ color: '#046A38', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process steps */}
      <div className="card">
        <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          📌 Application Process
        </h2>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 15, top: 20, bottom: 20,
            width: 2, background: '#DCE6F0', zIndex: 0,
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {service.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < service.steps.length - 1 ? 20 : 0, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: service.accentColor, color: 'white',
                  fontWeight: 700, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px ' + service.accentColor + '33',
                }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1F2937', marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.6 }}>{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 16,
          background: '#EFF3F8',
          borderRadius: 4,
          padding: '10px 14px',
          fontSize: 12,
          color: '#374151',
          display: 'flex',
          gap: 8,
        }}>
          <span>📍</span>
          <span>
            Until this service is available online, visit your nearest Karnataka RTO office.
            Office hours: <strong>Mon–Fri 10:00 AM–5:00 PM</strong> · <strong>Sat 10:00 AM–1:00 PM</strong>
          </span>
        </div>
      </div>

      {/* Mock application form (locked/preview) */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ fontWeight: 700, color: '#003580', fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          📝 Application Form Preview
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: '#FFF7ED', color: '#9A3412',
            border: '1px solid #FED7AA',
            padding: '2px 6px', borderRadius: 3,
          }}>COMING SOON</span>
        </h2>

        {/* Blur overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(3px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}>
          <div style={{ fontSize: 36 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#003580', textAlign: 'center' }}>
            Online Application Coming Soon
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
            Expected launch: <strong style={{ color: service.accentColor }}>{service.expectedLaunch}</strong>
          </div>
          <Link href="/" className="btn-secondary" style={{ fontSize: 12, padding: '8px 18px', zIndex: 11 }}>
            ← Back to All Services
          </Link>
        </div>

        {/* Form fields (shown behind blur) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, filter: 'none' }}>
          {service.formFields.map((field, i) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                {field.label}
              </label>
              <input
                type={field.type === 'select' ? 'text' : field.type}
                placeholder={field.placeholder}
                disabled
                className="input-field"
                style={{ opacity: 0.5 }}
              />
            </div>
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>

      {/* RTO office locator mock */}
      <div style={{
        background: '#003580',
        borderRadius: 6,
        padding: '16px 20px',
        color: 'white',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 30 }}>📍</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#FF9933', fontWeight: 700, marginBottom: 4 }}>Find Nearest RTO Office</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Visit any Karnataka RTO office to apply for this service in person.<br />
            Bengaluru: Koramangala, Jayanagar, Rajajinagar, Yeshwanthpur, Kengeri, HSR Layout
          </div>
        </div>
        <div>
          <button disabled style={{
            background: '#FF671F', color: 'white',
            border: 'none', borderRadius: 4,
            padding: '10px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'not-allowed', opacity: 0.7,
          }}>
            🗺 Locate RTO
            <span className="badge-mock" style={{ marginLeft: 6, color: '#FDE68A', borderColor: '#92400E', background: 'transparent' }}>MOCK</span>
          </button>
        </div>
      </div>
    </div>
  )
}
