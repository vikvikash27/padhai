'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Flame, 
  Target, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Bell, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Shield,
  Zap,
  Info
} from 'lucide-react'
import { completeOnboarding } from '@/app/onboarding/actions'

const STEPS = [
  { id: 1, name: 'Welcome' },
  { id: 2, name: 'Identity' },
  { id: 3, name: 'Core Goal' },
  { id: 4, name: 'Duration' },
  { id: 5, name: 'Daily Target' },
  { id: 6, name: 'Milestones' },
  { id: 7, name: 'Accountability' },
  { id: 8, name: 'Celebration' },
]

const GOAL_TEMPLATES = [
  { 
    title: 'UPSC Civil Services Prep', 
    category: 'exams', 
    duration: 180, 
    dailyTarget: 6,
    role: 'Student',
    milestones: ['Complete NCERT foundations', 'Finish syllabus for paper 1', 'Solve last 5 years papers', 'Mock test series']
  },
  { 
    title: 'Full-Stack Web Development', 
    category: 'tech', 
    duration: 90, 
    dailyTarget: 3,
    role: 'Both',
    milestones: ['Master React & Next.js basics', 'Build three complete portfolio projects', 'Learn backend databases & API integration', 'Deploy full stack application']
  },
  { 
    title: 'Data Structures & Algorithms', 
    category: 'tech', 
    duration: 60, 
    dailyTarget: 2,
    role: 'Both',
    milestones: ['Understand array, list & tree complexities', 'Solve 50 LeetCode Medium challenges', 'Master dynamic programming', 'Mock technical interview prep']
  },
  { 
    title: 'Machine Learning & AI', 
    category: 'tech', 
    duration: 120, 
    dailyTarget: 4,
    role: 'Both',
    milestones: ['Complete linear algebra & stats review', 'Build standard regression/classification models', 'Train first neural network using PyTorch', 'Fine-tune large language model API']
  },
  { 
    title: 'Product Management Mastery', 
    category: 'business', 
    duration: 30, 
    dailyTarget: 2,
    role: 'Professional',
    milestones: ['Study product design case studies', 'Complete mock case interview questions', 'Learn product analytics metrics', 'Build standard PRD mock document']
  },
  {
    title: 'PhD Thesis Completion',
    category: 'research',
    duration: 365,
    dailyTarget: 3,
    role: 'Research Scholar',
    milestones: [
      'Complete literature review',
      'Finalize methodology',
      'Data collection & fieldwork',
      'Analysis & results',
      'Draft thesis chapters',
      'Supervisor review & revisions',
      'Final submission & defense prep'
    ]
  },
  {
    title: 'Research Paper Writing',
    category: 'research',
    duration: 45,
    dailyTarget: 2,
    role: 'Research Scholar',
    milestones: [
      'Define research question & outline',
      'Literature review & citations',
      'Write methodology & results',
      'Draft discussion & conclusion',
      'Peer review & final edits'
    ]
  },
  {
    title: 'Literature Review Sprint',
    category: 'research',
    duration: 30,
    dailyTarget: 2,
    role: 'Research Scholar',
    milestones: [
      'Identify key papers (50+ sources)',
      'Read & annotate 25 papers',
      'Read & annotate remaining papers',
      'Synthesize findings & write review'
    ]
  },
  {
    title: 'Conference Paper Submission',
    category: 'research',
    duration: 60,
    dailyTarget: 2.5,
    role: 'Research Scholar',
    milestones: [
      'Select conference & study guidelines',
      'Draft abstract & get feedback',
      'Write full paper draft',
      'Revise & format to submission style',
      'Submit & prepare presentation'
    ]
  },
  {
    title: 'Masters Dissertation',
    category: 'research',
    duration: 180,
    dailyTarget: 2.5,
    role: 'Research Scholar',
    milestones: [
      'Topic selection & proposal approval',
      'Literature review',
      'Research design & ethics clearance',
      'Data collection',
      'Analysis & findings',
      'Write & submit dissertation'
    ]
  },
]

const REMINDER_STYLES = [
  {
    id: 'gentle',
    title: 'Gentle Guide',
    description: 'A polite, supportive nudge after 2 days of silence. Perfect for self-motivated individuals.',
    icon: Bell,
    badge: 'Kind',
    color: 'border-cyan-500/30 text-cyan-400 focus-within:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40',
    glow: 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]',
  },
  {
    id: 'accountability',
    title: 'Accountability Partner',
    description: 'A firm notification pattern at 2 days and escalating at 4 days. Strong focus-driven re-engagement.',
    icon: Shield,
    badge: 'Balanced',
    color: 'border-purple-500/30 text-purple-400 focus-within:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40',
    glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]',
  },
  {
    id: 'comeback',
    title: 'Stoic Coach',
    description: 'Escalating accountability reminders containing blunt, direct stoic insights to shake off procrastination.',
    icon: Flame,
    badge: 'Intense',
    color: 'border-amber-500/30 text-amber-400 focus-within:border-amber-400 bg-amber-950/20 hover:bg-amber-950/40',
    glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]',
  },
]

