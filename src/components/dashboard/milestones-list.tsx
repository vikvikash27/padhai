'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle, Target, LayoutGrid, List as ListIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toggleMilestone } from '@/app/dashboard/goals/actions'

export interface MilestoneItem {
  id: string
  title: string
  goal: string
  done: boolean
  completed_at?: string | null
}

export interface MilestonesListProps {
  milestones: MilestoneItem[]
}

export function MilestonesList({ milestones }: MilestonesListProps) {
  const router = useRouter()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')

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
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
            Upcoming Milestones
          </h3>
        </div>
        
        <div className="flex items-center gap-1 p-1 bg-zinc-950/60 rounded-lg border border-zinc-800">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-zinc-800 text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <ListIcon className="w-3 h-3" />
            List
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === 'board' 
                ? 'bg-zinc-800 text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            Board
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
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
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Pending Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Pending
            </h4>
            {milestones.filter(m => {
              const isDone = optimisticDone[m.id] !== undefined ? optimisticDone[m.id] : m.done
              return !isDone
            }).length === 0 ? (
              <p className="text-xs text-zinc-600 italic py-4 text-center">
                No pending milestones
              </p>
            ) : (
              milestones
                .filter(m => {
                  const isDone = optimisticDone[m.id] !== undefined ? optimisticDone[m.id] : m.done
                  return !isDone
                })
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggle(m.id, m.done)}
                    className="flex items-start gap-2 p-3 rounded-xl border bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-200 shadow-sm cursor-pointer transition-all hover:bg-zinc-900/40"
                  >
                    <Circle className="w-4 h-4 text-zinc-600 hover:text-cyan-400 transition-colors mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-normal text-zinc-200">
                        {m.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider font-semibold mt-1 block text-zinc-500">
                        {m.goal}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Completed Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 mb-2">
              Completed
            </h4>
            {milestones.filter(m => {
              const isDone = optimisticDone[m.id] !== undefined ? optimisticDone[m.id] : m.done
              return isDone
            }).length === 0 ? (
              <p className="text-xs text-zinc-600 italic py-4 text-center">
                No completed milestones yet
              </p>
            ) : (
              milestones
                .filter(m => {
                  const isDone = optimisticDone[m.id] !== undefined ? optimisticDone[m.id] : m.done
                  return isDone
                })
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggle(m.id, m.done)}
                    className="flex items-start gap-2 p-3 rounded-xl border bg-emerald-950/10 border-emerald-900/30 text-zinc-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.03)] cursor-pointer transition-all hover:bg-emerald-950/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.35)] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-normal line-through text-zinc-500/80 decoration-zinc-650">
                        {m.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500/70">
                          Completed
                        </span>
                        {m.completed_at && (
                          <span className="text-[10px] text-zinc-600">
                            {format(new Date(m.completed_at), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

