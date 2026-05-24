'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { updateStreakAfterCheckIn } from '@/lib/streak-service'

const StudySessionSchema = z.object({
  goalId: z.string().uuid('Please select a valid goal'),
  hours: z.number().positive('Hours must be a positive number'),
  notes: z.string().optional(),
})

export type StudySessionInput = z.infer<typeof StudySessionSchema>

export async function checkTodayStatus() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const { data: session, error } = await supabase
    .from('study_sessions')
    .select('*, goals(title)')
    .eq('user_id', user.id)
    .eq('session_date', todayStr)
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  return { loggedToday: !!session, session }
}

export async function logStudySession(input: StudySessionInput) {
  const parsed = StudySessionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  // Double check duplicates
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('session_date', todayStr)
    .maybeSingle()

  if (existing) {
    return { error: 'You have already completed your check-in for today.' }
  }

  // Insert Session
  const { data: newSession, error: insertError } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      goal_id: parsed.data.goalId,
      hours: parsed.data.hours,
      notes: parsed.data.notes || '',
      session_date: todayStr,
    })
    .select()
    .single()

  if (insertError || !newSession) {
    return { error: insertError?.message || 'Failed to save session' }
  }

  // Update streak atomically after the session is committed
  let streakResult = null
  try {
    streakResult = await updateStreakAfterCheckIn()
  } catch (err) {
    // Non-fatal: streak sync failure must not block the check-in
    console.error('Streak update failed:', err)
  }

  return { success: true, session: newSession, streak: streakResult }
}
