'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, BookOpen, CheckCircle, AlertCircle, Sparkles, Flame, Check } from 'lucide-react'
import { checkTodayStatus, logStudySession } from '@/app/dashboard/check-in/actions'

const checkInSchema = z.object({
  goalId: z.string().uuid('Please select an active goal'),
  hours: z.number().positive('Hours must be a positive number'),
  notes: z.string().optional(),
})

type CheckInValues = z.infer<typeof checkInSchema>

interface GoalItem {
  id: string
  title: string
}

interface DailyCheckinProps {
  goals: GoalItem[]
}

export function DailyCheckin({ goals }: DailyCheckinProps) {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loggedToday, setLoggedToday] = useState(false)
  const [todaySession, setTodaySession] = useState<any>(null)
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [studiedToday, setStudiedToday] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckInValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      hours: 1,
      notes: '',
    },
  })

  // Load status on init
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await checkTodayStatus()
        if (res?.loggedToday) {
          setLoggedToday(true)
          setTodaySession(res.session)
        }
      } catch (err) {
        console.error('Failed to load status:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  const onSubmit = async (data: CheckInValues) => {
    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await logStudySession(data)
      if (res?.error) {
        setErrorMsg(res.error)
        setSubmitting(false)
      } else {
        setSuccessMsg('Daily check-in logged successfully!')
        setLoggedToday(true)
        setTodaySession(res.session)
        // Auto trigger full page reload to sync streak count and state
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl animate-pulse flex flex-col items-center justify-center min-h-[220px]">
        <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-60" />

      {/* Brand Label */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
            Daily Check-in
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="p-3 mb-4 text-xs text-cyan-400 bg-cyan-950/30 border border-cyan-900/50 rounded-lg text-center animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-3.5 h-3.5" /> {successMsg}
        </div>
      )}

      {/* Error alert message */}
      {errorMsg && (
        <div className="p-3 mb-4 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center animate-fade-in flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
        </div>
      )}

      {/* Completed State */}
      {loggedToday ? (
        <div className="space-y-4 text-center py-4 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-cyan-950/30 border border-cyan-900/40 flex items-center justify-center text-cyan-400 mb-2">
            <CheckCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Check-in Logged
            </h4>
            <p className="text-zinc-400 text-xs max-w-xs">
              Nice work! You verified {todaySession?.hours || 0} hours of study for today's targets.
            </p>
          </div>
          {todaySession?.notes && (
            <div className="mt-2 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl text-left w-full max-w-xs text-xs italic text-zinc-400">
              "{todaySession.notes}"
            </div>
          )}
        </div>
      ) : (
        /* Form State */
        <div className="space-y-6">
          {!studiedToday ? (
            /* Toggle Panel */
            <div className="flex flex-col items-center py-6 text-center space-y-4">
              <p className="text-zinc-300 text-sm font-medium">
                Have you logged any focus time or studied today?
              </p>
              <button
                onClick={() => setStudiedToday(true)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-zinc-100/5 cursor-pointer"
              >
                Yes, check in
              </button>
            </div>
          ) : (
            /* Detailed inputs form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
              {/* Select Active Goal */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Select Target Goal
                </label>
                <select
                  {...register('goalId')}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  <option value="">Select a Goal...</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                {errors.goalId && (
                  <p className="text-[10px] text-red-400 mt-1">{errors.goalId.message}</p>
                )}
              </div>

              {/* Hours Studied */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Hours Studied
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    {...register('hours', { valueAsNumber: true })}
                    placeholder="e.g. 2"
                    disabled={submitting}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                {errors.hours && (
                  <p className="text-[10px] text-red-400 mt-1">{errors.hours.message}</p>
                )}
              </div>

              {/* Notes Reflection */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Reflection / Notes
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-zinc-500">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <textarea
                    rows={2}
                    {...register('notes')}
                    placeholder="What did you get done today? Any insights?"
                    disabled={submitting}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStudiedToday(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-xs tracking-wide transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Log Check-in'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
