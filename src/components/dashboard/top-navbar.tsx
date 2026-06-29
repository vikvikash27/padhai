'use client'

import React from 'react'
import { Sparkles, Bell, Search, Plus, Menu } from 'lucide-react'
import Link from 'next/link'

export function TopNavbar() {
  const handleHamburgerClick = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-4 py-3 w-full sticky top-0 z-30">
      {/* Left Search / Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleHamburgerClick}
          className="p-2 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all cursor-pointer md:hidden flex items-center justify-center"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:flex items-center gap-4 w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dashboard, tasks, milestones..."
              className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs placeholder-zinc-500 text-zinc-300 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right User actions */}
      <div className="flex items-center gap-4">
        {/* Quote Widget inline preview */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-[10px] font-semibold text-zinc-400 max-w-sm italic">
          "Focus on the process, not the outcome."
        </div>

        <Link
          href="/dashboard/goals/new"
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md shadow-zinc-200/5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Establish Goal</span>
        </Link>

        {/* Notifications */}
        <button className="p-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all cursor-pointer shrink-0">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
