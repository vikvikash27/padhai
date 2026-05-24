'use client'

import React from 'react'
import { Sparkles, BrainCircuit } from 'lucide-react'

export function QuoteWidget() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl col-span-1 lg:col-span-3">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500/20 via-transparent to-transparent opacity-60" />

      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-purple-400 shrink-0">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Focus Mantra
          </div>
          <p className="text-sm font-medium italic text-zinc-300 leading-relaxed">
            "One step, one study session, one milestone. Consistency is the compound interest of self-development."
          </p>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
            — PadhAI Mission Control
          </span>
        </div>
      </div>
    </div>
  )
}
