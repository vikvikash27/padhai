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

const ResourceSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  platform: z.string().min(1, 'Platform is required'),
  notes: z.string().optional().nullable(),
})

export type ResourceInput = z.infer<typeof ResourceSchema>

export async function createResource(input: ResourceInput) {
  const parsed = ResourceSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      user_id: user.id,
      goal_id: parsed.data.goalId,
      title: parsed.data.title,
      url: parsed.data.url,
      platform: parsed.data.platform,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, resource }
}

export async function deleteResource(id: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

const UpdateGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  durationDays: z.number().int().positive('Duration must be positive'),
  dailyTargetHours: z.number().positive('Daily target must be positive'),
})

export async function updateGoal(input: z.infer<typeof UpdateGoalSchema>) {
  const parsed = UpdateGoalSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('goals')
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      duration_days: parsed.data.durationDays,
      daily_target_hours: parsed.data.dailyTargetHours,
    })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateGoalNotes(goalId: string, notes: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('goals')
    .update({ notes })
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function toggleMilestone(milestoneId: string, isCompleted: boolean) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('milestones')
    .update({ 
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq('id', milestoneId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

