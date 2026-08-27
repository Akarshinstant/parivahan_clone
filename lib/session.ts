import { Role } from './types'

// Cookie-based mock session — no real auth
export const ROLES = ['citizen', 'officer', 'admin'] as const

export type MockSession = {
  role: Role
  officerId?: string
  officerName?: string
  citizenId?: string
  sessionId: string
}

export function getDefaultSession(): MockSession {
  return {
    role: 'citizen',
    sessionId: 'demo-session-001',
    citizenId: 'user-001',
  }
}

export const MOCK_OFFICERS = [
  { id: 'off-001', name: 'Rajesh Kumar', employee_id: 'KA-RTO-2847', district: 'Bengaluru Urban' },
  { id: 'off-002', name: 'Priya Nair', employee_id: 'KA-RTO-3912', district: 'Mysuru' },
  { id: 'off-003', name: 'Mohammed Irfan', employee_id: 'KA-RTO-4521', district: 'Hubli-Dharwad' },
]
