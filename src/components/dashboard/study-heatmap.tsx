'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { format, subDays, addDays } from 'date-fns'

interface Session {
  session_date: string
  hours: number
  notes?: string | null
}

interface StudyHeatmapProps {
  sessions: Session[]
}

interface DayPopoverData {
  dateKey: string
  formattedDate: string
  hours: number
  notes: string[]
  anchorRect: DOMRect
}

export function StudyHeatmap({ sessions }: StudyHeatmapProps) {
  const weeks = 24
  const daysPerWeek = 7
  const [popover, setPopover] = useState<DayPopoverData | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

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

  // Map study sessions by date — hours summed, notes collected as a list
  const sessionsMap = React.useMemo(() => {
    const map: Record<string, { hours: number; notes: string[] }> = {}
    if (!sessions) return map
    sessions.forEach(s => {
      const dateKey = s.session_date.slice(0, 10)
      if (!map[dateKey]) {
        map[dateKey] = { hours: 0, notes: [] }
      }
      map[dateKey].hours += s.hours
      if (s.notes && s.notes.trim()) {
        map[dateKey].notes.push(s.notes.trim())
      }
    })
    return map
  }, [sessions])

  // Create grid matrix (7 rows for days of week, 24 columns for weeks)
  const grid = React.useMemo(() =>
    Array.from({ length: daysPerWeek }, (_, dayIdx) => {
      return Array.from({ length: weeks }, (_, weekIdx) => {
        const cellDate = addDays(startSunday, weekIdx * 7 + dayIdx)
        const dateKey = format(cellDate, 'yyyy-MM-dd')
        const isFuture = cellDate > today
        const data = sessionsMap[dateKey]
        const hours = data?.hours || 0
        const notes = data?.notes || []
        return {
          dateKey,
          hours,
          notes,
          isFuture,
          formattedDate: cellDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        }
      })
    })
  , [daysPerWeek, weeks, startSunday, sessionsMap, today])

  const closePopover = useCallback(() => {
    setPopover(null)
  }, [])

  // Close on click outside
  useEffect(() => {
    if (!popover) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopover()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [popover, closePopover])

  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>, cell: { dateKey: string; formattedDate: string; hours: number; notes: string[]; isFuture: boolean }) => {
    if (cell.isFuture) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPopover({
      dateKey: cell.dateKey,
      formattedDate: cell.formattedDate,
      hours: cell.hours,
      notes: cell.notes,
      anchorRect: rect
    })
  }

  // Compute popover position relative to viewport
  const getPopoverStyle = (): React.CSSProperties => {
    if (!popover) return { display: 'none' }
    const gap = 10
    const popW = 260
    const popH = 180
    const vw = window.innerWidth
    const vh = window.innerHeight
    const r = popover.anchorRect

    let left: number
    let top: number

    // Try placing below the cell, centered horizontally
    left = r.left + r.width / 2 - popW / 2
    top = r.bottom + gap

    // If overflows right edge, shift left
    if (left + popW > vw - 8) left = vw - 8 - popW
    // If overflows left edge, shift right
    if (left < 8) left = 8
    // If overflows bottom, show above instead
    if (top + popH > vh - 8) {
      top = r.top - gap - popH
      if (top < 8) top = 8
    }

    return {
      position: 'fixed',
      left,
      top,
      width: popW,
      zIndex: 50,
    }
  }

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
                  onClick={(e) => handleCellClick(e, cell)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Day Notes Popover */}
      {popover && (
        <div
          ref={popoverRef}
          style={getPopoverStyle()}
          className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-2xl shadow-black/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-100">{popover.formattedDate}</span>
            <button
              onClick={closePopover}
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none p-0.5"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Study Time</span>
            <span className="text-zinc-200 text-sm font-semibold">{popover.hours.toFixed(1)}h</span>
          </div>

          <div className="border-t border-zinc-700/60 pt-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1.5">Notes</span>
            {popover.notes.length > 0 ? (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {popover.notes.map((note, i) => (
                  <p key={i} className="text-xs text-zinc-300 leading-relaxed break-words">
                    {note}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No notes for this day</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
