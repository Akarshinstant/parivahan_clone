'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'citizen' | 'officer' | 'admin'
const OFFICERS = [
  { id: 'off-001', name: 'Rajesh Kumar' },
  { id: 'off-002', name: 'Priya Nair' },
  { id: 'off-003', name: 'Mohammed Irfan' },
]

export function RoleSwitcher() {
  const [role, setRole] = useState<Role>('citizen')
  const [officerId, setOfficerId] = useState('off-001')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = document.cookie.match(/role=([^;]+)/)?.[1]
    if (stored) setRole(stored as Role)
    const oid = document.cookie.match(/officerId=([^;]+)/)?.[1]
    if (oid) setOfficerId(oid)
  }, [])

  function switchTo(r: Role, oid?: string) {
    document.cookie = `role=${r}; path=/; max-age=86400`
    if (oid) document.cookie = `officerId=${oid}; path=/; max-age=86400`
    setRole(r)
    if (oid) setOfficerId(oid)
    setOpen(false)
    if (r === 'officer') router.push('/officer')
    else if (r === 'admin') router.push('/admin')
    else router.push('/')
    router.refresh()
  }

  const roleColors: Record<Role, string> = {
    citizen: 'bg-green-600',
    officer: 'bg-blue-700',
    admin: 'bg-purple-700',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${roleColors[role]} text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5`}
        aria-label={`Current role: ${role}. Click to switch.`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="capitalize">{role}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          role="menu"
          aria-label="Switch role"
        >
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
            Demo Role Switcher
          </div>

          <button onClick={() => switchTo('citizen')} className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm flex items-center gap-3" role="menuitem">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <div>
              <div className="font-medium">Citizen</div>
              <div className="text-xs text-gray-500">Apply for licence, track status</div>
            </div>
          </button>

          <div className="border-t border-gray-100">
            <div className="px-3 py-1 text-xs text-gray-400">Officer login as:</div>
            {OFFICERS.map(o => (
              <button key={o.id} onClick={() => switchTo('officer', o.id)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex items-center gap-3" role="menuitem">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div>
                  <div className="font-medium">{o.name}</div>
                  <div className="text-xs text-gray-500">RTO Officer · Statewide queue</div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100">
            <button onClick={() => switchTo('admin')} className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm flex items-center gap-3" role="menuitem">
              <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
              <div>
                <div className="font-medium">Admin</div>
                <div className="text-xs text-gray-500">Dashboard · Metrics · Audit log</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />}
    </div>
  )
}
