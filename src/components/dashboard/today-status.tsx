'use client'

import React from 'react'
import { Clock, Play, BookOpen } from 'lucide-react'

export function TodayStatus() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500/30 to-indigo-500/30 opacity-70" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Today's Progress
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-100 mt-1">
            1.5 / 3.0 h
          </h2>
        </div>
        <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-purple-400">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress ratio */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Daily study target</span>
            <span className="text-zinc-200">50% completed</span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>

        {/* Quick action button */}
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer">
          <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" /> Start Focus Session
        </button>
      </div>
    </div>
  )
}