const MOTIVATION_STYLES = [
  { id: 'calm', label: 'Quiet & Calm', desc: 'Focus on flow and quiet consistency.' },
  { id: 'motivational', label: 'Inspiring', desc: 'High-energy daily habit reinforcements.' },
  { id: 'stoic', label: 'Stoic Wisdom', desc: 'Intellectual quotes on mental discipline.' },
  { id: 'competitive', label: 'Habit Warrior', desc: 'Pushes you to stay top of your game.' },
]

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Onboarding state values
  const [role, setRole] = useState<'Student' | 'Professional' | 'Research Scholar'>('Student')
  const [profession, setProfession] = useState('')
  const [academicField, setAcademicField] = useState('')

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )padhai_selected_role=([^;]*)/)
      const savedRole = match ? decodeURIComponent(match[1]) : null
      if (savedRole === 'Student' || savedRole === 'Professional' || savedRole === 'Research Scholar') {
        setRole(savedRole)
      }
    }
  }, [])

  const [goalTitle, setGoalTitle] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [durationDays, setDurationDays] = useState(60)
  const [customDuration, setCustomDuration] = useState('')
  const [dailyTargetHours, setDailyTargetHours] = useState(2)
  const [customHours, setCustomHours] = useState('')
  const [milestones, setMilestones] = useState<string[]>(['Initial Setup & Research', 'Core Practice & Consistency'])
  const [newMilestoneText, setNewMilestoneText] = useState('')
  const [reminderStyle, setReminderStyle] = useState<'gentle' | 'accountability' | 'comeback'>('accountability')
  const [motivationStyle, setMotivationStyle] = useState<'calm' | 'motivational' | 'stoic' | 'competitive'>('stoic')

  const handleNext = () => {
    setError(null)
    
    // Validations
    if (currentStep === 2) {
      if (role === 'Student' && !academicField.trim()) {
        setError('Please enter your current academic field / course / class.')
        return
      }
      if (role === 'Research Scholar' && !academicField.trim()) {
        setError('Please enter your research field / department.')
        return
      }
      if (role === 'Professional' && !profession.trim()) {
        setError('Please enter your profession / job role.')
        return
      }
    }

    if (currentStep === 3) {
      const activeGoal = goalTitle === 'custom' ? customGoal : goalTitle
      if (!activeGoal || activeGoal.trim().length < 3) {
        setError('Please enter a clear learning goal (at least 3 characters).')
        return
      }
    }
    
    if (currentStep === 4) {
      const finalDuration = durationDays === 0 ? parseInt(customDuration) : durationDays
      if (!finalDuration || isNaN(finalDuration) || finalDuration <= 0) {
        setError('Please provide a valid number of target days.')
        return
      }
    }

    if (currentStep === 5) {
      const finalHours = dailyTargetHours === 0 ? parseFloat(customHours) : dailyTargetHours
      if (!finalHours || isNaN(finalHours) || finalHours <= 0) {
        setError('Please provide a valid study target in hours.')
        return
      }
    }

    if (currentStep === 6) {
      if (milestones.length < 2) {
        setError('Please create at least two milestones to break down your goal.')
        return
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  const handlePrev = () => {
    setError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const applyTemplate = (tpl: typeof GOAL_TEMPLATES[0]) => {
    setGoalTitle(tpl.title)
    setDurationDays(tpl.duration)
    setDailyTargetHours(tpl.dailyTarget)
    setMilestones([...tpl.milestones])
    setError(null)
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestoneText.trim()) return
    setMilestones([...milestones, newMilestoneText.trim()])
    setNewMilestoneText('')
    setError(null)
  }

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const finalGoal = goalTitle === 'custom' ? customGoal : goalTitle
    const finalDuration = durationDays === 0 ? parseInt(customDuration) : durationDays
    const finalHours = dailyTargetHours === 0 ? parseFloat(customHours) : dailyTargetHours

    const payload = {
      title: finalGoal,
      durationDays: finalDuration,
      dailyTargetHours: finalHours,
      milestones,
      reminderStyle,
      motivationStyle: motivationStyle as any,
      role,
      profession: role === 'Professional' ? profession : null,
      academicField: (role === 'Student' || role === 'Research Scholar') ? academicField : null,
    }

    try {
      const result = await completeOnboarding(payload)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.refresh()
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while setting up your habit loop.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl px-4 py-8">
      {/* Background neon blobs */}
      <div className="absolute top-1/4 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Onboarding Wizard Card */}
      <div className="relative border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
        
        {/* Top Progress bar */}
        {currentStep > 1 && currentStep < 8 && (
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-zinc-500 mb-2">
              <span className="text-zinc-400 font-medium">STEP {currentStep} OF {STEPS.length - 1}</span>
              <span className="text-purple-400 font-semibold">{STEPS[currentStep - 1].name}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Wizard Steps */}
        <div className="min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col justify-center"
            >
              {/* STEP 1: WELCOME SCREEN */}
              {currentStep === 1 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-semibold mb-6">
                    <Sparkles className="w-3.5 h-3.5" /> Duolingo for serious self-learning
                  </div>
                  
                  <h1 className="text-3.5xl font-bold tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                    Someone notices when you <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">stop showing up</span>.
                  </h1>

                  <p className="text-zinc-400 text-base max-w-lg mx-auto mb-8 leading-relaxed">
                    Most self-learning efforts fail in silence. PadhAI combines intentional streaks, custom accountability reminders, and deep weekly metrics to build learning habits that stick.
                  </p>

                  <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 mb-8 max-w-md mx-auto flex items-start gap-3.5 text-left">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">Consistency &gt; Motivation</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        We don't expect hours of perfection. We expect showing up. Let's configure your custom micro-habit dashboard in simple steps.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all"
                  >
                    Configure My Habit Loop
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* STEP 2: IDENTITY (ROLE SELECTION) */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Tell us about yourself
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      Select your current role and let us know what you are focusing on to customize your dashboard experience.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('Student')
                        setError(null)
                      }}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        role === 'Student'
                          ? 'border-purple-500/80 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/20 text-zinc-500 hover:bg-zinc-950/40 hover:text-zinc-400'
                      }`}
                    >
                      <span className="block text-lg font-bold text-zinc-100">Student</span>
                      <span className="block text-xs text-zinc-500 mt-1">School, College, or Self-learning Academic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('Professional')
                        setError(null)
                      }}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        role === 'Professional'
                          ? 'border-purple-500/80 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/20 text-zinc-500 hover:bg-zinc-950/40 hover:text-zinc-400'
                      }`}
                    >
                      <span className="block text-lg font-bold text-zinc-100">Professional</span>
                      <span className="block text-xs text-zinc-500 mt-1">Working, Freelance, or Industry Career</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('Research Scholar')
                        setError(null)
                      }}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        role === 'Research Scholar'
                          ? 'border-purple-500/80 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                          : 'border-zinc-800 bg-zinc-950/20 text-zinc-500 hover:bg-zinc-950/40 hover:text-zinc-400'
                      }`}
                    >
                      <span className="block text-lg font-bold text-zinc-100">Research Scholar</span>
                      <span className="block text-xs text-zinc-500 mt-1">PhD, Masters, or Academic Research</span>
                    </button>
                  </div>

                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 border border-zinc-850 rounded-xl bg-zinc-950/40"
                  >
                    {role === 'Student' ? (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Academic Field / Course / Class
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. B.Tech Computer Science, UPSC Aspirant, Grade 12"
                          value={academicField}
                          onChange={(e) => setAcademicField(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 text-sm"
                        />
                      </div>
                    ) : role === 'Research Scholar' ? (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Research Field / Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Machine Learning, Quantum Physics, Economics"
                          value={academicField}
                          onChange={(e) => setAcademicField(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          Profession / Job Role
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer, Marketing Lead, Consultant"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 text-sm"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {/* STEP 3: SELECT LEARNING GOAL */}
              {currentStep === 3 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      What are you studying or building?
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      Select one of our popular quick-habit frameworks or enter a completely customized self-learning goal below.
                    </p>
                  </div>

                  {/* Goal templates */}
                  {(() => {
                    const visibleTemplates = GOAL_TEMPLATES.filter(t =>
                      t.role === 'Both' || t.role === role
                    )
                    return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {visibleTemplates.map((tpl) => (
                      <button
                        key={tpl.title}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className={`text-left p-4 rounded-xl border transition-all active:scale-[0.99] ${
                          goalTitle === tpl.title
                            ? 'border-purple-500/80 bg-purple-500/5 text-purple-300'
                            : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-100">{tpl.title}</span>
                          <BookOpen className={`w-4 h-4 ${goalTitle === tpl.title ? 'text-purple-400' : 'text-zinc-600'}`} />
                        </div>
                        <div className="flex gap-4 mt-2.5 text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tpl.duration}d</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tpl.dailyTarget}h/d</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Custom goal card option - always visible regardless of role */}
                    <button
                      type="button"
                      onClick={() => {
                        setGoalTitle('custom')
                        setError(null)
                      }}
                      className={`text-left p-4 rounded-xl border transition-all active:scale-[0.99] ${
                        goalTitle === 'custom'
                          ? 'border-cyan-500/80 bg-cyan-500/5 text-cyan-300'
                          : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-100">Write Custom Goal</span>
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">Design an individual habit sprint from scratch.</p>
                    </button>
                  </div>
                    )
                  })()}

                  {/* Custom goal text field */}
                  {goalTitle === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-zinc-850 rounded-xl bg-zinc-950/40"
                    >
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Your Learning Habit Goal</label>
                      <input
                        type="text"
                        placeholder="e.g. Learning Advanced Rust & System Programming"
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 4: SET HABIT SPRINT DURATION */}
              {currentStep === 4 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Commitment sprint duration
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      How long will you stick with this intense focus block? Consistency is built in bounded milestones.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { days: 30, label: '30 Days', desc: 'Quick Sprint' },
                      { days: 60, label: '60 Days', desc: 'Habit Builder' },
                      { days: 90, label: '90 Days', desc: 'Deep Focus' },
                      { days: 180, label: '180 Days', desc: 'Mastery block' },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => {
                          setDurationDays(d.days)
                          setError(null)
                        }}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          durationDays === d.days
                            ? 'border-purple-500/80 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                            : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-500'
                        }`}
                      >
                        <span className="block text-base font-bold text-zinc-100">{d.label}</span>
                        <span className="block text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{d.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom duration slot */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDurationDays(0)
                        setError(null)
                      }}
                      className={`px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                        durationDays === 0
                          ? 'border-cyan-500/80 bg-cyan-500/5 text-cyan-300'
                          : 'border-zinc-850 bg-zinc-950/20 text-zinc-400'
                      }`}
                    >
                      Custom Days
                    </button>
                    
                    {durationDays === 0 && (
                      <motion.input
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="number"
                        min="1"
                        placeholder="Enter custom days (e.g. 45)"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-zinc-900 border border-zinc-855 rounded-xl text-zinc-100 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: DAILY TARGET HOURS */}
              {currentStep === 5 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Set your daily target
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      Be brutally honest with your schedule. PadhAI streaks reward consistent check-ins, not occasional burnouts.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { hours: 1, label: '1 hour', desc: 'Gentle flow' },
                      { hours: 2, label: '2 hours', desc: 'Solid habit' },
                      { hours: 4, label: '4 hours', desc: 'Deep work' },
                      { hours: 6, label: '6 hours', desc: 'Aggressive' },
                    ].map((h) => (
                      <button
                        key={h.hours}
                        type="button"
                        onClick={() => {
                          setDailyTargetHours(h.hours)
                          setError(null)
                        }}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          dailyTargetHours === h.hours
                            ? 'border-purple-500/80 bg-purple-500/5 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
                            : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-500'
                        }`}
                      >
                        <span className="block text-base font-bold text-zinc-100">{h.label}</span>
                        <span className="block text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{h.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom hours slot */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDailyTargetHours(0)
                        setError(null)
                      }}
                      className={`px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                        dailyTargetHours === 0
                          ? 'border-cyan-500/80 bg-cyan-500/5 text-cyan-300'
                          : 'border-zinc-850 bg-zinc-950/20 text-zinc-400'
                      }`}
                    >
                      Custom Hours
                    </button>
                    
                    {dailyTargetHours === 0 && (
                      <motion.input
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        type="number"
                        step="0.5"
                        min="0.1"
                        placeholder="Daily target in hours (e.g. 1.5)"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 focus:outline-none focus:border-cyan-500 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: ADD MILESTONES */}
              {currentStep === 6 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Break down your learning milestones
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      Learning is easier when split into small checkpoints. Setup at least two primary milestones for this goal.
                    </p>
                  </div>

                  {/* Milestone quick-input form */}
                  <form onSubmit={handleAddMilestone} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newMilestoneText}
                      onChange={(e) => setNewMilestoneText(e.target.value)}
                      placeholder="e.g. Complete Chapters 1 to 5, Finish MVP build..."
                      className="flex-1 px-4 py-3 bg-zinc-950/50 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl flex items-center gap-1.5 transition-all text-sm font-semibold active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  {/* Milestone lists */}
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 border border-zinc-900/50 p-2 rounded-xl bg-zinc-950/20">
                    {milestones.length === 0 ? (
                      <div className="text-center py-8 text-zinc-600 text-xs">
                        No milestones created yet. Add a custom step above.
                      </div>
                    ) : (
                      milestones.map((m, idx) => (
                        <motion.div
                          key={`${m}-${idx}`}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 rounded-xl border border-zinc-850/80 bg-zinc-900/30 text-sm"
                        >
                          <div className="flex items-center gap-2 text-zinc-200">
                            <span className="w-5 h-5 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{m}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STEP 7: CHOOSE ACCOUNTABILITY & MOTIVATION STYLE */}
              {currentStep === 7 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      Set your accountability settings
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                      How should PadhAI alert you when you start slipping away from your focus sprint?
                    </p>
                  </div>

                  {/* Reminder styles */}
                  <div className="space-y-3 mb-6">
                    {REMINDER_STYLES.map((style) => {
                      const Icon = style.icon
                      const active = reminderStyle === style.id
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setReminderStyle(style.id as any)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                            active
                              ? `border-purple-500/80 bg-purple-500/5 ${style.glow}`
                              : 'border-zinc-850 bg-zinc-950/20 hover:bg-zinc-950/40'
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 ${active ? 'text-purple-400' : 'text-zinc-600'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-zinc-100">{style.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                                {style.badge}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{style.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Motivation style preferences */}
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Motivational Voice Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      {MOTIVATION_STYLES.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMotivationStyle(m.id as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            motivationStyle === m.id
                              ? 'border-cyan-500/80 bg-cyan-500/5 text-cyan-300'
                              : 'border-zinc-850 bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-500'
                          }`}
                        >
                          <span className="block text-xs font-bold text-zinc-100">{m.label}</span>
                          <span className="block text-[10px] text-zinc-500 mt-1">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: CELEBRATION & FINAL BLUEPRINT SCREEN */}
              {currentStep === 8 && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-900/30 animate-pulse">
                    <Zap className="w-7 h-7 text-white" />
                  </div>

                  <h1 className="text-2.5xl font-extrabold text-white leading-tight">
                    Your learning habit loop is configured.
                  </h1>
                  <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Here is your personal growth blueprint. Once activated, your mission control dashboard will launch immediately.
                  </p>

                  {/* Commitment Blueprint Summary Card */}
                  <div className="my-6 border border-purple-500/20 bg-zinc-950/50 rounded-2xl p-6 text-left max-w-md mx-auto shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Goal Sprint</span>
                        <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                          <Flame className="w-4 h-4 text-purple-400" />
                          {goalTitle === 'custom' ? customGoal : goalTitle}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-y border-zinc-900 py-3.5">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Identity</span>
                          <span className="text-sm font-semibold text-zinc-200 mt-0.5">
                            {role}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                            {role === 'Professional' ? 'Profession' : 'Field'}
                          </span>
                          <span className="text-sm font-semibold text-zinc-200 mt-0.5 truncate block">
                            {role === 'Professional' ? profession : academicField}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-3.5">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Sprint Commitment</span>
                          <span className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            {durationDays === 0 ? customDuration : durationDays} Days
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Daily target</span>
                          <span className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            {dailyTargetHours === 0 ? customHours : dailyTargetHours} Hours / day
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold mb-1.5">Action Milestones</span>
                        <div className="space-y-1.5">
                          {milestones.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500/80 flex-shrink-0" />
                              <span className="truncate">{m}</span>
                            </div>
                          ))}
                          {milestones.length > 3 && (
                            <span className="text-[10px] text-zinc-600 font-semibold block pl-5">+ {milestones.length - 3} more checkpoints</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-900 rounded-xl p-3 text-xs">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-zinc-600" /> Accountability Tier
                        </span>
                        <span className="font-bold text-zinc-300 capitalize">{reminderStyle} model</span>
                      </div>
                    </div>
                  </div>

                  {/* Activate button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full max-w-md py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activating Habit Loop...
                      </>
                    ) : (
                      <>
                        Activate Mission Blueprint
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom navigation buttons */}
          {currentStep > 1 && currentStep < 8 && (
            <div className="flex justify-between items-center border-t border-zinc-900 mt-6 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold rounded-xl transition-all shadow active:scale-[0.98] flex items-center gap-1"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
