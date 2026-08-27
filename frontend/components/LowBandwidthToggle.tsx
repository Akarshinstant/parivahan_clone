'use client'
import { useEffect, useState } from 'react'

export function LowBandwidthToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('lowBandwidth') === 'true'
    setEnabled(stored)
    if (stored) document.body.classList.add('low-bw')
  }, [])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    localStorage.setItem('lowBandwidth', String(next))
    if (next) document.body.classList.add('low-bw')
    else document.body.classList.remove('low-bw')
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs px-2 py-1 rounded border transition-all ${enabled ? 'bg-amber-500 border-amber-400 text-white' : 'border-blue-400 text-blue-200 hover:bg-blue-800'}`}
      title={enabled ? 'Low-bandwidth mode ON — tap to disable' : 'Enable low-bandwidth mode'}
      aria-label={enabled ? 'Low-bandwidth mode enabled. Click to disable.' : 'Enable low-bandwidth mode for slow connections'}
      aria-pressed={enabled}
    >
      {enabled ? '📶 Low-BW' : '📶'}
    </button>
  )
}
