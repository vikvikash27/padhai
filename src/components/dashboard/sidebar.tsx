'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Calendar, Award, Settings, LogOut, Flame, Sparkles, X } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/goals/new', label: 'New Target', icon: Target },
  { href: '/dashboard/profile', label: 'Profile Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [streakCount, setStreakCount] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    async function fetchStreak() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle()
          
        if (data) {
          setStreakCount(data.current_streak)
        } else {
          setStreakCount(0)
        }
      } catch (err) {
        console.error('Sidebar streak fetch error:', err)
        setStreakCount(0)
      }
    }
    fetchStreak()

    const handleFocus = () => fetchStreak()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <>
      {/* Backdrop overlay behind the open sidebar on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
      <aside
        className={`w-64 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-start md:justify-between p-6 h-screen md:h-screen overflow-y-auto md:overflow-visible shrink-0 transition-all duration-300
          ${isOpen ? 'fixed z-50 top-0 left-0 h-full flex md:sticky md:z-30 md:top-0 md:h-screen md:overflow-visible' : 'hidden md:flex md:sticky md:top-0 md:h-screen'}
        `}
      >
      {/* Close button — mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-purple-500 to-blue-500 flex items-center justify-center text-zinc-900 font-black shadow-lg shadow-purple-500/20">
            P
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-wider text-zinc-100 uppercase">
              PadhAI
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Active Session
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-3 mb-3">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {item.label}
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </Link>
            )
          })}

          {/* Mobile-only Sign Out - below Profile Settings */}
          <form action={signOut} className="md:hidden mt-2 pt-2 border-t border-zinc-800">
            <button
              type="submit"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-950/10 rounded-xl text-sm font-medium transition-all cursor-pointer border border-transparent hover:border-red-950/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>

          {/* Mobile-only Daily Streak - below Sign Out */}
          <div className="md:hidden mt-3 pt-2 border-t border-zinc-800">
            <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <div className="text-xs font-semibold text-zinc-300">Daily Streak</div>
              </div>
              <div className="text-xs font-bold text-orange-400">
                {streakCount !== null ? `${streakCount} Day${streakCount === 1 ? '' : 's'}` : '...'}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Footer / Account section - hidden on mobile, shown on desktop */}
      <div className="hidden md:block space-y-4 mt-auto md:mt-0">
        <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <div className="text-xs font-semibold text-zinc-300">Daily Streak</div>
          </div>
          <div className="text-xs font-bold text-orange-400">
            {streakCount !== null ? `${streakCount} Day${streakCount === 1 ? '' : 's'}` : '...'}
          </div>
        </div>

        {/* Desktop-only Sign Out - hidden on mobile */}
        <form action={signOut} className="hidden md:flex">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-950/10 rounded-xl text-sm font-medium transition-all cursor-pointer border border-transparent hover:border-red-950/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
      </aside>
    </>
  )
}

