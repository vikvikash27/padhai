'use client'

import { Activity, Hourglass } from 'lucide-react'

export interface ActivityItem {
  id: string
  type: 'session' | 'milestone' | 'streak'
  detail: string
  time: string
}

export interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-60" />

      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Activity Log
        </h3>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-zinc-800">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-600 italic">
            No recent activity. Start a focus study session!
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex gap-4 relative items-start">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative z-10 shrink-0 ${
                act.type === 'session'
                  ? 'bg-purple-950/40 border border-purple-800/30 text-purple-400'
                  : act.type === 'milestone'
                  ? 'bg-cyan-950/40 border border-cyan-800/30 text-cyan-400'
                  : 'bg-orange-950/40 border border-orange-800/30 text-orange-400'
              }`}>
                <Hourglass className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-300">
                  {act.detail}
                </p>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  {act.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

