'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Flame, Target, Clock, ExternalLink, CheckCircle2, Circle,
  BookOpen, FileText, ArrowLeft, Play, Pause, RotateCcw,
  Zap, Trophy, Save, ChevronDown, ChevronUp
} from 'lucide-react'
import { logStudySession } from '@/app/dashboard/check-in/actions'
import { updateGoalNotes } from '@/app/dashboard/goals/actions'

interface Milestone { id: string; title: string; is_completed: boolean }
interface Resource { id: string; title: string; url: string; platform: string; notes?: string | null }
interface Goal {
  id: string; title: string; description?: string
  duration_days: number; daily_target_hours: number
  notes?: string | null
  milestones: Milestone[]; resources?: Resource[]
}

interface FocusModeProps {
  goals: Goal[]
  streak: { currentStreak: number; longestStreak: number; frozenToday: boolean; lastStudyDate: string | null }
  alreadyCheckedIn: boolean
}

// ── Timer hook ────────────────────────────────────────────────────────────────
function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      if (ref.current) clearInterval(ref.current)
    }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])

  const reset = () => { setSeconds(0); setRunning(false) }
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sc = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sc}`
  }

  return { seconds, running, setRunning, reset, fmt }
}

export function FocusMode({ goals, streak, alreadyCheckedIn }: FocusModeProps) {
  const router = useRouter()
  const timer = useTimer()

  // Active goal (default: first)
  const [goalIdx, setGoalIdx] = useState(0)
  const goal = goals[goalIdx]

  // Quick notes
  const [notesText, setNotesText] = useState(goal?.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [notesSaving, setNotesSaving] = useState(false)

  // Check-in
  const [sessionDone, setSessionDone] = useState(alreadyCheckedIn)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  // Sections expand/collapse
  const [showResources, setShowResources] = useState(true)
  const [showChecklist, setShowChecklist] = useState(true)

  // Sync notes when goal changes
  useEffect(() => {
    setNotesText(goal?.notes || '')
    setNotesSaved(false)
  }, [goalIdx])

  const handleSaveNotes = useCallback(async () => {
    if (!goal) return
    setNotesSaving(true)
    try {
      await updateGoalNotes(goal.id, notesText.trim())
      setNotesSaved(true)
    } catch {}
    setNotesSaving(false)
  }, [goal, notesText])

  const handleCompleteSession = async () => {
    if (sessionDone || !goal) return
    setCheckInLoading(true)
    setCheckInError(null)

    const hours = Math.max(0.1, Math.round((timer.seconds / 3600) * 10) / 10)
    const res = await logStudySession({
      goalId: goal.id,
      hours: hours > 0 ? hours : 0.5,
      notes: notesText.trim() || '',
    })

    if (res.error) {
      setCheckInError(res.error)
    } else {
      setSessionDone(true)
      timer.setRunning(false)
    }
    setCheckInLoading(false)
  }

  const hours = timer.seconds / 3600

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1f_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1f_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Focus Study Mode</div>
            <div className="text-sm font-bold text-zinc-100 mt-0.5 line-clamp-1">{goal?.title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-950/30 border border-orange-900/30 rounded-xl text-xs font-bold text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            {streak.currentStreak} Day Streak
          </div>

          {/* Goal switcher */}
          {goals.length > 1 && (
            <select
              value={goalIdx}
              onChange={(e) => setGoalIdx(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
            >
              {goals.map((g, i) => (
                <option key={g.id} value={i}>{g.title}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-auto">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 p-6 space-y-6 flex flex-col">

          {/* Timer Card */}
          <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 text-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 opacity-60" />
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Session Timer</div>
            <div className={`font-mono text-5xl font-extrabold tracking-tight tabular-nums ${timer.running ? 'text-cyan-400' : 'text-zinc-100'}`}>
              {timer.fmt(timer.seconds)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 font-semibold uppercase">
              {hours < 0.1 ? 'Starting up...' : `${hours.toFixed(1)} hours tracked`}
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => timer.setRunning(!timer.running)}
                disabled={sessionDone}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-40 ${
                  timer.running
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30'
                }`}
              >
                {timer.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timer.running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={timer.reset}
                disabled={sessionDone}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 border border-zinc-700 transition-all cursor-pointer disabled:opacity-40"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Goal overview */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Active Target Blueprint
            </div>
            <div className="font-bold text-zinc-100 text-base">{goal?.title}</div>
            {goal?.description && <p className="text-xs text-zinc-400 leading-relaxed">{goal.description}</p>}
            <div className="flex gap-4 text-[11px] text-zinc-500 font-semibold uppercase">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {goal?.daily_target_hours}h / day</span>
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {goal?.duration_days} day sprint</span>
            </div>
          </div>

          {/* Complete session button */}
          <div className="space-y-2">
            {checkInError && (
              <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-center">{checkInError}</div>
            )}
            {sessionDone ? (
              <div className="w-full py-4 bg-emerald-950/30 border border-emerald-900/30 rounded-2xl text-emerald-400 font-bold text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Session Logged — Great Work!
              </div>
            ) : (
              <button
                onClick={handleCompleteSession}
                disabled={checkInLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-2xl font-extrabold shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {checkInLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Zap className="w-5 h-5" /> Mark Session Complete</>
                )}
              </button>
            )}
            <p className="text-center text-[10px] text-zinc-600">
              {timer.seconds > 0
                ? `Will log ${Math.max(0.1, Math.round((timer.seconds / 3600) * 10) / 10).toFixed(1)}h to your streak`
                : 'Start the timer or click to log 0.5h manually'}
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-zinc-800/60 p-6 space-y-5 flex flex-col overflow-y-auto">

          {/* Resources */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowResources(!showResources)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Learning Resources</span>
              {showResources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showResources && (
              <div className="px-4 pb-4 space-y-2">
                {!goal?.resources || goal.resources.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 text-center py-3">No resources linked to this goal yet.</p>
                ) : (
                  goal.resources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-850/60 hover:border-cyan-900/40 hover:bg-zinc-950/80 transition-all group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">{r.platform}</div>
                        <div className="text-xs font-medium text-zinc-200 truncate mt-0.5 group-hover:text-cyan-400 transition-colors">{r.title}</div>
                        {r.notes && <div className="text-[9px] text-zinc-500 truncate mt-0.5">{r.notes}</div>}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 shrink-0 ml-3 transition-colors" />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Checklist / Milestones */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Milestones
                <span className="ml-1 px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] text-zinc-400">
                  {goal?.milestones?.filter(m => m.is_completed).length || 0} / {goal?.milestones?.length || 0}
                </span>
              </span>
              {showChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showChecklist && (
              <div className="px-4 pb-4 space-y-2 max-h-56 overflow-y-auto">
                {!goal?.milestones || goal.milestones.length === 0 ? (
                  <p className="text-[10px] text-zinc-600 text-center py-3">No milestones set for this goal.</p>
                ) : (
                  goal.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/30 border border-zinc-850/40 text-xs"
                    >
                      {m.is_completed
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        : <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />}
                      <span className={m.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}>{m.title}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quick Notes */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Session Notes
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={notesSaving}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-2.5 h-2.5" />
                {notesSaving ? 'Saving...' : notesSaved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <textarea
                rows={6}
                value={notesText}
                onChange={(e) => { setNotesText(e.target.value); setNotesSaved(false) }}
                placeholder={'Write session notes here...\n**bold** * bullet point'}
                className="w-full flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none font-mono leading-relaxed"
              />
              <div className="text-[9px] text-zinc-600 mt-2 font-semibold uppercase tracking-wide">
                Supports **bold** and * bullets • Saved to goal notes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
