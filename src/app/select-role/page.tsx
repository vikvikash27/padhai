'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Briefcase, Sparkles, Flame } from 'lucide-react'

export default function SelectRolePage() {
  const router = useRouter()

  const handleSelectRole = (role: 'Student' | 'Professional') => {
    // Set cookie
    document.cookie = `padhai_selected_role=${role}; path=/; max-age=3600; SameSite=Lax`
    // Redirect to login/register
    router.push('/login')
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
      </header>

      {/* Main Flow Section */}
      <main className="flex-1 w-full flex items-center justify-center z-10 px-4">
        <div className="relative w-full max-w-lg border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 opacity-60" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Initialize onboarding
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Choose your path</h1>
            <p className="text-xs text-zinc-400 mt-2">
              Select your current path to customize your learning environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectRole('Student')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-purple-500/50 hover:text-purple-300 transition-all cursor-pointer group"
            >
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:text-purple-400 transition-colors">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="block text-base font-bold text-zinc-100">Student</span>
                <span className="block text-xs text-zinc-500 mt-1">School, College, or Academics</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectRole('Professional')}
              className="flex flex-col items-center gap-4 p-6 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-purple-500/50 hover:text-purple-300 transition-all cursor-pointer group"
            >
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:text-purple-400 transition-colors">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="block text-base font-bold text-zinc-100">Professional</span>
                <span className="block text-xs text-zinc-500 mt-1">Job, Career, or Industry</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="relative w-full max-w-6xl px-6 py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/60 z-10">
        &copy; {new Date().getFullYear()} PadhAI. Quiet mission control center for personal growth.
      </footer>
    </div>
  )
}
