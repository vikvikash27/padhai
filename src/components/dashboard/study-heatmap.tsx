'use client'

import React from 'react'
import { format, subDays, addDays } from 'date-fns'

interface Session {
  session_date: string
  hours: number
}

interface StudyHeatmapProps {
  sessions: Session[]
}

export function StudyHeatmap({ sessions }: StudyHeatmapProps) {
  const weeks = 24
  const daysPerWeek = 7
  
  // Custom weights for activity representation
  const getActivityColor = (hours: number, isFuture: boolean) => {
    if (isFuture) return 'bg-zinc-950/20 border border-zinc-900/20 opacity-30 cursor-default'
    if (hours === 0) return 'bg-zinc-955 border border-zinc-900 hover:bg-zinc-900/60'
    if (hours <= 1) return 'bg-cyan-950/50 border border-cyan-900/30 hover:bg-cyan-950/80'
    if (hours <= 2) return 'bg-cyan-800/40 border border-cyan-700/30 hover:bg-cyan-800/70'
    if (hours <= 4) return 'bg-cyan-600/60 border border-cyan-500/30 hover:bg-cyan-600/90'
    return 'bg-cyan-400 border border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)] hover:bg-cyan-300'
  }

  const today = new Date()
  const currentSunday = subDays(today, today.getDay())
  const startSunday = subDays(currentSunday, (weeks - 1) * 7)

  // Map study sessions by date for fast lookup
  const sessionsMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    if (!sessions) return map
    sessions.forEach(s => {
      const dateKey = s.session_date.slice(0, 10)
      map[dateKey] = (map[dateKey] || 0) + s.hours
    })
    return map
  }, [sessions])

  // Create grid matrix (7 rows for days of week, 24 columns for weeks)
  const grid = Array.from({ length: daysPerWeek }, (_, dayIdx) => {
    return Array.from({ length: weeks }, (_, weekIdx) => {
      const cellDate = addDays(startSunday, weekIdx * 7 + dayIdx)
      const dateKey = format(cellDate, 'yyyy-MM-dd')
      const isFuture = cellDate > today
      const hours = sessionsMap[dateKey] || 0
      return {
        dateKey,
        hours,
        isFuture,
        formattedDate: cellDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
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
          <div className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
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
                  className={`w-3.5 h-3.5 rounded transition-all duration-200 cursor-pointer ${getActivityColor(cell.hours, cell.isFuture)}`}
                  title={cell.isFuture ? 'Future' : `${cell.formattedDate}: ${cell.hours.toFixed(1)} hours`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

