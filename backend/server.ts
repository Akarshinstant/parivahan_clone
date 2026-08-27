// backend/server.ts — Express backend wrapping Next.js
// Backend: all auth + API routes live here (Express)
// Frontend: Next.js App Router pages live in ../frontend/

// Load backend env vars — tries cwd/.env.local (root in combined mode) then __dirname/.env.local (backend/ in standalone mode)
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
function loadEnvFile(filePath: string) {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    for (const line of raw.split('\n')) {
      const eq = line.indexOf('=')
      if (eq > 0 && !line.trimStart().startsWith('#')) {
        const key = line.slice(0, eq).trim()
        const val = line.slice(eq + 1).trim()
        if (key && !(key in process.env)) process.env[key] = val
      }
    }
    return true
  } catch { return false }
}
loadEnvFile('.env.local') || loadEnvFile(join(__dirname, '.env.local'))

import express, { Request, Response } from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const FRONTEND_DIR = path.resolve(__dirname, '../frontend')

const nextApp = next({ dev, hostname, port, dir: FRONTEND_DIR })
const handle = nextApp.getRequestHandler()

// ── Mock Users (production: DigiLocker / NIC eAuth) ──────────────────────────

const MOCK_SSO_USERS = [
  { id: 'user-001', username: 'anjali.sharma', password: 'demo123', name: 'Anjali Sharma', role: 'citizen', email: 'anjali.sharma@gmail.com', phone: '9876543210', dob: '1995-04-12' },
  { id: 'user-002', username: 'ravi.obrien', password: 'demo123', name: "Ravi O'Brien", role: 'citizen', email: 'ravi.obrien@gmail.com', phone: '9845012345', dob: '1990-08-23' },
  { id: 'user-003', username: 'lakshmi.n', password: 'demo123', name: 'Lakshmi Narasimhan', role: 'citizen', email: 'lakshmi.n@yahoo.com', phone: '9731045678', dob: '1998-01-30' },
  { id: 'user-005', username: 'fatima.begum', password: 'demo123', name: 'Fatima Begum', role: 'citizen', email: 'fatima.begum@gmail.com', phone: '9632587410', dob: '1993-11-05' },
  { id: 'user-008', username: 'suresh.reddy', password: 'demo123', name: 'Suresh Reddy', role: 'citizen', email: 'suresh.reddy@rediffmail.com', phone: '9514785236', dob: '1988-06-17' },
  { id: 'off-001', username: 'rajesh.kumar', password: 'officer123', name: 'Rajesh Kumar', role: 'officer', email: 'rajesh.kumar@karnataka.gov.in', district: 'Bengaluru Urban', employeeId: 'KA-RTO-2847' },
  { id: 'off-002', username: 'priya.nair', password: 'officer123', name: 'Priya Nair', role: 'officer', email: 'priya.nair@karnataka.gov.in', district: 'Mysuru', employeeId: 'KA-RTO-3912' },
  { id: 'off-003', username: 'mohammed.irfan', password: 'officer123', name: 'Mohammed Irfan', role: 'officer', email: 'mohammed.irfan@karnataka.gov.in', district: 'Hubli-Dharwad', employeeId: 'KA-RTO-4521' },
  { id: 'off-004', username: 'sunita.rao', password: 'officer123', name: 'Sunita Rao', role: 'officer', email: 'sunita.rao@karnataka.gov.in', district: 'Mangaluru', employeeId: 'KA-RTO-5103' },
  { id: 'admin-001', username: 'admin', password: 'admin@rto', name: 'System Administrator', role: 'admin', email: 'admin@parivahan.gov.in' },
] as const

type MockUser = (typeof MOCK_SSO_USERS)[number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function setAuthCookies(res: Response, user: MockUser) {
  const cookieOpts = { httpOnly: false, maxAge: 8 * 60 * 60 * 1000, path: '/' }
  res.cookie('role', user.role, cookieOpts)
  res.cookie('userId', user.id, cookieOpts)
  res.cookie('userName', encodeURIComponent(user.name), cookieOpts)
  if (user.role === 'officer') {
    res.cookie('officerId', user.id, cookieOpts)
  } else {
    res.clearCookie('officerId')
  }
}

function clearAuthCookies(res: Response) {
  res.clearCookie('role')
  res.clearCookie('userId')
  res.clearCookie('officerId')
  res.clearCookie('userName')
  res.clearCookie('parivahan.session')
}

function redirectAfterLogin(user: MockUser, redirectTo?: string): string {
  // Officers and admins always go to their own portals — ignore redirect_to
  if (user.role === 'officer') return '/officer'
  if (user.role === 'admin') return '/admin'
  // Citizens: use redirect_to if it's a non-root safe path
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') && redirectTo !== '/') {
    return redirectTo
  }
  return '/'
}

