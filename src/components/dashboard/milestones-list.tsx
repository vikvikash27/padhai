'use client'

import React from 'react'
import { CheckCircle2, Circle, Star, Target } from 'lucide-react'

const mockMilestones = [
  { id: '1', title: 'Complete Backpropagation math derivation', goal: 'Master Neural Networks', done: true },
  { id: '2', title: 'Implement dynamic layer array from scratch', goal: 'Master Neural Networks', done: false },
  { id: '3', title: 'Optimize parameters with custom Adam optimizer', goal: 'Master Neural Networks', done: false },
]

export function MilestonesList() {
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
        {mockMilestones.map((m) => (
          <div
            key={m.id}
            className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
              m.done
                ? 'bg-zinc-950/20 border-zinc-900 text-zinc-500'
                : 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-200'
            }`}
          >
            <div className="flex gap-3 items-start">
              <button className="mt-0.5 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer">
                {m.done ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              <div>
                <p className={`text-xs font-semibold ${m.done ? 'line-through' : ''}`}>
                  {m.title}
                </p>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5 block">
                  {m.done ? 'Completed' : m.goal}
                </span>
              </div>
            </div>
            
            {!m.done && (
              <Star className="w-3.5 h-3.5 text-zinc-650 hover:text-amber-400 transition-colors cursor-pointer" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
