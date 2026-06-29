import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'
import { EditProfileForm } from '@/components/dashboard/edit-profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch current profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If profile doesn't exist, redirect to onboarding to set up
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-2xl w-full mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              Profile Settings
            </h1>
            <p className="text-xs text-zinc-400">
              Update your personal details, role classification, and career/academic alignment.
            </p>
          </div>

          <EditProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
