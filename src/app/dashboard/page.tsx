import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { subDays, differenceInCalendarDays } from 'date-fns'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'
import { StreakCard, StreakCardProps } from '@/components/dashboard/streak-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { DailyCheckin } from '@/components/dashboard/daily-checkin'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { GoalsGrid } from '@/components/dashboard/goals-grid-client'
import { MilestonesList } from '@/components/dashboard/milestones-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuoteWidget } from '@/components/dashboard/quote-widget'
import { InactivityBanner } from '@/components/dashboard/inactivity-banner'
import { WeeklyInsightsWidget } from '@/components/dashboard/weekly-insights-widget'
import { FocusSessionLink } from '@/components/dashboard/focus-session-link'
import { ReadingLog } from '@/components/dashboard/reading-log'
import { fetchReadingCount } from '@/app/dashboard/reading-log/actions'
import { getStreakSummary } from '@/lib/streak-service'
import { fetchFreezeDays } from '@/lib/streak-queries'
import { fetchLastReminder } from '@/lib/reminder-queries'
import { calcInactiveDays, getInactivityRisk } from '@/lib/inactivity'
import { buildWeeklyReport } from '@/lib/weekly-report-service'
import type { WeeklyReport } from '@/lib/weekly-types'
import { PageWrapper } from '@/components/motion/PageWrapper'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'

function getStandingAndLevel(xpValue: number) {
  if (xpValue < 200) {
    return {
      level: 1,
      standing: 'Beginner',
      percentToNext: Math.round((xpValue / 200) * 100),
    }
  }
  if (xpValue < 500) {
    return {
      level: 2,
      standing: 'Learner',
      percentToNext: Math.round(((xpValue - 200) / 300) * 100),
    }
  }
  if (xpValue < 1000) {
    return {
      level: 3,
      standing: 'Scholar',
      percentToNext: Math.round(((xpValue - 500) / 500) * 100),
    }
  }
  if (xpValue < 2000) {
    return {
      level: 4,
      standing: 'Deep Worker',
      percentToNext: Math.round(((xpValue - 1000) / 1000) * 100),
    }
  }
  return {
    level: 5,
    standing: 'Consistency Monk',
    percentToNext: 100,
  }
}

