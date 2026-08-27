/**
 * api-server.ts — Standalone Express API backend
 *
 * Runs independently of Next.js on port 4000 (API_PORT).
 * The Next.js frontend proxies /auth/* and /api/* to this server
 * via the rewrites in next.config.js (set API_URL=http://localhost:4000).
 *
 * Development (separated):
 *   Terminal 1: npx tsx api-server.ts     (backend, port 4000)
 *   Terminal 2: next dev                   (frontend, port 3000)
 *
 * Development (combined, easier):
 *   npx tsx server.ts                      (both, port 3000)
 */

// ── Load .env.local without dotenv dependency ─────────────────────────────────
import { readFileSync } from 'node:fs'
try {
  const raw = readFileSync('.env.local', 'utf-8')
  for (const line of raw.split('\n')) {
    const eq = line.indexOf('=')
    if (eq > 0 && !line.trimStart().startsWith('#')) {
      const key = line.slice(0, eq).trim()
      const val = line.slice(eq + 1).trim()
      if (key && !(key in process.env)) process.env[key] = val
    }
  }
} catch { /* .env.local absent — rely on real environment variables */ }

import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import { connectDb, AssistantSession, FormDraft, User, Application, AuditLog, Officer, TestSlot, FeedbackModel } from './lib/db'
import { callAssistant, getFallbackResponse } from './lib/openrouter'
import { REJECTION_MESSAGES } from './lib/types'

const API_PORT = parseInt(process.env.API_PORT || '4000', 10)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// ── Mock Users ────────────────────────────────────────────────────────────────

const MOCK_SSO_USERS = [
  { id: 'user-001', username: 'anjali.sharma',  password: 'demo123',    name: 'Anjali Sharma',         role: 'citizen', email: 'anjali.sharma@gmail.com',           phone: '9876543210', dob: '1995-04-12' },
  { id: 'user-002', username: 'ravi.obrien',    password: 'demo123',    name: "Ravi O'Brien",          role: 'citizen', email: 'ravi.obrien@gmail.com',             phone: '9845012345', dob: '1990-08-23' },
  { id: 'user-003', username: 'lakshmi.n',      password: 'demo123',    name: 'Lakshmi Narasimhan',    role: 'citizen', email: 'lakshmi.n@yahoo.com',              phone: '9731045678', dob: '1998-01-30' },
  { id: 'user-005', username: 'fatima.begum',   password: 'demo123',    name: 'Fatima Begum',          role: 'citizen', email: 'fatima.begum@gmail.com',            phone: '9632587410', dob: '1993-11-05' },
  { id: 'user-008', username: 'suresh.reddy',   password: 'demo123',    name: 'Suresh Reddy',          role: 'citizen', email: 'suresh.reddy@rediffmail.com',       phone: '9514785236', dob: '1988-06-17' },
  { id: 'off-001',  username: 'rajesh.kumar',   password: 'officer123', name: 'Rajesh Kumar',          role: 'officer', email: 'rajesh.kumar@karnataka.gov.in',     district: 'Bengaluru Urban', employeeId: 'KA-RTO-2847' },
  { id: 'off-002',  username: 'priya.nair',     password: 'officer123', name: 'Priya Nair',            role: 'officer', email: 'priya.nair@karnataka.gov.in',       district: 'Mysuru',          employeeId: 'KA-RTO-3912' },
  { id: 'off-003',  username: 'mohammed.irfan', password: 'officer123', name: 'Mohammed Irfan',        role: 'officer', email: 'mohammed.irfan@karnataka.gov.in',   district: 'Hubli-Dharwad',   employeeId: 'KA-RTO-4521' },
  { id: 'off-004',  username: 'sunita.rao',     password: 'officer123', name: 'Sunita Rao',            role: 'officer', email: 'sunita.rao@karnataka.gov.in',       district: 'Mangaluru',       employeeId: 'KA-RTO-5103' },
  { id: 'admin-001',username: 'admin',          password: 'admin@rto',  name: 'System Administrator',  role: 'admin',   email: 'admin@parivahan.gov.in' },
] as const

type MockUser = (typeof MOCK_SSO_USERS)[number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function setCookieOpts(secure: boolean) {
  return { httpOnly: false, maxAge: 8 * 60 * 60 * 1000, path: '/', sameSite: secure ? 'none' as const : 'lax' as const, secure }
}

function setAuthCookies(res: Response, user: MockUser) {
  const secure = process.env.NODE_ENV === 'production'
  const opts = setCookieOpts(secure)
  res.cookie('role',     user.role,                      opts)
  res.cookie('userId',   user.id,                        opts)
  res.cookie('userName', encodeURIComponent(user.name),  opts)
  if (user.role === 'officer') res.cookie('officerId', user.id, opts)
  else res.clearCookie('officerId')
}

function clearAuthCookies(res: Response) {
  ;['role','userId','officerId','userName','parivahan.session'].forEach(n => res.clearCookie(n))
}

function redirectAfterLogin(user: MockUser, redirectTo?: string): string {
  if (user.role === 'officer') return '/officer'
  if (user.role === 'admin')   return '/admin'
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') && redirectTo !== '/') return redirectTo
  return '/'
}

function draftSessionId(req: Request): string {
  const userId = (req.cookies as Record<string, string>).userId
  return userId ? `draft-${userId}` : 'draft-anonymous'
}

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; reasoning_details?: unknown }

