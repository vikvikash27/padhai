'use client'

import React from 'react'
import { Target, Calendar, Award, BookOpen, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Milestone {
  id: string
  title: string
  is_completed: boolean
}

interface Goal {
  id: string
  title: string
  description?: string
  duration_days: number
  daily_target_hours: number
  status: string
  created_at: string
  milestones: Milestone[]
}

interface GoalsGridProps {
  goals: Goal[] | null
}

export function GoalsGrid({ goals }: GoalsGridProps) {
  if (!goals || goals.length === 0) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
        <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-full text-cyan-400">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            No active targets
          </h3>
          <p className="text-zinc-500 text-xs max-w-sm">
            You don't have any active learning goals established. Create a new target goal and milestone pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/goals/new"
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
        >
          Establish Target Goal
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => {
        const totalMilestones = goal.milestones?.length || 0
        const completedMilestones = goal.milestones?.filter((m) => m.is_completed).length || 0
        const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
        const formattedDate = new Date(goal.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

        return (
          <div
            key={goal.id}
            className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700/80 transition-all group flex flex-col justify-between"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-60" />
            
            <div className="space-y-4">
              {/* Header info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                    {formattedDate}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mt-1 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {goal.title}
                  </h3>
                </div>
                <div className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-900/30 rounded-full text-[9px] font-semibold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Active
                </div>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-850/50 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{goal.duration_days} Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{goal.daily_target_hours} h/Day</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  {completedMilestones} of {totalMilestones} Milestones
                </span>
                <span className="text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
