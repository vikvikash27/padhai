'use client'

import dynamic from 'next/dynamic'

const GoalsGrid = dynamic(
  () => import('@/components/dashboard/goals-grid').then(mod => mod.GoalsGrid),
  {
    ssr: false,
    loading: () => (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-10 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
)

export { GoalsGrid }