// ── App ───────────────────────────────────────────────────────────────────────

const app = express()

// CORS — allow the Next.js frontend to call this API
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,   // allow cookies to be sent cross-origin
}))

app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'parivahan-demo-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'parivahan.session',
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'parivahan-api' }))

// ── Auth: Username / Password ─────────────────────────────────────────────────

app.post('/auth/login', (req, res) => {
  const { username, password, redirect_to } = req.body as { username: string; password: string; redirect_to?: string }
  const user = MOCK_SSO_USERS.find(u => u.username === username && u.password === password)
  if (!user) {
    const back = redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ''
    return res.redirect(`/login?error=invalid_credentials${back}`)
  }
  ;(req.session as any).user = { id: user.id, name: user.name, role: user.role }
  setAuthCookies(res, user)
  req.session.save(() => res.redirect(redirectAfterLogin(user, redirect_to)))
})

// ── Auth: DigiLocker email-based SSO ──────────────────────────────────────────

app.post('/auth/digilocker', (req, res) => {
  const { email, redirect_to } = req.body as { email?: string; redirect_to?: string }
  if (!email?.trim()) return res.redirect('/digilocker?error=no_email')
  const user = MOCK_SSO_USERS.find(u => (u as any).email?.toLowerCase() === email.trim().toLowerCase())
  if (!user) return res.redirect(`/digilocker?error=not_found&email=${encodeURIComponent(email.trim())}`)
  ;(req.session as any).user = { id: user.id, name: user.name, role: user.role }
  setAuthCookies(res, user)
  req.session.save(() => res.redirect(redirectAfterLogin(user, redirect_to)))
})

// ── Auth: Logout ──────────────────────────────────────────────────────────────

app.get('/auth/logout', async (req, res) => {
  const userId = (req.cookies as any).userId
  req.session.destroy(async () => {
    if (userId) {
      try {
        await connectDb()
        await FormDraft.deleteOne({ session_id: `draft-${userId}` })
      } catch { /* ignore */ }
    }
    clearAuthCookies(res)
    res.redirect('/login?msg=logged_out')
  })
})

// ── Auth: Status ──────────────────────────────────────────────────────────────

app.get('/auth/status', (req, res) => {
  const sessionUser = (req.session as any)?.user
  if (!sessionUser) return res.json({ authenticated: false, user: null })
  const fullUser = MOCK_SSO_USERS.find(u => u.id === sessionUser.id)
  res.json({
    authenticated: true,
    user: {
      ...sessionUser,
      dob:   (fullUser as any)?.dob   || '',
      phone: (fullUser as any)?.phone || '',
      email: (fullUser as any)?.email || '',
    },
  })
})

// ── API: AI Assistant ─────────────────────────────────────────────────────────

app.post('/api/assistant', async (req, res) => {
  const { message, sessionId = 'demo-assistant', language = 'en' } = req.body as {
    message: string; sessionId?: string; language?: string
  }

  let history: ChatMessage[] = []
  let dbAvailable = false
  try {
    await connectDb()
    const doc = await AssistantSession.findOne({ session_id: sessionId })
    history = (doc?.messages as ChatMessage[]) || []
    dbAvailable = true
  } catch { /* offline */ }

  const userMsg: ChatMessage = { role: 'user', content: message }
  const newHistory = [...history, userMsg]

  const apiKey = process.env.OPENROUTER_API_KEY
  let assistantMsg: ChatMessage
  let usingFallback = false

  if (apiKey) {
    try {
      assistantMsg = await callAssistant(newHistory, language) as ChatMessage
    } catch (e: any) {
      console.error('[AI ERROR]', e?.message)
      usingFallback = true
      assistantMsg = { role: 'assistant', content: getFallbackResponse(message, language as 'en' | 'hi' | 'kn') }
    }
  } else {
    usingFallback = true
    assistantMsg = { role: 'assistant', content: getFallbackResponse(message, language as 'en' | 'hi' | 'kn') }
  }

  const updatedHistory = [...newHistory, assistantMsg].slice(-20)
  if (dbAvailable) {
    try {
      await AssistantSession.findOneAndUpdate(
        { session_id: sessionId },
        { $set: { messages: updatedHistory, language, updated_at: new Date() }, $setOnInsert: { _id: randomUUID(), session_id: sessionId } },
        { upsert: true }
      )
    } catch { /* ignore */ }
  }

  res.json({ content: assistantMsg.content, usingFallback })
})

