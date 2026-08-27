import mongoose from 'mongoose'
import { randomUUID } from 'node:crypto'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parivahan-rto'

// ── Inline schemas (avoid Next.js module issues in script context) ─────────
const str = (req = false) => ({ type: String, required: req } as const)

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ _id: String, name: str(true), dob: str(true), phone: str(true), email: String, digilocker_id: String, aadhaar_mock: String, address: String, pincode: String, state: { type: String, default: 'Karnataka' }, created_at: { type: Date, default: Date.now } }, { _id: false }))
const Officer = mongoose.models.Officer || mongoose.model('Officer', new mongoose.Schema({ _id: String, name: str(true), employee_id: str(true), district: str(true), active: { type: Boolean, default: true }, created_at: { type: Date, default: Date.now } }, { _id: false }))
const TestTrack = mongoose.models.TestTrack || mongoose.model('TestTrack', new mongoose.Schema({ _id: String, name: str(true), district: str(true), state: { type: String, default: 'Karnataka' }, address: str(true), total_slots: { type: Number, default: 10 }, active: { type: Boolean, default: true } }, { _id: false }))
const TestSlot = mongoose.models.TestSlot || mongoose.model('TestSlot', new mongoose.Schema({ _id: String, track_id: str(true), slot_date: str(true), slot_time: str(true), application_id: { type: String, default: null }, created_at: { type: Date, default: Date.now } }, { _id: false }))
const Application = mongoose.models.Application || mongoose.model('Application', new mongoose.Schema({ _id: String, user_id: String, status: { type: String, default: 'submitted' }, claimed_by: { type: String, default: null }, claimed_at: Date, reviewed_at: Date, rejection_reason: String, rejection_code: String, test_slot_id: String, form_data: mongoose.Schema.Types.Mixed, payment_id: String, payment_status: { type: String, default: 'paid' }, created_at: { type: Date, default: Date.now }, updated_at: { type: Date, default: Date.now } }, { _id: false }))
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', new mongoose.Schema({ _id: String, application_id: str(true), action: str(true), actor_type: str(true), actor_id: String, actor_name: String, district: String, notes: String, created_at: { type: Date, default: Date.now } }, { _id: false }))
const FormDraft = mongoose.models.FormDraft || mongoose.model('FormDraft', new mongoose.Schema({ _id: String, session_id: { type: String, unique: true, required: true }, form_data: mongoose.Schema.Types.Mixed, step: { type: Number, default: 1 }, updated_at: { type: Date, default: Date.now } }, { _id: false }))
const AssistantSession = mongoose.models.AssistantSession || mongoose.model('AssistantSession', new mongoose.Schema({ _id: String, session_id: { type: String, unique: true, required: true }, messages: mongoose.Schema.Types.Mixed, language: { type: String, default: 'en' }, updated_at: { type: Date, default: Date.now } }, { _id: false }))

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d
}
function hoursAgo(n: number) {
  const d = new Date(); d.setHours(d.getHours() - n); return d
}
function futureDate(daysFromNow: number) {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI, { bufferCommands: false })
  console.log('Connected.')

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Officer.deleteMany({}), TestTrack.deleteMany({}),
    TestSlot.deleteMany({}), Application.deleteMany({}), AuditLog.deleteMany({}),
    FormDraft.deleteMany({}), AssistantSession.deleteMany({}),
  ])
  console.log('  ✓ Cleared all collections')

  // USERS
  const users = [
    { _id: 'user-001', name: 'Anjali Sharma', dob: '1998-04-12', phone: '9876543210', email: 'anjali@example.com', digilocker_id: 'MOCK-DL-1001', aadhaar_mock: 'MOCK-AADHAAR-0001', address: '42, 3rd Cross, JP Nagar', pincode: '560078' },
    { _id: 'user-002', name: "Ravi O'Brien", dob: '1995-08-20', phone: '9812345678', email: 'ravi@example.com', digilocker_id: 'MOCK-DL-1002', aadhaar_mock: 'MOCK-AADHAAR-0002', address: '15, MG Road', pincode: '560001' },
    { _id: 'user-003', name: 'Lakshmi Narasimhan', dob: '2002-01-05', phone: '9845612345', digilocker_id: 'MOCK-DL-1003', aadhaar_mock: 'MOCK-AADHAAR-0003', address: '7, Chamundi Hills Rd', pincode: '570010' },
    { _id: 'user-004', name: 'Arjun Singh', dob: '1997-11-30', phone: '9900112233', digilocker_id: 'MOCK-DL-1004', aadhaar_mock: 'MOCK-AADHAAR-0004', address: '88, Hebbal', pincode: '560024' },
    { _id: 'user-005', name: 'Fatima Begum', dob: '1999-06-15', phone: '9988776655', digilocker_id: 'MOCK-DL-1005', aadhaar_mock: 'MOCK-AADHAAR-0005', address: '12, Frazer Town', pincode: '560005' },
    { _id: 'user-006', name: 'Karthik Murthy', dob: '2000-03-22', phone: '9777888999', digilocker_id: 'MOCK-DL-1006', aadhaar_mock: 'MOCK-AADHAAR-0006', address: '5, Rajajinagar', pincode: '560010' },
    { _id: 'user-007', name: 'Deepa Krishnan', dob: '1994-07-08', phone: '9654321987', digilocker_id: 'MOCK-DL-1007', aadhaar_mock: 'MOCK-AADHAAR-0007', address: '33, Koramangala', pincode: '560034' },
    { _id: 'user-008', name: 'Suresh Reddy', dob: '1988-12-01', phone: '9543219876', digilocker_id: 'MOCK-DL-1008', aadhaar_mock: 'MOCK-AADHAAR-0008', address: '21, Whitefield', pincode: '560066' },
    { _id: 'user-009', name: 'Meena Agarwal', dob: '2003-09-14', phone: '9432198765', digilocker_id: 'MOCK-DL-1009', aadhaar_mock: 'MOCK-AADHAAR-0009', address: '9, Yelahanka', pincode: '560064' },
    { _id: 'user-010', name: 'Vikram Bhat', dob: '1991-05-27', phone: '9321987654', digilocker_id: 'MOCK-DL-1010', aadhaar_mock: 'MOCK-AADHAAR-0010', address: '67, Malleswaram', pincode: '560003' },
    { _id: 'user-011', name: "Preethi D'Souza", dob: '1996-02-18', phone: '9210876543', digilocker_id: 'MOCK-DL-1011', aadhaar_mock: 'MOCK-AADHAAR-0011', address: '4, Mangalore Old Town', pincode: '575001' },
    { _id: 'user-012', name: 'Hassan Ali Khan', dob: '1985-10-09', phone: '9109765432', digilocker_id: 'MOCK-DL-1012', aadhaar_mock: 'MOCK-AADHAAR-0012', address: '18, Shivajinagar', pincode: '560001' },
    { _id: 'user-013', name: 'Rekha Venkatesh', dob: '2001-04-03', phone: '9098654321', digilocker_id: 'MOCK-DL-1013', aadhaar_mock: 'MOCK-AADHAAR-0013', address: '52, Indiranagar', pincode: '560038' },
    { _id: 'user-014', name: 'Nikhil Joshi', dob: '1993-08-25', phone: '8987543210', digilocker_id: 'MOCK-DL-1014', aadhaar_mock: 'MOCK-AADHAAR-0014', address: '76, BTM Layout', pincode: '560076' },
    { _id: 'user-015', name: 'Sowmya M-R', dob: '2004-01-11', phone: '8876432109', digilocker_id: 'MOCK-DL-1015', aadhaar_mock: 'MOCK-AADHAAR-0015', address: '3, Basavanagudi', pincode: '560004' },
  ]
  await User.insertMany(users)
  console.log(`  ✓ ${users.length} users`)

  // OFFICERS
  const officers = [
    { _id: 'off-001', name: 'Rajesh Kumar', employee_id: 'KA-RTO-2847', district: 'Bengaluru Urban' },
    { _id: 'off-002', name: 'Priya Nair', employee_id: 'KA-RTO-3912', district: 'Mysuru' },
    { _id: 'off-003', name: 'Mohammed Irfan', employee_id: 'KA-RTO-4521', district: 'Hubli-Dharwad' },
    { _id: 'off-004', name: 'Sunita Rao', employee_id: 'KA-RTO-5103', district: 'Mangaluru' },
    { _id: 'off-005', name: 'Ganesh Patil', employee_id: 'KA-RTO-6278', district: 'Belagavi' },
    { _id: 'off-006', name: 'Kavitha Srinivas', employee_id: 'KA-RTO-7891', district: 'Davanagere' },
    { _id: 'off-007', name: 'Prasad Hebbar', employee_id: 'KA-RTO-8042', district: 'Shivamogga' },
  ]
  await Officer.insertMany(officers)
  console.log(`  ✓ ${officers.length} officers`)

  // TEST TRACKS
  const tracks = [
    { _id: 'track-001', name: 'Bengaluru North RTO Track', district: 'Bengaluru Urban', address: 'Rajajinagar, Bengaluru 560010' },
    { _id: 'track-002', name: 'Mysuru Driving Test Centre', district: 'Mysuru', address: 'Bannimantap, Mysuru 570015' },
    { _id: 'track-003', name: 'Hubli RTO Test Ground', district: 'Hubli-Dharwad', address: 'Gokul Road, Hubli 580030' },
    { _id: 'track-004', name: 'Mangaluru Motor Vehicle Test Track', district: 'Mangaluru', address: 'Kadri, Mangaluru 575004' },
    { _id: 'track-005', name: 'Belagavi State Driving Test Centre', district: 'Belagavi', address: 'Tilakwadi, Belagavi 590006' },
  ]
  await TestTrack.insertMany(tracks)
  console.log(`  ✓ ${tracks.length} test tracks`)

  // TEST SLOTS
  const slotTimes = ['09:00', '10:00', '11:00', '14:00', '15:00']
  const slots: any[] = []
  for (const track of tracks) {
    for (let day = 3; day <= 14; day++) {
      for (const time of slotTimes) {
        slots.push({ _id: `slot-${track._id}-d${day}-${time.replace(':', '')}`, track_id: track._id, slot_date: futureDate(day), slot_time: time })
      }
    }
  }
  await TestSlot.insertMany(slots)
  console.log(`  ✓ ${slots.length} test slots`)

  // APPLICATIONS
  const formDataFor = (u: typeof users[0]) => ({
    name: u.name, dob: u.dob, phone: u.phone, email: (u as any).email || '',
    aadhaar_mock: u.aadhaar_mock, address: u.address, pincode: u.pincode,
    state: 'Karnataka', vehicle_class: 'LMV',
    id_proof_type: 'aadhaar', id_proof_file: 'mock-id-proof.pdf',
    address_proof_type: 'utility_bill', address_proof_file: 'mock-address-proof.pdf',
    photo_file: 'mock-photo.jpg', digilocker_verified: true, digilocker_id: u.digilocker_id,
  })

  type AppRow = { id: string; uid: string; status: string; claimedBy?: string; claimedAt?: Date; reviewedAt?: Date; rejReason?: string; rejCode?: string; slotId?: string; createdDaysAgo: number }

  const appRows: AppRow[] = [
    { id: 'app-001', uid: 'user-008', status: 'licence_issued', claimedBy: 'off-001', claimedAt: daysAgo(28), reviewedAt: daysAgo(25), slotId: 'slot-track-001-d3-0900', createdDaysAgo: 30 },
    { id: 'app-002', uid: 'user-010', status: 'licence_issued', claimedBy: 'off-002', claimedAt: daysAgo(22), reviewedAt: daysAgo(20), slotId: 'slot-track-002-d3-1000', createdDaysAgo: 25 },
    { id: 'app-003', uid: 'user-007', status: 'test_scheduled', claimedBy: 'off-003', claimedAt: daysAgo(12), reviewedAt: daysAgo(10), slotId: 'slot-track-001-d5-1000', createdDaysAgo: 15 },
    { id: 'app-004', uid: 'user-011', status: 'test_scheduled', claimedBy: 'off-004', claimedAt: daysAgo(8), reviewedAt: daysAgo(6), slotId: 'slot-track-003-d4-1100', createdDaysAgo: 12 },
    { id: 'app-005', uid: 'user-012', status: 'test_scheduled', claimedBy: 'off-005', claimedAt: daysAgo(6), reviewedAt: daysAgo(4), slotId: 'slot-track-004-d5-1400', createdDaysAgo: 10 },
    { id: 'app-006', uid: 'user-013', status: 'approved', claimedBy: 'off-006', claimedAt: daysAgo(5), reviewedAt: daysAgo(3), createdDaysAgo: 8 },
    { id: 'app-007', uid: 'user-014', status: 'approved', claimedBy: 'off-007', claimedAt: daysAgo(4), reviewedAt: daysAgo(2), createdDaysAgo: 7 },
    { id: 'app-008', uid: 'user-005', status: 'rejected', claimedBy: 'off-001', claimedAt: daysAgo(10), reviewedAt: daysAgo(8), rejReason: 'Address proof document is unclear or incomplete', rejCode: 'address_proof_unclear', createdDaysAgo: 14 },
    { id: 'app-009', uid: 'user-009', status: 'rejected', claimedBy: 'off-002', claimedAt: daysAgo(7), reviewedAt: daysAgo(5), rejReason: 'Passport-size photograph does not meet requirements', rejCode: 'photo_quality_poor', createdDaysAgo: 10 },
    { id: 'app-010', uid: 'user-015', status: 'rejected', claimedBy: 'off-003', claimedAt: daysAgo(5), reviewedAt: daysAgo(3), rejReason: 'Name or details do not match across documents', rejCode: 'identity_mismatch', createdDaysAgo: 8 },
    { id: 'app-011', uid: 'user-004', status: 'under_review', claimedBy: 'off-001', claimedAt: daysAgo(2), createdDaysAgo: 4 },
    { id: 'app-012', uid: 'user-006', status: 'under_review', claimedBy: 'off-002', claimedAt: daysAgo(1), createdDaysAgo: 3 },
    { id: 'app-013', uid: 'user-003', status: 'under_review', claimedBy: 'off-004', claimedAt: daysAgo(1), createdDaysAgo: 2 },
    { id: 'app-014', uid: 'user-002', status: 'assigned', claimedBy: 'off-005', claimedAt: hoursAgo(6), createdDaysAgo: 1 },
    { id: 'app-015', uid: 'user-001', status: 'submitted', createdDaysAgo: 0 },
    { id: 'app-016', uid: 'user-005', status: 'submitted', createdDaysAgo: 1 },
    { id: 'app-017', uid: 'user-009', status: 'submitted', createdDaysAgo: 1 },
    { id: 'app-018', uid: 'user-015', status: 'submitted', createdDaysAgo: 2 },
    { id: 'app-019', uid: 'user-003', status: 'submitted', createdDaysAgo: 0 },
    { id: 'app-020', uid: 'user-006', status: 'submitted', createdDaysAgo: 0 },
    { id: 'app-021', uid: 'user-004', status: 'submitted', createdDaysAgo: 1 },
    { id: 'app-022', uid: 'user-002', status: 'submitted', createdDaysAgo: 2 },
    { id: 'app-023', uid: 'user-011', status: 'submitted', createdDaysAgo: 3 },
    { id: 'app-024', uid: 'user-012', status: 'submitted', createdDaysAgo: 3 },
    { id: 'app-025', uid: 'user-014', status: 'submitted', createdDaysAgo: 4 },
    { id: 'app-026', uid: 'user-013', status: 'under_review', claimedBy: 'off-006', claimedAt: daysAgo(2), createdDaysAgo: 5 },
    { id: 'app-027', uid: 'user-007', status: 'assigned', claimedBy: 'off-007', claimedAt: hoursAgo(3), createdDaysAgo: 2 },
    { id: 'app-028', uid: 'user-010', status: 'approved', claimedBy: 'off-001', claimedAt: daysAgo(3), reviewedAt: daysAgo(1), createdDaysAgo: 5 },
  ]

  const appDocs = appRows.map(a => {
    const u = users.find(x => x._id === a.uid)!
    const createdAt = daysAgo(a.createdDaysAgo)
    return {
      _id: a.id, user_id: a.uid, status: a.status,
      claimed_by: a.claimedBy || null, claimed_at: a.claimedAt || null, reviewed_at: a.reviewedAt || null,
      rejection_reason: a.rejReason || null, rejection_code: a.rejCode || null, test_slot_id: a.slotId || null,
      form_data: formDataFor(u), payment_id: `PAY-MOCK-${a.id.slice(-3)}`,
      payment_status: 'paid', created_at: createdAt, updated_at: createdAt,
    }
  })
  await Application.insertMany(appDocs)

  // Mark used test slots
  await TestSlot.updateOne({ _id: 'slot-track-001-d5-1000' }, { application_id: 'app-003' })
  await TestSlot.updateOne({ _id: 'slot-track-003-d4-1100' }, { application_id: 'app-004' })
  await TestSlot.updateOne({ _id: 'slot-track-004-d5-1400' }, { application_id: 'app-005' })
  console.log(`  ✓ ${appRows.length} applications`)

  // AUDIT LOG
  const auditDocs: any[] = []
  for (const a of appRows) {
    const createdAt = daysAgo(a.createdDaysAgo)
    auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'application_submitted', actor_type: 'citizen', actor_id: a.uid, notes: 'Application submitted with payment', created_at: createdAt })

    if (a.claimedBy) {
      const officer = officers.find(o => o._id === a.claimedBy)!
      const viewedAt = new Date(a.claimedAt!.getTime() - 30 * 60 * 1000)
      auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'application_viewed', actor_type: 'officer', actor_id: officer._id, actor_name: officer.name, district: officer.district, created_at: viewedAt })
      auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'application_claimed', actor_type: 'officer', actor_id: officer._id, actor_name: officer.name, district: officer.district, notes: 'Claimed from statewide queue', created_at: a.claimedAt })
    }

    if (a.reviewedAt) {
      const officer = officers.find(o => o._id === a.claimedBy)!
      const reviewStart = new Date(a.reviewedAt.getTime() - 2 * 60 * 60 * 1000)
      auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'review_started', actor_type: 'officer', actor_id: officer._id, actor_name: officer.name, district: officer.district, created_at: reviewStart })
      if (a.status === 'rejected') {
        auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'application_rejected', actor_type: 'officer', actor_id: officer._id, actor_name: officer.name, district: officer.district, notes: a.rejReason, created_at: a.reviewedAt })
      } else {
        auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'application_approved', actor_type: 'officer', actor_id: officer._id, actor_name: officer.name, district: officer.district, notes: 'All documents verified', created_at: a.reviewedAt })
      }
    }

    if (a.slotId) {
      const slotTime = new Date(a.reviewedAt!.getTime() + 4 * 60 * 60 * 1000)
      auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'test_slot_assigned', actor_type: 'officer', actor_id: a.claimedBy!, notes: 'Test slot assigned at statewide track', created_at: slotTime })
    }

    if (a.status === 'licence_issued') {
      const issuedAt = new Date(a.reviewedAt!.getTime() + 7 * 24 * 60 * 60 * 1000)
      auditDocs.push({ _id: randomUUID(), application_id: a.id, action: 'licence_issued', actor_type: 'system', notes: 'Digital licence generated', created_at: issuedAt })
    }
  }
  await AuditLog.insertMany(auditDocs)
  console.log(`  ✓ ${auditDocs.length} audit log entries`)

  // FORM DRAFT
  await FormDraft.create({
    _id: randomUUID(), session_id: 'demo-draft-session',
    form_data: { name: 'Anjali Sharma', dob: '1998-04-12', phone: '9876543210', vehicle_class: 'LMV', digilocker_verified: true, digilocker_id: 'MOCK-DL-1001' },
    step: 3,
  })
  console.log('  ✓ Form draft (save-and-resume demo)')

  await mongoose.disconnect()
  console.log('\n✅ Seed complete! Run: npm run dev')
}

seed().catch(err => { console.error(err); process.exit(1) })
