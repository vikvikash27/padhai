'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleMilestone } from '@/app/dashboard/goals/actions'

export interface MilestoneItem {
  id: string
  title: string
  goal: string
  done: boolean
}

export interface MilestonesListProps {
  milestones: MilestoneItem[]
}

export function MilestonesList({ milestones }: MilestonesListProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>({})

  const handleToggle = async (milestoneId: string, currentStatus: boolean) => {
    const activeStatus = optimisticDone[milestoneId] !== undefined ? optimisticDone[milestoneId] : currentStatus
    const nextStatus = !activeStatus

    // Optimistically update UI state instantly
    setOptimisticDone((prev) => ({ ...prev, [milestoneId]: nextStatus }))
    setTogglingId(milestoneId)
    
    try {
      const res = await toggleMilestone(milestoneId, nextStatus)
      if (res.error) {
        alert(res.error)
        // Rollback state on error
        setOptimisticDone((prev) => ({ ...prev, [milestoneId]: activeStatus }))
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone')
      // Rollback state on error
      setOptimisticDone((prev) => ({ ...prev, [milestoneId]: activeStatus }))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl col-span-1 lg:col-span-2">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500/20 via-transparent to-transparent opacity-60" />
      
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Upcoming Milestones
        </h3>
      </div>

      <div className="space-y-3.5">
        {milestones.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-550 italic">
            All milestones checked off! Establish new target goals.
          </div>
        ) : (
          milestones.map((m) => {
            const isDone = optimisticDone[m.id] !== undefined ? optimisticDone[m.id] : m.done
            return (
              <div
                key={m.id}
                className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-950/10 border-emerald-900/30 text-zinc-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.03)]'
                    : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-200 shadow-sm'
                }`}
              >
                <div className="flex gap-3 items-start w-full">
                  <button
                    onClick={() => handleToggle(m.id, m.done)}
                    disabled={togglingId === m.id}
                    className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.35)]" />
                    ) : (
                      <Circle className="w-4 h-4 hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-normal transition-all duration-300 ${isDone ? 'line-through text-zinc-500/80 decoration-zinc-650' : 'text-zinc-200'}`}>
                      {m.title}
                    </p>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold mt-1 block transition-colors duration-300 ${isDone ? 'text-emerald-500/70 font-bold' : 'text-zinc-500'}`}>
                      {isDone ? '✓ Completed' : m.goal}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

