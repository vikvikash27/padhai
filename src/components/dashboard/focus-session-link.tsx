'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function FocusSessionLink() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (loading) return
    setLoading(true)
    router.push('/dashboard/focus')
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Start Focus Session
        </>
      )}
    </button>
  )
}