function formatActivityTime(dateStr: string) {
  const diff = differenceInCalendarDays(new Date(), new Date(dateStr))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch User Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 3. Redirect to onboarding if profile is incomplete or missing
  if (profileError || !profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  // 4. Fetch goals with linked milestones and resources
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*, milestones(*), resources(*)')
    .order('created_at', { ascending: false })

  if (goalsError) {
    console.error('Error fetching goals:', goalsError)
  }

  // 5. Fetch study sessions (with hours)
  const { data: dbSessions, error: sessionsError } = await supabase
    .from('study_sessions')
    .select('id, session_date, hours, notes')
    .eq('user_id', user.id)
    .order('session_date', { ascending: true })

  if (sessionsError) {
    console.error('Error fetching study sessions:', sessionsError)
  }
  const allSessions = dbSessions || []

  // 5b. Fetch active goals for Reading Log dropdown
  const { data: activeGoals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const userGoals = activeGoals || []

  // Create simple items mapping for checkin selection
  const checkinGoals = goals
    ? goals.map((g) => ({
        id: g.id,
        title: g.title,
      }))
    : []

  // 6. Fetch streak + inactivity data — non-fatal
  let streakData: StreakCardProps['data'] = undefined
  let inactivityProps: React.ComponentProps<typeof InactivityBanner> | null = null
  let weeklyReport: WeeklyReport | null = null

  let readingCount = 0
  let readingLogEntries: any[] = []

  try {
    const [summary, freezes, lastReminder, readingLogData] = await Promise.all([
      getStreakSummary(),
      fetchFreezeDays(supabase, user.id),
      fetchLastReminder(supabase, user.id),
      fetchReadingCount(),
    ])

    readingCount = readingLogData

    // Streak card data
    const FREEZE_TOTAL = 3
    const freezesRemaining = Math.max(0, FREEZE_TOTAL - freezes.length)
    streakData = {
      ...summary,
      freezesRemaining,
      freezesTotal: FREEZE_TOTAL,
      recentSessionDates: allSessions.map((s) => s.session_date),
      recentFreezeDates: freezes.map((f) => f.used_on),
    }

    // Inactivity banner data
    const inactiveDays = calcInactiveDays(summary.lastStudyDate)
    inactivityProps = {
      inactiveDays,
      risk: getInactivityRisk(inactiveDays),
      lastStudyDate: summary.lastStudyDate,
      lastReminderTier: lastReminder?.tier ?? null,
      lastReminderSentAt: lastReminder?.created_at ?? null,
      frozenToday: summary.frozenToday,
    }

    // Weekly report
    const userName = profile.full_name || user.email?.split('@')[0] || 'Student'
    const userEmail = user.email ?? ''

    weeklyReport = await buildWeeklyReport(supabase, user.id, {
      userName,
      userEmail,
    })
  } catch (err) {
    console.error('Dashboard data fetch failed:', err)
  }

  // 7. Calculate Analytics (XP & Standing, Consistency Score, Milestones, Activities)
  let completedMilestonesCount = 0
  let totalMilestonesCount = 0
  let completedGoalsCount = 0

  if (goals) {
    goals.forEach((goal) => {
      const mList = goal.milestones || []
      const totalM = mList.length
      const compM = mList.filter((m: any) => m.is_completed).length
      completedMilestonesCount += compM
      totalMilestonesCount += totalM
      
      if (goal.status === 'completed' || (totalM > 0 && compM === totalM)) {
        completedGoalsCount++
      }
    })
  }

  const xpFromSessions = allSessions.length * 10
  const xpFromMilestones = completedMilestonesCount * 2
  const xpFromGoals = completedGoalsCount * 200
  const xp = xpFromSessions + xpFromMilestones + xpFromGoals

  const { level, standing, percentToNext } = getStandingAndLevel(xp)

  const thirtyDaysAgo = subDays(new Date(), 30)
  const sessionsLast30Days = allSessions.filter(
    (s) => new Date(s.session_date) >= thirtyDaysAgo
  ).length
  const consistencyScore = Math.min(100, Math.round((sessionsLast30Days / 30) * 100))

  // Upcoming milestones
  const upcomingMilestones = goals
    ? goals
        .filter((g) => g.status === 'active')
        .flatMap((g) =>
          (g.milestones || [])
            .filter((m: any) => !m.is_completed)
            .map((m: any) => ({
              id: m.id,
              title: m.title,
              goal: g.title,
              done: false,
            }))
        )
        .slice(0, 5)
    : []

  // Recent activity logs
  const sessionActivities = allSessions.map((s) => ({
    id: `session-${s.id}`,
    type: 'session' as const,
    detail: `Completed ${s.hours} hours study session`,
    time: formatActivityTime(s.session_date),
    timestamp: new Date(s.session_date).getTime(),
  }))

  const milestoneActivities = goals
    ? goals.flatMap((g) =>
        (g.milestones || [])
          .filter((m: any) => m.is_completed)
          .map((m: any) => ({
            id: `milestone-${m.id}`,
            type: 'milestone' as const,
            detail: `Milestone "${m.title}" checked off`,
            time: m.completed_at ? formatActivityTime(m.completed_at) : 'Completed',
            timestamp: m.completed_at ? new Date(m.completed_at).getTime() : 0,
          }))
      )
    : []

  let recentActivities = [...sessionActivities, ...milestoneActivities]
    .sort((a, b) => b.timestamp - a.timestamp)

  if (streakData && streakData.currentStreak > 0) {
    recentActivities.unshift({
      id: 'streak-ach',
      type: 'streak' as const,
      detail: `Streak extended to ${streakData.currentStreak} Days`,
      time: 'Active',
      timestamp: Date.now(),
    })
  }

  recentActivities = recentActivities.slice(0, 4)

  return (
    <PageWrapper>
      <div className="min-h-screen bg-zinc-950 flex font-sans">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <TopNavbar />

        <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              Workspace
            </h1>
            <p className="text-xs text-zinc-400">
              Welcome back. Review your study stats, streak integrity, and milestone completions.
            </p>
          </div>

          {/* Profile Overview Card */}
          <div className="p-6 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-4 justify-between">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 opacity-40" />
            
            {/* Left: User Details */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-blue-500 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-purple-500/10 shrink-0">
                {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 truncate">
                  <span className="truncate break-all">{profile.full_name || 'Anonymous User'}</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-cyan-400 font-semibold tracking-wider uppercase shrink-0">
                    {profile.role}
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 truncate break-all">{profile.email}</p>
                <p className="text-xs text-zinc-500 mt-1 truncate break-words">
                  {profile.role === 'Professional' ? 'Profession: ' : 'Field: '}
                  <span className="text-zinc-300 font-medium">
                    {profile.role === 'Professional' ? profile.profession : profile.academic_field}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Active Goal Summary */}
            {goals && goals.length > 0 && (
              <div className="flex-1 max-w-md border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Active Focus Blueprint</span>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1">{goals[0].title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {goals[0].duration_days} days sprint &bull; {goals[0].daily_target_hours}h daily target
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-400 font-semibold">
                      {goals[0].milestones?.filter((m: any) => m.is_completed).length || 0} / {goals[0].milestones?.length || 0} Milestones
                    </span>
                  </div>
                </div>
                <FocusSessionLink />
              </div>
            )}
          </div>

          {/* Inactivity banner — only renders when relevant */}
          {inactivityProps && <InactivityBanner {...inactivityProps} />}

          {/* Grid Level 1: Stats & Check-in */}
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StaggerItem>
                <StreakCard data={streakData} />
              </StaggerItem>
              <StaggerItem>
                <ProgressCard
                  xp={xp}
                  level={level}
                  standing={standing}
                  percentToNext={percentToNext}
                  consistencyScore={consistencyScore}
                  completedMilestones={completedMilestonesCount}
                  totalMilestones={totalMilestonesCount}
                />
              </StaggerItem>
              <StaggerItem>
                <DailyCheckin goals={checkinGoals} />
              </StaggerItem>
              {profile.role === 'Research Scholar' && (
                <StaggerItem>
                  <ReadingLog initialCount={readingCount} userGoals={userGoals} />
                </StaggerItem>
              )}
            </div>
          </StaggerContainer>

          {/* Grid Level 2: Active Goals Grid */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
              Target Milestones & Goals
            </h3>
            <GoalsGrid goals={goals} />
          </div>

          {/* Grid Level 3: Weekly Report + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {weeklyReport && <WeeklyInsightsWidget report={weeklyReport} />}
            </div>
            <StudyHeatmap sessions={allSessions} />
          </div>

          {/* Grid Level 4: Objectives & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MilestonesList milestones={upcomingMilestones} />
            <RecentActivity activities={recentActivities} />
          </div>

          {/* Grid Level 5: Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuoteWidget />
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  )
}
