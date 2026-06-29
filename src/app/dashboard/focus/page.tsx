import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getStreakSummary } from '@/lib/streak-service'
import { FocusMode } from '@/components/dashboard/focus-mode'

export const metadata = {
  title: 'Focus Study Mode | PadhAI',
  description: 'Distraction-free study workspace.',
}

export default async function FocusPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // Fetch active goals with milestones + resources
  const { data: goals } = await supabase
    .from('goals')
    .select('*, milestones(*), resources(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!goals || goals.length === 0) redirect('/dashboard')

  // Streak summary + today's check-in — run in parallel (non-fatal streak)
  const todayStr = new Date().toISOString().split('T')[0]
  let streak = { currentStreak: 0, longestStreak: 0, frozenToday: false, lastStudyDate: null as string | null }

  const [streakResult, todaySessionResult] = await Promise.all([
    getStreakSummary().catch(() => null),
    supabase
      .from('study_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_date', todayStr)
      .maybeSingle(),
  ])

  if (streakResult) {
    streak = {
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      frozenToday: streakResult.frozenToday,
      lastStudyDate: streakResult.lastStudyDate,
    }
  }

  const todaySession = todaySessionResult.data

  return (
    <FocusMode
      goals={goals}
      streak={streak}
      alreadyCheckedIn={!!todaySession}
    />
  )
}
