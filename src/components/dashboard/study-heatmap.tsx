'use client'

import React from 'react'

export function StudyHeatmap() {
  // Generate mock grid for a few weeks of activity
  const weeks = 24
  const daysPerWeek = 7
  
  // Custom mock weights for activity representation
  const getActivityColor = (val: number) => {
    if (val === 0) return 'bg-zinc-950/80 border border-zinc-900/50 hover:bg-zinc-900/60'
    if (val === 1) return 'bg-cyan-950/40 border border-cyan-900/20 hover:bg-cyan-950/60'
    if (val === 2) return 'bg-cyan-800/40 border border-cyan-700/20 hover:bg-cyan-800/60'
    if (val === 3) return 'bg-cyan-600/60 border border-cyan-500/20 hover:bg-cyan-600/80'
    return 'bg-cyan-400 hover:bg-cyan-300'
  }

  // Create grid matrix
  const grid = Array.from({ length: daysPerWeek }, (_, dayIdx) => {
    return Array.from({ length: weeks }, (_, weekIdx) => {
      // Seed random weights for visual demo
      const seed = (dayIdx * 3 + weekIdx * 7) % 5
      return seed
    })
  })

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl col-span-1 lg:col-span-3">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-60" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
            Consistency Map
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Your study session frequency mapping across the current academic term
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-zinc-950 border border-zinc-900" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-950/40 border border-cyan-900/20" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-800/40 border border-cyan-700/20" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-600/60 border border-cyan-500/20" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-400" />
          <span>More</span>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-col gap-1.5 min-w-[500px]">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1.5 items-center">
              {/* Day indicator */}
              <span className="text-[9px] font-bold text-zinc-600 w-8 text-right pr-2 uppercase select-none">
                {rowIdx === 1 ? 'Tue' : rowIdx === 3 ? 'Thu' : rowIdx === 5 ? 'Sat' : ''}
              </span>
              
              {/* Heatmap cells */}
              {row.map((cell, cellIdx) => (
                <div
                  key={cellIdx}
                  className={`w-3.5 h-3.5 rounded transition-all duration-200 cursor-pointer ${getActivityColor(cell)}`}
                  title={`Activity weight: ${cell}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