// ── API: Form Draft ───────────────────────────────────────────────────────────

app.get('/api/draft', async (req, res) => {
  try {
    await connectDb()
    const draft = await FormDraft.findOne({ session_id: draftSessionId(req) })
    if (!draft) return res.json({})
    res.json({ form_data: draft.form_data, step: draft.step })
  } catch { res.json({}) }
})

app.post('/api/draft', async (req, res) => {
  try {
    await connectDb()
    const sid = draftSessionId(req)
    const { form_data, step } = req.body as { form_data: unknown; step: number }
    await FormDraft.findOneAndUpdate(
      { session_id: sid },
      { $set: { form_data, step, updated_at: new Date() }, $setOnInsert: { _id: randomUUID(), session_id: sid } },
      { upsert: true }
    )
    res.json({ ok: true })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// ── API: Submit Application ───────────────────────────────────────────────────

app.post('/api/applications/submit', async (req, res) => {
  try {
    await connectDb()
    const { form_data } = req.body as { form_data: Record<string, unknown> }
    const appId    = `app-${Date.now().toString(36).toUpperCase()}`
    const paymentId = `PAY-MOCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const userId   = `user-new-${randomUUID().slice(0, 8)}`

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          name:     (form_data.name     as string) || 'Unknown',
          dob:      (form_data.dob      as string) || '',
          phone:    (form_data.phone    as string) || '',
          email:    (form_data.email    as string) || null,
          ...(form_data.digilocker_id ? { digilocker_id: form_data.digilocker_id as string } : {}),
          aadhaar_mock: (form_data.aadhaar_mock as string) || `MOCK-AADHAAR-NEW-${userId.slice(-4)}`,
          address:  (form_data.address  as string) || '',
          pincode:  (form_data.pincode  as string) || '',
          state:    'Karnataka',
        },
        $setOnInsert: { _id: userId },
      },
      { upsert: true }
    )

    await Application.create({ _id: appId, user_id: userId, status: 'submitted', form_data, payment_id: paymentId, payment_status: 'paid' })

    await AuditLog.create({
      _id: randomUUID(), application_id: appId, action: 'application_submitted',
      actor_type: 'citizen', actor_id: userId, notes: 'Application submitted with payment',
    })

    await FormDraft.deleteOne({ session_id: draftSessionId(req) })
    res.json({ id: appId, success: true })
  } catch (e: any) {
    console.error('[SUBMIT ERROR]', e?.message)
    res.status(500).json({ error: e?.message || 'Submission failed' })
  }
})

// ── API: Officer Claim ────────────────────────────────────────────────────────

app.post('/api/officer/claim', async (req, res) => {
  try {
    await connectDb()
    const { applicationId, officerId } = req.body as { applicationId: string; officerId: string }
    const updated = await Application.findOneAndUpdate(
      { _id: applicationId, status: 'submitted', claimed_by: null },
      { status: 'assigned', claimed_by: officerId, claimed_at: new Date(), updated_at: new Date() },
      { returnDocument: 'after' }
    )
    if (!updated) return res.json({ success: false, reason: 'already_claimed' })
    const officer = await Officer.findOne({ _id: officerId })
    await AuditLog.create({
      _id: randomUUID(), application_id: applicationId, action: 'application_claimed',
      actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district,
      notes: 'Officer claimed from statewide queue',
    })
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || 'Claim failed' }) }
})

// ── API: Officer Review ───────────────────────────────────────────────────────

app.post('/api/officer/review', async (req, res) => {
  try {
    await connectDb()
    const { applicationId, officerId, decision, rejectionCode, notes, slotId } = req.body as {
      applicationId: string; officerId: string; decision: string;
      rejectionCode?: string; notes?: string; slotId?: string
    }
    const officer = await Officer.findOne({ _id: officerId })
    const now = new Date()
    const oneHourAgo  = new Date(now.getTime() - 60 * 60 * 1000)
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)

    if (decision === 'approve') {
      await Application.findOneAndUpdate(
        { _id: applicationId, claimed_by: officerId },
        { status: 'test_scheduled', reviewed_at: now, test_slot_id: slotId, updated_at: now }
      )
      if (slotId) await TestSlot.findOneAndUpdate({ _id: slotId }, { application_id: applicationId })
      await AuditLog.insertMany([
        { _id: randomUUID(), application_id: applicationId, action: 'review_started',       actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, created_at: oneHourAgo },
        { _id: randomUUID(), application_id: applicationId, action: 'application_approved', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: 'All documents verified', created_at: now },
        { _id: randomUUID(), application_id: applicationId, action: 'test_slot_assigned',   actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: 'Test slot assigned at statewide track', created_at: now },
      ])
    } else if (decision === 'reject') {
      const rejMsg = REJECTION_MESSAGES[rejectionCode as keyof typeof REJECTION_MESSAGES]
      const reason  = rejMsg?.title || rejectionCode
      await Application.findOneAndUpdate(
        { _id: applicationId, claimed_by: officerId },
        { status: 'rejected', reviewed_at: now, rejection_reason: reason, rejection_code: rejectionCode, updated_at: now }
      )
      await AuditLog.insertMany([
        { _id: randomUUID(), application_id: applicationId, action: 'review_started',        actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, created_at: thirtyMinAgo },
        { _id: randomUUID(), application_id: applicationId, action: 'application_rejected',  actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: notes || reason, created_at: now },
      ])
    }
    res.json({ success: true })
  } catch (e: any) { res.status(500).json({ error: e?.message || 'Review failed' }) }
})

// ── Helpers: Feedback AI analysis ────────────────────────────────────────────

let jiraCounter = 1000 + Math.floor(Math.random() * 500)

function nextJiraId(): string {
  return `RTO-${++jiraCounter}`
}

async function analyzeFeedbackWithAI(type: string, title: string, description: string, pageUrl: string): Promise<Record<string, string> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  const prompt = `You are a product analyst for the Parivahan RTO digital portal (Indian government driving licence application system).

A user submitted the following feedback:
Type: ${type}
Title: ${title}
Description: ${description}
Page: ${pageUrl}

Analyze this feedback and respond ONLY with a valid JSON object (no markdown, no extra text) with exactly these fields:
{
  "root_cause": "<1-2 sentence diagnosis of the underlying technical or UX problem>",
  "severity": "<one of: critical | high | medium | low>",
  "category": "<one of: Form Validation | Document Upload | Payment Flow | Navigation | Performance | Content Clarity | Accessibility | Authentication | Status Tracking | Other>",
  "suggested_fix": "<1-2 sentence concrete action for the dev/design team>",
  "user_journey_impact": "<1 sentence on which step of the user journey is affected and how>"
}`

  try {
    const msg = await callAssistant([{ role: 'user', content: prompt }], 'en')
    const raw = (msg.content as string || '').trim()
    const jsonStr = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

// ── API: Feedback ─────────────────────────────────────────────────────────────

app.post('/api/feedback', async (req, res) => {
  try {
    await connectDb()
    const { type = 'general', title, description, page_url = '' } = req.body as {
      type?: string; title: string; description: string; page_url?: string
    }
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'title and description are required' })
    }

    const role = (req.cookies as Record<string, string>).role || null
    const jiraId = nextJiraId()
    const id = randomUUID()

    const aiAnalysis = await analyzeFeedbackWithAI(type, title.trim(), description.trim(), page_url).catch(() => null)

    await FeedbackModel.create({
      _id: id,
      type,
      title: title.trim(),
      description: description.trim(),
      page_url,
      user_role: role,
      ai_analysis: aiAnalysis,
      jira_ticket_id: jiraId,
      status: 'open',
    })

    res.json({ success: true, jira_ticket_id: jiraId, ai_analysis: aiAnalysis })
  } catch (e: any) {
    console.error('[FEEDBACK ERROR]', e?.message)
    res.status(500).json({ error: e?.message || 'Failed to submit feedback' })
  }
})

app.get('/api/feedback', async (req, res) => {
  try {
    await connectDb()
    const role = (req.cookies as Record<string, string>).role
    if (role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const items = await FeedbackModel.find({}).sort({ created_at: -1 }).limit(50).lean()
    res.json({ feedback: items })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch feedback' })
  }
})

app.patch('/api/feedback/:id/status', async (req, res) => {
  try {
    await connectDb()
    const role = (req.cookies as Record<string, string>).role
    if (role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const { status } = req.body as { status: string }
    await FeedbackModel.findOneAndUpdate({ _id: req.params.id }, { status })
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to update status' })
  }
})

// ── Start ─────────────────────────────────────────────────────────────────────

createServer(app).listen(API_PORT, () => {
  console.log(`\n  ✅  API server → http://localhost:${API_PORT}`)
  console.log(`  🌐  CORS origin → ${FRONTEND_URL}`)
  console.log(`  📦  MongoDB     → ${process.env.MONGODB_URI || 'mongodb://localhost:27017/parivahan-rto'}`)
  if (!process.env.OPENROUTER_API_KEY) console.log('  ⚠   OPENROUTER_API_KEY not set — AI assistant runs in fallback FAQ mode')
  console.log()
})