// ── Server bootstrap ──────────────────────────────────────────────────────────

nextApp.prepare().then(async () => {
  // In dev: auto-start in-memory MongoDB — no local MongoDB install required
  if (dev) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const mongod = await MongoMemoryServer.create()
    process.env.MONGODB_URI = mongod.getUri('parivahan-rto')
    console.log('  ⚡ In-memory MongoDB ready')
    // Auto-seed mock data into the fresh DB
    const { execSync } = await import('node:child_process')
    try {
      console.log('  ⚡ Seeding mock data…')
      execSync(`npx tsx ${path.resolve(__dirname, 'scripts/seed.ts')}`, { env: { ...process.env }, stdio: 'inherit' })
    } catch { console.warn('  ⚠ Seed script failed — continuing without mock data') }
  }

  // Lazy-import lib modules after Next.js has loaded .env.local into process.env
  const { connectDb, AssistantSession, FormDraft, User, Application, AuditLog, Officer, TestSlot, FeedbackModel, TestTrack } = await import('./lib/db')
  const { callAssistant, getFallbackResponse } = await import('./lib/openrouter')
  const { REJECTION_MESSAGES } = await import('./lib/types')
  type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; reasoning_details?: unknown }

  // ── Feedback AI analysis helper ───────────────────────────────────────────

  let jiraCounter = 1000 + Math.floor(Math.random() * 500)
  function nextJiraId() { return `RTO-${++jiraCounter}` }

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
      const msg = await callAssistant([{ role: 'user', content: prompt }], 'en') as ChatMessage
      const raw = (msg.content || '').trim()
      const jsonStr = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    } catch { return null }
  }

  const server = express()

  server.use(cookieParser())
  server.use(session({
    secret: process.env.SESSION_SECRET || 'parivahan-demo-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 8 * 60 * 60 * 1000 },
    name: 'parivahan.session',
  }))
  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  // ── Auth: Username / Password ─────────────────────────────────────────────

  server.post('/auth/login', (req, res) => {
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

  // ── Auth: DigiLocker email-based SSO ─────────────────────────────────────

  server.post('/auth/digilocker', (req, res) => {
    const { email, redirect_to } = req.body as { email?: string; redirect_to?: string }
    if (!email?.trim()) return res.redirect('/digilocker?error=no_email')
    const user = MOCK_SSO_USERS.find(u => 'email' in u && (u as any).email?.toLowerCase() === email.trim().toLowerCase())
    if (!user) {
      return res.redirect(`/digilocker?error=not_found&email=${encodeURIComponent(email.trim())}`)
    }
    ;(req.session as any).user = { id: user.id, name: user.name, role: user.role }
    setAuthCookies(res, user)
    req.session.save(() => res.redirect(redirectAfterLogin(user, redirect_to)))
  })

  // ── Auth: Logout ──────────────────────────────────────────────────────────

  server.get('/auth/logout', async (req, res) => {
    const userId = (req.cookies as any).userId
    req.session.destroy(async () => {
      // Clear the user's saved form draft on logout for a fresh start
      if (userId) {
        try {
          await connectDb()
          await FormDraft.deleteOne({ session_id: `draft-${userId}` })
        } catch { /* ignore if DB unavailable */ }
      }
      clearAuthCookies(res)
      res.redirect('/login?msg=logged_out')
    })
  })

  // ── Auth: Status (JSON) ───────────────────────────────────────────────────

  server.get('/auth/status', (req, res) => {
    const sessionUser = (req.session as any)?.user
    if (!sessionUser) return res.json({ authenticated: false, user: null })
    // Enrich with profile data from MOCK_SSO_USERS for form pre-fill
    const fullUser = MOCK_SSO_USERS.find(u => u.id === sessionUser.id)
    res.json({
      authenticated: true,
      user: {
        ...sessionUser,
        dob: (fullUser as any)?.dob || '',
        phone: (fullUser as any)?.phone || '',
        email: (fullUser as any)?.email || '',
      },
    })
  })

  // ── API: AI Assistant ─────────────────────────────────────────────────────

  server.post('/api/assistant', async (req, res) => {
    const { message, sessionId = 'demo-assistant', language = 'en' } = req.body as {
      message: string; sessionId?: string; language?: string
    }

    // Load history from MongoDB (optional — gracefully continues without it)
    let history: ChatMessage[] = []
    let dbAvailable = false
    try {
      await connectDb()
      const sessionDoc = await AssistantSession.findOne({ session_id: sessionId })
      history = (sessionDoc?.messages as ChatMessage[]) || []
      dbAvailable = true
    } catch { /* MongoDB not available — use empty history */ }

    const userMsg: ChatMessage = { role: 'user', content: message }
    const newHistory = [...history, userMsg]

    const apiKey = process.env.OPENROUTER_API_KEY
    let assistantMsg: ChatMessage
    let usingFallback = false

    if (apiKey) {
      try {
        assistantMsg = await callAssistant(newHistory, language) as ChatMessage
      } catch (aiErr: any) {
        console.error('[AI ERROR]', aiErr?.message || aiErr)
        usingFallback = true
        assistantMsg = { role: 'assistant', content: getFallbackResponse(message, language as 'en' | 'hi' | 'kn') }
      }
    } else {
      usingFallback = true
      assistantMsg = { role: 'assistant', content: getFallbackResponse(message, language as 'en' | 'hi' | 'kn') }
    }

    const updatedHistory = [...newHistory, assistantMsg].slice(-20)

    // Persist history (fixed _id immutability bug — use $set / $setOnInsert)
    if (dbAvailable) {
      try {
        await AssistantSession.findOneAndUpdate(
          { session_id: sessionId },
          {
            $set: { messages: updatedHistory, language, updated_at: new Date() },
            $setOnInsert: { _id: randomUUID(), session_id: sessionId },
          },
          { upsert: true }
        )
      } catch { /* ignore persistence error */ }
    }

    res.json({ content: assistantMsg.content, usingFallback })
  })

  // ── API: Form Draft (user-specific — keyed by userId cookie) ─────────────

  function draftSessionId(req: { cookies: Record<string, string> }): string {
    const userId = (req.cookies as any).userId
    return userId ? `draft-${userId}` : 'draft-anonymous'
  }

  server.get('/api/draft', async (req, res) => {
    try {
      await connectDb()
      const sessionId = draftSessionId(req as any)
      const draft = await FormDraft.findOne({ session_id: sessionId })
      if (!draft) return res.json({})
      res.json({ form_data: draft.form_data, step: draft.step })
    } catch {
      res.json({}) // graceful: return empty draft if DB unavailable
    }
  })

  server.post('/api/draft', async (req, res) => {
    try {
      await connectDb()
      const sessionId = draftSessionId(req as any)
      const { form_data, step } = req.body as { form_data: unknown; step: number }
      await FormDraft.findOneAndUpdate(
        { session_id: sessionId },
        {
          $set: { form_data, step, updated_at: new Date() },
          $setOnInsert: { _id: randomUUID(), session_id: sessionId },
        },
        { upsert: true }
      )
      res.json({ ok: true })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  })

  // ── API: Submit Application ───────────────────────────────────────────────

  server.post('/api/applications/submit', async (req, res) => {
    try {
      await connectDb()
      const { form_data } = req.body as { form_data: Record<string, unknown> }

      const appId = `app-${Date.now().toString(36).toUpperCase()}`
      const paymentId = `PAY-MOCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const userId = `user-new-${randomUUID().slice(0, 8)}`

      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            name: (form_data.name as string) || 'Unknown',
            dob: (form_data.dob as string) || '',
            phone: (form_data.phone as string) || '',
            email: (form_data.email as string) || null,
            // only set digilocker_id when it has a real value (sparse index may not be set up in DB)
            ...(form_data.digilocker_id ? { digilocker_id: form_data.digilocker_id as string } : {}),
            aadhaar_mock: (form_data.aadhaar_mock as string) || `MOCK-AADHAAR-NEW-${userId.slice(-4)}`,
            address: (form_data.address as string) || '',
            pincode: (form_data.pincode as string) || '',
            state: 'Karnataka',
          },
          $setOnInsert: { _id: userId },
        },
        { upsert: true }
      )

      await Application.create({
        _id: appId,
        user_id: userId,
        status: 'submitted',
        form_data,
        payment_id: paymentId,
        payment_status: 'paid',
      })

      await AuditLog.create({
        _id: randomUUID(),
        application_id: appId,
        action: 'application_submitted',
        actor_type: 'citizen',
        actor_id: userId,
        notes: 'Application submitted with payment',
      })

      await FormDraft.deleteOne({ session_id: draftSessionId(req as any) })

      res.json({ id: appId, success: true })
    } catch (e: any) {
      console.error('[SUBMIT ERROR]', e?.message)
      res.status(500).json({ error: e?.message || 'Submission failed' })
    }
  })

  // ── API: Officer Claim (optimistic lock) ──────────────────────────────────

  server.post('/api/officer/claim', async (req, res) => {
    try {
      await connectDb()
      const { applicationId, officerId } = req.body as { applicationId: string; officerId: string }

      const updated = await Application.findOneAndUpdate(
        { _id: applicationId, status: 'submitted', claimed_by: null },
        { status: 'assigned', claimed_by: officerId, claimed_at: new Date(), updated_at: new Date() },
        { returnDocument: 'after' }
      )

      if (!updated) {
        return res.json({ success: false, reason: 'already_claimed' })
      }

      const officer = await Officer.findOne({ _id: officerId })

      await AuditLog.create({
        _id: randomUUID(),
        application_id: applicationId,
        action: 'application_claimed',
        actor_type: 'officer',
        actor_id: officerId,
        actor_name: officer?.name,
        district: officer?.district,
        notes: 'Officer claimed from statewide queue',
      })

      res.json({ success: true })
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Claim failed' })
    }
  })

  // ── API: Officer Review (approve / reject) ────────────────────────────────

  server.post('/api/officer/review', async (req, res) => {
    try {
      await connectDb()
      const { applicationId, officerId, decision, rejectionCode, notes, slotId } = req.body as {
        applicationId: string; officerId: string; decision: string;
        rejectionCode?: string; notes?: string; slotId?: string
      }

      const officer = await Officer.findOne({ _id: officerId })
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000)

      if (decision === 'approve') {
        await Application.findOneAndUpdate(
          { _id: applicationId, claimed_by: officerId },
          { status: 'test_scheduled', reviewed_at: now, test_slot_id: slotId, updated_at: now }
        )

        if (slotId) {
          await TestSlot.findOneAndUpdate({ _id: slotId }, { application_id: applicationId })
        }

        await AuditLog.insertMany([
          { _id: randomUUID(), application_id: applicationId, action: 'review_started', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, created_at: oneHourAgo },
          { _id: randomUUID(), application_id: applicationId, action: 'application_approved', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: 'All documents verified', created_at: now },
          { _id: randomUUID(), application_id: applicationId, action: 'test_slot_assigned', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: 'Test slot assigned at statewide track', created_at: now },
        ])
      } else if (decision === 'reject') {
        const rejMsg = REJECTION_MESSAGES[rejectionCode as keyof typeof REJECTION_MESSAGES]
        const reason = rejMsg?.title || rejectionCode

        await Application.findOneAndUpdate(
          { _id: applicationId, claimed_by: officerId },
          { status: 'rejected', reviewed_at: now, rejection_reason: reason, rejection_code: rejectionCode, updated_at: now }
        )

        await AuditLog.insertMany([
          { _id: randomUUID(), application_id: applicationId, action: 'review_started', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, created_at: thirtyMinAgo },
          { _id: randomUUID(), application_id: applicationId, action: 'application_rejected', actor_type: 'officer', actor_id: officerId, actor_name: officer?.name, district: officer?.district, notes: notes || reason, created_at: now },
        ])
      }

      res.json({ success: true })
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Review failed' })
    }
  })

  // ── API: Seed (dev only) ────────────────────────────────────────────────────

  server.post('/api/seed', async (req, res) => {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed in production' })
    try {
      const { execSync } = await import('node:child_process')
      execSync(`npx tsx ${path.resolve(__dirname, 'scripts/seed.ts')}`, { stdio: 'inherit' })
      res.json({ success: true, message: 'Database seeded successfully' })
    } catch (e: any) { res.status(500).json({ error: (e as any).message }) }
  })

  server.get('/api/seed', async (req, res) => {
    try {
      await connectDb()
      const [users, officers, applications, audit_log, test_slots] = await Promise.all([
        User.countDocuments(), Officer.countDocuments(), Application.countDocuments(),
        AuditLog.countDocuments(), TestSlot.countDocuments(),
      ])
      res.json({ counts: { users, officers, applications, audit_log, test_slots } })
    } catch (e: any) { res.status(500).json({ error: (e as any).message }) }
  })

  // ── API: Data-fetching endpoints (used by Next.js server components) ────────

  server.get('/api/queue-count', async (req, res) => {
    try {
      await connectDb()
      const pending = await Application.countDocuments({ status: 'submitted' })
      res.json({ pending })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  server.get('/api/applications/my', async (req, res) => {
    try {
      await connectDb()
      const userId = (req.cookies as Record<string, string>).userId
      if (!userId) return res.status(401).json({ error: 'Not logged in' })
      const applications = await Application.find({ user_id: userId }).sort({ created_at: -1 }).lean()
      res.json({ applications })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  server.get('/api/applications/:id/detail', async (req, res) => {
    try {
      await connectDb()
      const app = await Application.findOne({ _id: req.params.id }).lean() as any
      if (!app) return res.status(404).json({ error: 'Not found' })
      const [user, slot, audit] = await Promise.all([
        User.findOne({ _id: app.user_id }).lean(),
        app.test_slot_id ? TestSlot.findOne({ _id: app.test_slot_id }).lean() : null,
        AuditLog.find({ application_id: req.params.id }).sort({ created_at: 1 }).lean(),
      ])
      const track = (slot as any)?.track_id ? await TestTrack.findOne({ _id: (slot as any).track_id }).lean() : null
      res.json({ application: app, user, slot, track, audit })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  server.get('/api/officer/queue', async (req, res) => {
    try {
      await connectDb()
      const officerId = (req.cookies as Record<string, string>).officerId || 'off-001'
      const officer = await Officer.findOne({ _id: officerId }).lean()
      const [queueApps, myClaimsApps, allClaimingCount] = await Promise.all([
        Application.find({ status: 'submitted' }).sort({ created_at: 1 }).lean(),
        Application.find({ claimed_by: officerId, status: { $in: ['assigned', 'under_review'] } }).sort({ claimed_at: -1 }).lean(),
        Application.countDocuments({ status: { $in: ['assigned', 'under_review'] } }),
      ])
      const userIds = Array.from(new Set([...queueApps.map((a: any) => a.user_id), ...myClaimsApps.map((a: any) => a.user_id)].filter(Boolean)))
      const users = await User.find({ _id: { $in: userIds } }).lean()
      const userMap = Object.fromEntries((users as any[]).map(u => [u._id, u]))
      const queue = (queueApps as any[]).map(a => ({ ...a, applicant_name: (userMap[a.user_id] as any)?.name || 'Unknown', dob: (userMap[a.user_id] as any)?.dob }))
      const myClaims = (myClaimsApps as any[]).map(a => ({ ...a, applicant_name: (userMap[a.user_id] as any)?.name || 'Unknown' }))
      res.json({ officer, queue, myClaims, allClaimingCount })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  server.get('/api/officer/applications/:id/review-data', async (req, res) => {
    try {
      await connectDb()
      const officerId = (req.cookies as Record<string, string>).officerId || 'off-001'
      const app = await Application.findOne({ _id: req.params.id }).lean() as any
      if (!app) return res.status(404).json({ error: 'Not found' })
      const [user, claimingOfficer, slot] = await Promise.all([
        User.findOne({ _id: app.user_id }).lean(),
        app.claimed_by ? Officer.findOne({ _id: app.claimed_by }).lean() : null,
        app.test_slot_id ? TestSlot.findOne({ _id: app.test_slot_id }).lean() : null,
      ])
      const track = (slot as any)?.track_id ? await TestTrack.findOne({ _id: (slot as any).track_id }).lean() : null
      const today = new Date().toISOString().split('T')[0]
      const availableSlots = await TestSlot.find({ application_id: null, slot_date: { $gte: today } }).sort({ slot_date: 1, slot_time: 1 }).limit(20).lean() as any[]
      const slotTrackIds = Array.from(new Set(availableSlots.map((s: any) => s.track_id)))
      const slotTracks = await TestTrack.find({ _id: { $in: slotTrackIds } }).lean() as any[]
      const trackMap = Object.fromEntries(slotTracks.map((t: any) => [t._id, t]))
      const slotsWithTrack = availableSlots.map((s: any) => ({ id: s._id, slot_date: s.slot_date, slot_time: s.slot_time, track_name: trackMap[s.track_id]?.name || '', district: trackMap[s.track_id]?.district || '', address: trackMap[s.track_id]?.address || '' }))
      res.json({ application: app, user, claimingOfficer, slot, track, slotsWithTrack, currentOfficerId: officerId })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  server.get('/api/admin/dashboard', async (req, res) => {
    try {
      await connectDb()
      const role = (req.cookies as Record<string, string>).role
      if (role !== 'admin') return res.status(403).json({ error: 'Admin only' })
      const [total, submitted, processing, approved, rejected, issued] = await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ status: 'submitted' }),
        Application.countDocuments({ status: { $in: ['assigned', 'under_review'] } }),
        Application.countDocuments({ status: { $in: ['approved', 'test_scheduled', 'licence_issued'] } }),
        Application.countDocuments({ status: 'rejected' }),
        Application.countDocuments({ status: 'licence_issued' }),
      ])
      const reviewedApps = await Application.find({ reviewed_at: { $ne: null } }, { created_at: 1, reviewed_at: 1 }).lean() as any[]
      const avgHours = reviewedApps.length > 0
        ? reviewedApps.reduce((sum: number, a: any) => sum + (new Date(a.reviewed_at).getTime() - new Date(a.created_at).getTime()) / 3_600_000, 0) / reviewedApps.length
        : 0
      const officers = await Officer.find({}).lean() as any[]
      const officerWorkload = await Promise.all(officers.map(async (o: any) => {
        const reviewed = await Application.find({ claimed_by: o._id, status: { $nin: ['submitted', 'assigned'] } }).lean() as any[]
        return { ...o, total_reviewed: reviewed.length, approved: reviewed.filter((a: any) => ['approved', 'test_scheduled', 'licence_issued'].includes(a.status)).length, rejected: reviewed.filter((a: any) => a.status === 'rejected').length }
      }))
      officerWorkload.sort((a: any, b: any) => b.total_reviewed - a.total_reviewed)
      const rejApps = await Application.find({ rejection_code: { $ne: null } }, { rejection_code: 1 }).lean() as any[]
      const rejCount: Record<string, number> = {}
      rejApps.forEach((a: any) => { rejCount[a.rejection_code] = (rejCount[a.rejection_code] || 0) + 1 })
      const rejectionReasons = Object.entries(rejCount).sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ rejection_code: code, count }))
      const auditLog = await AuditLog.find({}).sort({ created_at: -1 }).limit(20).lean()
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3_600_000)
      const stuckApps = await Application.find({ status: 'submitted', created_at: { $lt: threeDaysAgo } }).sort({ created_at: 1 }).lean() as any[]
      const stuckUserIds = stuckApps.map((a: any) => a.user_id).filter(Boolean)
      const stuckUsers = await User.find({ _id: { $in: stuckUserIds } }, { _id: 1, name: 1 }).lean() as any[]
      const stuckUserMap = Object.fromEntries(stuckUsers.map((u: any) => [u._id, u.name]))
      const stuck = stuckApps.map((a: any) => ({ ...a, name: stuckUserMap[a.user_id] || 'Unknown' }))
      const feedbackItems = await FeedbackModel.find({}).sort({ created_at: -1 }).limit(30).lean()
      res.json({ kpi: { total, submitted, processing, approved, rejected, issued }, avgHours, officerWorkload, rejectionReasons, auditLog, stuck, feedbackItems })
    } catch (e: any) { res.status(500).json({ error: e?.message }) }
  })

  // ── API: Feedback ─────────────────────────────────────────────────────────

  server.post('/api/feedback', async (req, res) => {
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
      const aiAnalysis = await analyzeFeedbackWithAI(type, title.trim(), description.trim(), page_url).catch(() => null)
      await FeedbackModel.create({
        _id: randomUUID(),
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

  server.get('/api/feedback', async (req, res) => {
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

  server.patch('/api/feedback/:id/status', async (req, res) => {
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

  // ── Next.js: all remaining requests ──────────────────────────────────────

  server.use((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const httpServer = createServer(server)
  httpServer.listen(port, () => {
    console.log(`\n  ✅  Backend  → http://${hostname}:${port}  (Express — auth + API)`)
    console.log(`  ✅  Frontend → http://${hostname}:${port}  (Next.js — pages)`)
    console.log(`  🔐  Login    → http://${hostname}:${port}/login`)
    console.log(`  🔒  DigiLocker → http://${hostname}:${port}/digilocker`)
    console.log(`  👮  Officer  → http://${hostname}:${port}/officer`)
    console.log(`  📊  Admin    → http://${hostname}:${port}/admin\n`)
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('  ⚠   OPENROUTER_API_KEY not set — AI assistant will use fallback FAQ mode\n')
    }
  })
}).catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
