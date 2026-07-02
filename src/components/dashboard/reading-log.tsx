'use client'

import React, { useState } from 'react'
import { Plus, X, BookOpen, ExternalLink } from 'lucide-react'
import { addReadingEntry } from '@/app/dashboard/reading-log/actions'

interface ReadingEntry {
  id: string
  title: string
  authors: string | null
  year: number | null
  takeaway: string | null
  created_at: string
  goal_id: string | null
}

interface ReadingLogProps {
  initialCount: number
  userGoals: { id: string; title: string }[]
  initialEntries?: ReadingEntry[]
}

export function ReadingLog({ initialCount, userGoals, initialEntries = [] }: ReadingLogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [entries, setEntries] = useState<ReadingEntry[]>(initialEntries)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [year, setYear] = useState('')
  const [takeaway, setTakeaway] = useState('')
  const [goalId, setGoalId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }

    setLoading(true)

    const result = await addReadingEntry({
      goalId: goalId || null,
      title: title.trim(),
      authors: authors.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      takeaway: takeaway.trim() || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setTitle('')
    setAuthors('')
    setYear('')
    setTakeaway('')
    setGoalId('')
    setCount((c) => c + 1)
    setEntries((prev) => [{
      id: Date.now().toString(),
      title: title.trim(),
      authors: authors.trim() || null,
      year: year ? parseInt(year) : null,
      takeaway: takeaway.trim() || null,
      created_at: new Date().toISOString(),
      goal_id: goalId || null,
    }, ...prev])
    setIsOpen(false)
    setLoading(false)
  }

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Reading Log
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-semibold">
            {count} paper{count === 1 ? '' : 's'}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isOpen ? 'Cancel' : 'Add Paper'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-3">
          <div>
            <input
              type="text"
              placeholder="Paper title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Authors (e.g. Goodfellow et al.)"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
            <input
              type="number"
              min="1900"
              max="2100"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <textarea
              rows={2}
              placeholder="One-line insight from this paper"
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
          <div>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">Link to goal (optional)</option>
              {userGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Paper'}
          </button>
        </form>
      )}

      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="p-3 bg-zinc-950/30 border border-zinc-800/60 rounded-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">{entry.title}</p>
                  {(entry.authors || entry.year) && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {entry.authors}{entry.authors && entry.year && ', '}{entry.year}
                    </p>
                  )}
                  {entry.takeaway && (
                    <p className="text-[11px] text-zinc-400 mt-1.5 italic line-clamp-2">"{entry.takeaway}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {entries.length > 5 && (
            <button className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1 transition-colors cursor-pointer">
              <ExternalLink className="w-3 h-3" /> View all ({entries.length})
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-zinc-600 text-center py-4">
          No papers logged yet. Add your first paper to start tracking your reading.
        </p>
      )}
    </div>
  )
}