'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Calendar, Award, Settings, LogOut, Flame, Sparkles } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/goals/new', label: 'New Target', icon: Target },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0">
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
        </nav>
      </div>

      {/* Footer / Account section */}
      <div className="space-y-4">
        <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <div className="text-xs font-semibold text-zinc-300">Daily Streak</div>
          </div>
          <div className="text-xs font-bold text-orange-400">12 Days</div>
        </div>

        <form action={signOut}>
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
  )
}
