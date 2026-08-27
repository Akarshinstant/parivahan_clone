import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parivahan-rto'

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | null
}

let cached = global._mongooseConn

export async function connectDb(): Promise<typeof mongoose> {
  if (cached) return cached
  cached = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  global._mongooseConn = cached
  return cached
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  digilocker_id: { type: String, unique: true, sparse: true },
  aadhaar_mock: String,
  address: String,
  pincode: String,
  state: { type: String, default: 'Karnataka' },
  created_at: { type: Date, default: Date.now },
}, { _id: false })

const OfficerSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  employee_id: { type: String, unique: true, required: true },
  district: { type: String, required: true },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
}, { _id: false })

const TestTrackSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, default: 'Karnataka' },
  address: { type: String, required: true },
  total_slots: { type: Number, default: 10 },
  active: { type: Boolean, default: true },
}, { _id: false })

const TestSlotSchema = new mongoose.Schema({
  _id: String,
  track_id: { type: String, required: true },
  slot_date: { type: String, required: true },
  slot_time: { type: String, required: true },
  application_id: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
}, { _id: false })

const ApplicationSchema = new mongoose.Schema({
  _id: String,
  user_id: String,
  status: { type: String, default: 'submitted' },
  claimed_by: { type: String, default: null },
  claimed_at: { type: Date, default: null },
  reviewed_at: { type: Date, default: null },
  rejection_reason: { type: String, default: null },
  rejection_code: { type: String, default: null },
  test_slot_id: { type: String, default: null },
  form_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  payment_id: String,
  payment_status: { type: String, default: 'paid' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { _id: false })

ApplicationSchema.index({ status: 1 })
ApplicationSchema.index({ claimed_by: 1 })

const AuditLogSchema = new mongoose.Schema({
  _id: String,
  application_id: { type: String, required: true },
  action: { type: String, required: true },
  actor_type: { type: String, required: true },
  actor_id: { type: String, default: null },
  actor_name: { type: String, default: null },
  district: { type: String, default: null },
  notes: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
}, { _id: false })

AuditLogSchema.index({ application_id: 1 })
AuditLogSchema.index({ created_at: 1 })

const FormDraftSchema = new mongoose.Schema({
  _id: String,
  session_id: { type: String, unique: true, required: true },
  form_data: { type: mongoose.Schema.Types.Mixed, default: {} },
  step: { type: Number, default: 1 },
  updated_at: { type: Date, default: Date.now },
}, { _id: false })

const AssistantSessionSchema = new mongoose.Schema({
  _id: String,
  session_id: { type: String, unique: true, required: true },
  messages: { type: mongoose.Schema.Types.Mixed, default: [] },
  language: { type: String, default: 'en' },
  updated_at: { type: Date, default: Date.now },
}, { _id: false })

const FeedbackSchema = new mongoose.Schema({
  _id: String,
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  page_url: { type: String, default: '' },
  user_role: { type: String, default: null },
  ai_analysis: { type: mongoose.Schema.Types.Mixed, default: null },
  jira_ticket_id: { type: String, required: true },
  status: { type: String, default: 'open' },
  created_at: { type: Date, default: Date.now },
}, { _id: false })

FeedbackSchema.index({ created_at: -1 })
FeedbackSchema.index({ status: 1 })

// ── Models ───────────────────────────────────────────────────────────────────

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const Officer = mongoose.models.Officer || mongoose.model('Officer', OfficerSchema)
export const TestTrack = mongoose.models.TestTrack || mongoose.model('TestTrack', TestTrackSchema)
export const TestSlot = mongoose.models.TestSlot || mongoose.model('TestSlot', TestSlotSchema)
export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema)
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
export const FormDraft = mongoose.models.FormDraft || mongoose.model('FormDraft', FormDraftSchema)
export const AssistantSession = mongoose.models.AssistantSession || mongoose.model('AssistantSession', AssistantSessionSchema)
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema)
