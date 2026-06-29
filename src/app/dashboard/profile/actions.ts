'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
  fullName: string
  role: 'Student' | 'Professional'
  profession: string | null
  academicField: string | null
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      role: formData.role,
      profession: formData.role === 'Professional' ? formData.profession : null,
      academic_field: formData.role === 'Student' ? formData.academicField : null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Also update full_name in Auth Metadata so the rest of the application gets the updated name
  await supabase.auth.updateUser({
    data: {
      full_name: formData.fullName
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')

  return { success: true }
}
