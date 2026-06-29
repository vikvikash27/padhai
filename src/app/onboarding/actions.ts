'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const OnboardingSchema = z.object({
  title: z.string().min(3, 'Learning goal must be at least 3 characters'),
  durationDays: z.number().int().positive('Duration must be a positive number'),
  dailyTargetHours: z.number().positive('Daily target must be a positive number'),
  milestones: z.array(z.string().min(1, 'Milestone cannot be empty')).min(2, 'Must add at least two milestones'),
  reminderStyle: z.enum(['gentle', 'accountability', 'comeback']),
  motivationStyle: z.enum(['calm', 'motivational', 'competitive', 'stoic']),
  role: z.enum(['Student', 'Professional']),
  profession: z.string().optional().nullable(),
  academicField: z.string().optional().nullable(),
})

export type OnboardingInput = z.infer<typeof OnboardingSchema>

export async function completeOnboarding(input: OnboardingInput) {
  const parsed = OnboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthenticated user. Please log in.' }
  }

  // 1. Insert first Goal
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: `My learning goal started during onboarding. Style: ${parsed.data.motivationStyle}.`,
      duration_days: parsed.data.durationDays,
      daily_target_hours: parsed.data.dailyTargetHours,
      status: 'active',
    })
    .select()
    .single()

  if (goalError || !goal) {
    return { error: goalError?.message || 'Failed to create your learning goal.' }
  }

  // 2. Insert Milestones
  const milestoneData = parsed.data.milestones.map((mTitle) => ({
    goal_id: goal.id,
    title: mTitle,
    is_completed: false,
  }))

  const { error: milestonesError } = await supabase
    .from('milestones')
    .insert(milestoneData)

  if (milestonesError) {
    return { error: milestonesError.message || 'Failed to initialize your milestones.' }
  }

  // 3. Update or create user profile record in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      role: parsed.data.role,
      profession: parsed.data.role === 'Professional' ? parsed.data.profession : null,
      academic_field: parsed.data.role === 'Student' ? parsed.data.academicField : null,
      onboarding_completed: true,
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Failed to update profile record:', profileError.message)
    return { error: 'Failed to complete profile configuration in database: ' + profileError.message }
  }

  // 4. Update Supabase Auth User Metadata to mark onboarding as completed and save preferences
  const { error: userUpdateError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      reminder_style: parsed.data.reminderStyle,
      motivation_style: parsed.data.motivationStyle,
      onboarding_completed_at: new Date().toISOString(),
    }
  })

  if (userUpdateError) {
    console.error('Failed to update user auth metadata:', userUpdateError.message)
    // Non-fatal, as long as the Goal & Milestones are created in the database,
    // the user will naturally bypass onboarding on subsequent checks anyway.
  }

  return { success: true }
}
