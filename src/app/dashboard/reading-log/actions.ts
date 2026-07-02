'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const ReadingEntrySchema = z.object({
  goalId: z.string().uuid().nullable(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  authors: z.string().optional(),
  year: z.number().min(1900).max(2100).optional(),
  takeaway: z.string().optional(),
})

export async function addReadingEntry(input: z.infer<typeof ReadingEntrySchema>) {
  const parsed = ReadingEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error: insertError } = await supabase
    .from('reading_log')
    .insert({
      user_id: user.id,
      goal_id: parsed.data.goalId,
      title: parsed.data.title,
      authors: parsed.data.authors || null,
      year: parsed.data.year || null,
      takeaway: parsed.data.takeaway || null,
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { success: true }
}

export async function fetchReadingLog() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('reading_log')
    .select('id, title, authors, year, takeaway, created_at, goal_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchReadingLog error:', error)
    return []
  }

  return data || []
}

export async function fetchReadingCount() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return 0
  }

  const { count, error } = await supabase
    .from('reading_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('fetchReadingCount error:', error)
    return 0
  }

  return count ?? 0
}