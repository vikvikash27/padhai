'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const GoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  durationDays: z.number().int().positive('Duration must be positive'),
  dailyTargetHours: z.number().positive('Daily target must be positive'),
  milestones: z.array(z.string().min(1, 'Milestone cannot be empty')).min(1, 'Must add at least one milestone'),
})

export type GoalInput = z.infer<typeof GoalSchema>

export async function createGoal(input: GoalInput) {
  const parsed = GoalSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Insert Goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      duration_days: parsed.data.durationDays,
      daily_target_hours: parsed.data.dailyTargetHours,
    })
    .select()
    .single()

  if (goalError || !goal) {
    return { error: goalError?.message || 'Failed to create goal' }
  }

  // Insert Milestones
  if (parsed.data.milestones && parsed.data.milestones.length > 0) {
    const milestoneData = parsed.data.milestones.map((mTitle) => ({
      goal_id: goal.id,
      title: mTitle,
      is_completed: false,
    }))

    const { error: milestoneError } = await supabase
      .from('milestones')
      .insert(milestoneData)

    if (milestoneError) {
      return { error: milestoneError.message || 'Failed to create milestones' }
    }
  }

  return { success: true, goalId: goal.id }
}
