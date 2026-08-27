import { NextResponse } from 'next/server'
import { connectDb, User, Officer, Application, AuditLog, TestSlot, TestTrack, FormDraft, AssistantSession } from '@/lib/db'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }
  try {
    const { execSync } = await import('child_process')
    execSync('npx tsx scripts/seed.ts', { stdio: 'inherit', cwd: process.cwd() })
    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  await connectDb()
  const [users, officers, applications, audit_log, test_slots] = await Promise.all([
    User.countDocuments(),
    Officer.countDocuments(),
    Application.countDocuments(),
    AuditLog.countDocuments(),
    TestSlot.countDocuments(),
  ])
  return NextResponse.json({ counts: { users, officers, applications, audit_log, test_slots } })
}
