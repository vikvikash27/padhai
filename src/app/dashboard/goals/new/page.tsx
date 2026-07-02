'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash, ArrowLeft, Target, Award, Sparkles, BookOpen, Clock, Calendar, GraduationCap, Briefcase, Binary, Cloud, Code2, Server } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createGoal } from '@/app/dashboard/goals/actions'
import { goalTemplates, getTemplateIcon } from '@/lib/goal-templates'

const goalFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  durationDays: z.number().int().positive('Duration must be positive'),
  dailyTargetHours: z.number().positive('Daily target must be positive'),
  milestones: z.array(
    z.object({
      title: z.string().min(1, 'Milestone title cannot be empty'),
    })
  ).min(1, 'Add at least one milestone'),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

export default function NewGoalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role) {
        setUserRole(data.role)
      }
    }
    fetchUserRole()
  }, [])

  const visibleTemplates = goalTemplates.filter(t =>
    t.role === 'Both' || t.role === userRole
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      durationDays: 30,
      dailyTargetHours: 2,
      milestones: [{ title: 'Initial setup & planning' }],
    },
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'milestones',
  })

  const applyTemplate = (template: typeof goalTemplates[0]) => {
    setValue('title', template.name)
    setValue('description', template.description)
    setValue('durationDays', template.durationDays)
    setValue('dailyTargetHours', template.dailyTargetHours)
    replace(template.milestones.map((m) => ({ title: m })))
    setSelectedTemplate(template.id)
  }

  const resetToBlank = () => {
    setValue('title', '')
    setValue('description', '')
    setValue('durationDays', 30)
    setValue('dailyTargetHours', 2)
    replace([{ title: '' }])
    setSelectedTemplate(null)
  }

  const onSubmit = async (data: GoalFormValues) => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const payload = {
      title: data.title,
      description: data.description,
      durationDays: data.durationDays,
      dailyTargetHours: data.dailyTargetHours,
      milestones: data.milestones.map((m) => m.title),
    }

    try {
      const res = await createGoal(payload)
      if (res?.error) {
        setErrorMsg(res.error)
        setLoading(false)
      } else {
        setSuccessMsg('Goal successfully established!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Back navigation button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>

        {/* Form Container */}
        <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl relative overflow-hidden p-8 space-y-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-blue-500/50 opacity-80" />
          
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/30 rounded-full text-[10px] font-semibold text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> New Target
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 mt-2">
              Establish Learning Goal
            </h1>
            <p className="text-zinc-400 text-sm">
              Define your academic or skill acquisition mission and milestone pipeline
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-cyan-400 bg-cyan-950/30 border border-cyan-900/50 rounded-lg text-center animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* Template Gallery */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Start from a template
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 flex-nowrap">
              {/* Start Blank Card */}
              <button
                type="button"
                onClick={resetToBlank}
                className={`flex-shrink-0 w-36 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTemplate === null
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold">Start blank</p>
                <p className="text-[10px] text-zinc-500 mt-1">Custom goal</p>
              </button>

              {/* Template Cards */}
              {visibleTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={`flex-shrink-0 w-36 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === template.id
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getTemplateIcon(template.icon)}
                  </div>
                  <p className="text-xs font-semibold truncate">{template.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {template.durationDays} days • {template.dailyTargetHours}h/day
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Goal Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Target className="w-4 h-4" />
                  </div>
                  <input
                    {...register('title')}
                    placeholder="e.g. Master Neural Networks"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  />
                </div>
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Goal Description
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-zinc-500">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Provide additional details regarding resources or methodology..."
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Target Settings Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Target Duration
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    {...register('durationDays', { valueAsNumber: true })}
                    placeholder="30"
                    disabled={loading}
                    className="w-full pl-10 pr-20 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Days
                  </div>
                </div>
                {errors.durationDays && (
                  <p className="text-xs text-red-400 mt-1">{errors.durationDays.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Daily Study Volume
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    {...register('dailyTargetHours', { valueAsNumber: true })}
                    placeholder="2"
                    disabled={loading}
                    className="w-full pl-10 pr-20 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Hours / Day
                  </div>
                </div>
                {errors.dailyTargetHours && (
                  <p className="text-xs text-red-400 mt-1">{errors.dailyTargetHours.message}</p>
                )}
              </div>
            </div>

            {/* Dynamic Milestones Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/60">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Milestone Pipeline
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => append({ title: '' })}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>
              </div>

              {errors.milestones && (
                <p className="text-xs text-red-400">{errors.milestones.message}</p>
              )}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center animate-slide-in">
                    <span className="text-[10px] font-bold text-zinc-600 w-6 text-center uppercase">
                      #{index + 1}
                    </span>
                    <input
                      {...register(`milestones.${index}.title` as const)}
                      placeholder="e.g. Read chapters 1-3"
                      disabled={loading}
                      className="flex-grow px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={loading || fields.length === 1}
                      className="p-2.5 bg-zinc-950 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-zinc-800 rounded-xl transition-all cursor-pointer disabled:opacity-30"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Establish Target Goal'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
