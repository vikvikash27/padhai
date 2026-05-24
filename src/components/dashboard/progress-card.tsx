'use client'

import React from 'react'
import { Sparkles, Trophy, BrainCircuit } from 'lucide-react'

export function ProgressCard() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-70" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            XP & Standing
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-100 mt-1">
            2,450 XP
          </h2>
        </div>
        <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl text-cyan-400">
          <BrainCircuit className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Level 8 — Scholar</span>
            <span className="text-zinc-200">75% to Level 9</span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Consistency Score
            </div>
            <div className="text-sm font-bold text-zinc-200 mt-0.5">
              94%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              Milestones Met
            </div>
            <div className="text-sm font-bold text-zinc-200 mt-0.5">
              18/24
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
