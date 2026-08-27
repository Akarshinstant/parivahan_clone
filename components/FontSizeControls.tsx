'use client'
import { useEffect, useState } from 'react'

const SIZES = [14, 16, 18] // px — small, default, large
const DEFAULT_IDX = 1

export function FontSizeControls() {
  const [idx, setIdx] = useState(DEFAULT_IDX)

  // Apply persisted preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('font-size-idx')
    const i = saved !== null ? parseInt(saved, 10) : DEFAULT_IDX
    const clamped = Math.max(0, Math.min(SIZES.length - 1, i))
    setIdx(clamped)
    document.documentElement.style.fontSize = `${SIZES[clamped]}px`
  }, [])

  function apply(newIdx: number) {
    setIdx(newIdx)
    document.documentElement.style.fontSize = `${SIZES[newIdx]}px`
    localStorage.setItem('font-size-idx', String(newIdx))
  }

  return (
    <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
      <button
        onClick={() => apply(Math.max(0, idx - 1))}
        disabled={idx === 0}
        className="w-5 h-5 bg-gray-700 hover:bg-gray-500 disabled:opacity-40 text-white rounded text-xs leading-none"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button
        onClick={() => apply(DEFAULT_IDX)}
        className={`w-6 h-5 rounded text-xs leading-none font-semibold text-white ${idx === DEFAULT_IDX ? 'bg-gov-blue' : 'bg-gray-700 hover:bg-gray-500'}`}
        aria-label="Default font size"
      >
        A
      </button>
      <button
        onClick={() => apply(Math.min(SIZES.length - 1, idx + 1))}
        disabled={idx === SIZES.length - 1}
        className="w-5 h-5 bg-gray-700 hover:bg-gray-500 disabled:opacity-40 text-white rounded text-xs leading-none"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  )
}
