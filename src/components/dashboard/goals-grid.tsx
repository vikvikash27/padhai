'use client'

import React, { useState } from 'react'
import { Target, Calendar, Award, BookOpen, Clock, Sparkles, ExternalLink, Plus, Trash2, Pencil, Trash, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createResource, deleteResource, updateGoal, deleteGoal, updateGoalNotes } from '@/app/dashboard/goals/actions'

interface Milestone {
  id: string
  title: string
  is_completed: boolean
}

interface Resource {
  id: string
  title: string
  url: string
  platform: string
  notes?: string | null
}

interface Goal {
  id: string
  title: string
  description?: string
  duration_days: number
  daily_target_hours: number
  status: string
  created_at: string
  notes?: string | null
  milestones: Milestone[]
  resources?: Resource[]
}

interface GoalsGridProps {
  goals: Goal[] | null
}

export function GoalsGrid({ goals }: GoalsGridProps) {
  const router = useRouter()
  
  // Resource states
  const [activeFormGoalId, setActiveFormGoalId] = useState<string | null>(null)
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourcePlatform, setResourcePlatform] = useState('YouTube')
  const [resourceNotes, setResourceNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAddResource = async (goalId: string) => {
    if (!resourceTitle.trim()) {
      setErrorMsg('Title is required')
      return
    }
    if (!resourceUrl.trim()) {
      setErrorMsg('URL is required')
      return
    }
    
    // Ensure URL has protocol
    let finalUrl = resourceUrl.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await createResource({
        goalId,
        title: resourceTitle.trim(),
        url: finalUrl,
        platform: resourcePlatform,
        notes: resourceNotes.trim() || null,
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setResourceTitle('')
        setResourceUrl('')
        setResourcePlatform('YouTube')
        setResourceNotes('')
        setActiveFormGoalId(null)
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this learning resource?')) return
    try {
      await deleteResource(id)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  const getPlatformBadge = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes('youtube')) return 'bg-red-500/10 border-red-500/20 text-red-400'
    if (p.includes('coursera')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    if (p.includes('udemy')) return 'bg-purple-500/10 border-purple-500/20 text-purple-400'
    if (p.includes('edx')) return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    if (p.includes('doc')) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    if (p.includes('article') || p.includes('blog')) return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    if (p.includes('pdf')) return 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
  }

  // Goal Edit states
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDuration, setEditDuration] = useState<number>(60)
  const [editDailyTarget, setEditDailyTarget] = useState<number>(2)
  const [editLoading, setEditLoading] = useState(false)

  const handleEditClick = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setEditTitle(goal.title)
    setEditDescription(goal.description || '')
    setEditDuration(goal.duration_days)
    setEditDailyTarget(goal.daily_target_hours)
    setErrorMsg(null)
  }

  const handleUpdateGoal = async (goalId: string) => {
    if (!editTitle.trim()) {
      alert('Title is required')
      return
    }
    setEditLoading(true)
    try {
      const res = await updateGoal({
        id: goalId,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        durationDays: editDuration,
        dailyTargetHours: editDailyTarget,
      })

      if (res.error) {
        alert(res.error)
      } else {
        setEditingGoalId(null)
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this learning target and all its milestones/resources? This cannot be undone.')) return
    try {
      const res = await deleteGoal(goalId)
      if (res.error) {
        alert(res.error)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  // Notes states
  const [editingNotesGoalId, setEditingNotesGoalId] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)

  const handleSaveNotes = async (goalId: string) => {
    setNotesLoading(true)
    try {
      const res = await updateGoalNotes(goalId, notesText.trim())
      if (res.error) {
        alert(res.error)
      } else {
        setEditingNotesGoalId(null)
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setNotesLoading(false)
    }
  }

  const renderNotes = (text: string) => {
    if (!text) return <p className="text-zinc-650 italic text-[10px]">No blueprint notes saved. Click Edit Notes to add summaries or study plans.</p>
    
    const lines = text.split('\n')
    return (
      <div className="space-y-1 text-[11px] text-zinc-300 leading-relaxed break-words font-sans">
        {lines.map((line, i) => {
          let cleanLine = line.trim()
          
          // Render bullet points
          const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ')
          if (isBullet) {
            cleanLine = cleanLine.substring(2)
          }
          
          // Render Bold text (**text**)
          const boldRegex = /\*\*(.*?)\*\*/g
          const parts = []
          let lastIndex = 0
          let match
          while ((match = boldRegex.exec(cleanLine)) !== null) {
            if (match.index > lastIndex) {
              parts.push(cleanLine.substring(lastIndex, match.index))
            }
            parts.push(<strong key={match.index} className="text-cyan-400 font-bold">{match[1]}</strong>)
            lastIndex = boldRegex.lastIndex
          }
          if (lastIndex < cleanLine.length) {
            parts.push(cleanLine.substring(lastIndex))
          }
          
          const content = parts.length > 0 ? parts : cleanLine
          
          if (isBullet) {
            return (
              <li key={i} className="list-disc list-inside ml-1 text-zinc-300">
                {content}
              </li>
            )
          }
          
          if (cleanLine === '') {
            return <div key={i} className="h-1.5" />
          }
          
          return <p key={i}>{content}</p>
        })}
      </div>
    )
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
        <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-full text-cyan-400">
          <Target className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            No active targets
          </h3>
          <p className="text-zinc-500 text-xs max-w-sm">
            You don't have any active learning goals established. Create a new target goal and milestone pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/goals/new"
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer"
        >
          Establish Target Goal
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => {
        const totalMilestones = goal.milestones?.length || 0
        const completedMilestones = goal.milestones?.filter((m) => m.is_completed).length || 0
        const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
        const formattedDate = new Date(goal.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

        return (
          <div
            key={goal.id}
            className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl hover:border-zinc-700/80 transition-all group flex flex-col justify-between"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent opacity-60" />
            
            <div className="space-y-4">
              {/* Header info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                    {formattedDate}
                  </div>
                  {editingGoalId !== goal.id && (
                    <h3 className="text-lg font-bold text-zinc-100 mt-1 tracking-tight group-hover:text-cyan-400 transition-colors">
                      {goal.title}
                    </h3>
                  )}
                </div>
                {editingGoalId !== goal.id && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(goal)}
                      className="p-1 text-zinc-500 hover:text-cyan-400 bg-zinc-950/40 border border-zinc-800/80 hover:border-cyan-900/30 rounded transition-all cursor-pointer"
                      title="Edit target goal"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-950/40 border border-zinc-800/80 hover:border-red-900/30 rounded transition-all cursor-pointer"
                      title="Delete target goal"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                    <div className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-900/30 rounded-full text-[9px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Active
                    </div>
                  </div>
                )}
              </div>

              {editingGoalId === goal.id ? (
                /* Inline Edit Form */
                <div className="space-y-3 p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-xl text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Goal Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Target (Hours/Day)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editDailyTarget}
                        onChange={(e) => setEditDailyTarget(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateGoal(goal.id)}
                      disabled={editLoading}
                      className="flex-1 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg cursor-pointer"
                    >
                      {editLoading ? 'Saving...' : 'Save Updates'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGoalId(null)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular displays */
                <>
                  {/* Description */}
                  {goal.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-850/50 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{goal.duration_days} Days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{goal.daily_target_hours} h/Day</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  {completedMilestones} of {totalMilestones} Milestones
                </span>
                <span className="text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Learning Resources */}
            <div className="mt-6 border-t border-zinc-850/50 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Learning Resources
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormGoalId === goal.id) {
                      setActiveFormGoalId(null)
                    } else {
                      setActiveFormGoalId(goal.id)
                      setResourceTitle('')
                      setResourceUrl('')
                      setResourcePlatform('YouTube')
                      setResourceNotes('')
                      setErrorMsg(null)
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[10px] font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {activeFormGoalId === goal.id ? 'Cancel' : 'Add Link'}
                </button>
              </div>

              {/* Add Resource Mini-Form */}
              {activeFormGoalId === goal.id && (
                <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-2.5 text-xs">
                  {errorMsg && <div className="text-[10px] text-red-400">{errorMsg}</div>}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js Docs"
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Platform</label>
                      <select
                        value={resourcePlatform}
                        onChange={(e) => setResourcePlatform(e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
                      >
                        <option value="YouTube">YouTube</option>
                        <option value="Coursera">Coursera</option>
                        <option value="Udemy">Udemy</option>
                        <option value="edX">edX</option>
                        <option value="Docs">Docs</option>
                        <option value="Article">Article</option>
                        <option value="PDF">PDF</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase mb-1">Optional Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Focus on Chapter 3"
                      value={resourceNotes}
                      onChange={(e) => setResourceNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddResource(goal.id)}
                    disabled={loading}
                    className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50 text-center"
                  >
                    {loading ? 'Saving...' : 'Save Resource Link'}
                  </button>
                </div>
              )}

              {/* Resource List */}
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {!goal.resources || goal.resources.length === 0 ? (
                  <div className="text-center py-3 text-[10px] text-zinc-600 bg-zinc-950/20 border border-zinc-900/60 rounded-xl">
                    No resources saved yet. Keep course links here.
                  </div>
                ) : (
                  goal.resources.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/30 border border-zinc-850/60 text-xs hover:border-zinc-800 transition-colors group/res"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 ${getPlatformBadge(res.platform)}`}>
                          {res.platform}
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium text-zinc-200 truncate block text-[11px]" title={res.title}>
                            {res.title}
                          </span>
                          {res.notes && (
                            <span className="text-[9px] text-zinc-500 truncate block" title={res.notes}>
                              {res.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-zinc-400 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded transition-all flex items-center justify-center cursor-pointer"
                          title="Open resource in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(res.id)}
                          className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover/res:opacity-100 focus:opacity-100"
                          title="Remove resource"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6 border-t border-zinc-850/50 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Target Notes
                </span>
                {editingNotesGoalId !== goal.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotesGoalId(goal.id)
                      setNotesText(goal.notes || '')
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[10px] font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                  >
                    Edit Notes
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingNotesGoalId(null)}
                    className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[10px] font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {editingNotesGoalId === goal.id ? (
                /* Notes Editor Mode */
                <div className="space-y-2 text-xs">
                  <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider flex justify-between">
                    <span>Markdown Formatting:</span>
                    <span>**bold** &bull; * bullet</span>
                  </div>
                  <textarea
                    rows={4}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Document links, tips, core equations or task steps here..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-200 placeholder-zinc-750 focus:outline-none focus:border-cyan-500/80 text-xs font-sans resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveNotes(goal.id)}
                    disabled={notesLoading}
                    className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs"
                  >
                    {notesLoading ? 'Saving Notes...' : 'Save Blueprint Notes'}
                  </button>
                </div>
              ) : (
                /* Notes Display Mode */
                <div className="p-3 bg-zinc-950/40 border border-zinc-850/50 rounded-xl max-h-[140px] overflow-y-auto pr-1">
                  {renderNotes(goal.notes || '')}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
