import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { Flame } from 'lucide-react'

export const metadata = {
  title: 'Setup Your Learning Habit | PadhAI',
  description: 'Initiate your first study goals and build a consistent learning streak with PadhAI.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Skip onboarding for existing users who completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Dynamic Grid Background Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative w-full max-w-6xl px-6 py-6 flex items-center justify-between border-b border-zinc-900/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-900/25">
            <Flame className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold tracking-wider text-white text-lg">Padh<span className="text-cyan-400">AI</span></span>
        </div>
        
        <div className="text-xs text-zinc-500 font-semibold tracking-wide flex items-center gap-2">
          Signed in as <span className="text-zinc-300 font-bold">{user.email}</span>
        </div>
      </header>

      {/* Main Flow Section */}
      <main className="flex-1 w-full flex items-center justify-center z-10">
        <OnboardingFlow />
      </main>

      {/* Footer bar */}
      <footer className="relative w-full max-w-6xl px-6 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/60 z-10">
        &copy; {new Date().getFullYear()} PadhAI. Quiet mission control center for personal growth.
      </footer>
    </div>
  )
}
