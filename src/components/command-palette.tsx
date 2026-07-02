'use client'

import React, { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Target, Settings, FileText, Loader } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<any[]>([])
  const router = useRouter()

  // Toggle on Cmd+K (Mac) / Ctrl+K (Windows)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Listen for custom trigger events from search inputs
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('open-command-palette', handleOpen)
    return () => window.removeEventListener('open-command-palette', handleOpen)
  }, [])

  // Fetch active goals/milestones client-side when palette is opened
  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    async function fetchGoals() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('goals')
          .select('id, title, milestones(id, title)')
          .order('created_at', { ascending: false })

        if (data) {
          setGoals(data)
        }
      } catch (err) {
        console.error('Command Palette Supabase Fetch Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [open])

  const runCommand = (command: () => void) => {
    command()
    setOpen(false)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      container={typeof document !== 'undefined' ? document.body : undefined}
    >
      <div className="w-full max-w-lg overflow-hidden border border-zinc-800 bg-zinc-950 rounded-2xl shadow-2xl relative flex flex-col">
        {/* Subtle top border gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 opacity-60" />
        
        {/* Scoped command palette styles */}
        <style>{`
          [data-selected="true"] {
            background-color: rgba(63, 63, 70, 0.25) !important; /* zinc-800/25 */
            color: rgb(244 244 245) !important; /* zinc-100 */
          }
          [data-selected="true"] svg {
            color: rgb(34 211 238) !important; /* cyan-400 */
          }
        `}</style>

        {/* Input area */}
        <div className="flex items-center border-b border-zinc-800/80 px-4 py-3.5 gap-3">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <Command.Input
            placeholder="Type a command or search target goals..."
            className="w-full bg-transparent text-xs placeholder-zinc-500 text-zinc-200 outline-none border-none"
          />
          {loading && <Loader className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900/60 px-1.5 font-mono text-[9px] font-medium text-zinc-500 leading-none shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <Command.List className="max-h-[320px] overflow-y-auto p-2 space-y-1">
          <Command.Empty className="py-6 text-center text-xs text-zinc-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation Actions" className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider px-3 py-1.5 mt-1">
            <Command.Item
              value="Go to Dashboard Workspace"
              onSelect={() => runCommand(() => router.push('/dashboard'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500 transition-colors" />
              Go to Dashboard
            </Command.Item>
            <Command.Item
              value="Go to New Target Establish Goal Goal"
              onSelect={() => runCommand(() => router.push('/dashboard/goals/new'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 cursor-pointer transition-colors"
            >
              <Target className="w-4 h-4 text-zinc-500 transition-colors" />
              Go to New Target
            </Command.Item>
            <Command.Item
              value="Go to Profile Settings Edit Profile"
              onSelect={() => runCommand(() => router.push('/dashboard/profile'))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-zinc-500 transition-colors" />
              Go to Profile Settings
            </Command.Item>
          </Command.Group>

          {goals.length > 0 && (
            <Command.Group heading="Target Goals & Milestones" className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider px-3 py-1.5 border-t border-zinc-900/60 mt-2 pt-2">
              {goals.map((goal) => (
                <React.Fragment key={goal.id}>
                  <Command.Item
                    value={`Focus Goal Target Blueprint: ${goal.title}`}
                    onSelect={() => runCommand(() => router.push(`/dashboard#goal-${goal.id}`))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-zinc-500 transition-colors" />
                    <span>Focus Blueprint: {goal.title}</span>
                  </Command.Item>
                  {goal.milestones?.map((milestone: any) => (
                    <Command.Item
                      key={milestone.id}
                      value={`Milestone: ${milestone.title} from ${goal.title}`}
                      onSelect={() => runCommand(() => router.push(`/dashboard#goal-${goal.id}`))}
                      className="flex items-center gap-3 pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium text-zinc-500 cursor-pointer transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                      <span className="truncate">Milestone: {milestone.title}</span>
                    </Command.Item>
                  ))}
                </React.Fragment>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  )
}
