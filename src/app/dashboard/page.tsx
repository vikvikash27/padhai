import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopNavbar } from '@/components/dashboard/top-navbar'
import { StreakCard } from '@/components/dashboard/streak-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { DailyCheckin } from '@/components/dashboard/daily-checkin'
import { StudyHeatmap } from '@/components/dashboard/study-heatmap'
import { GoalsGrid } from '@/components/dashboard/goals-grid'
import { MilestonesList } from '@/components/dashboard/milestones-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuoteWidget } from '@/components/dashboard/quote-widget'
import { InactivityBanner } from '@/components/dashboard/inactivity-banner'
import { WeeklyInsightsWidget } from '@/components/dashboard/weekly-insights-widget'
import { getStreakSummary } from '@/lib/streak-service'
import { fetchStudySessions, fetchFreezeDays } from '@/lib/streak-queries'
import { fetchLastReminder } from '@/lib/reminder-queries'
import { calcInactiveDays, getInactivityRisk } from '@/lib/inactivity'
import { buildWeeklyReport } from '@/lib/weekly-report-service'
import type { WeeklyReport } from '@/lib/weekly-types'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch goals with linked milestones
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*, milestones(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
  }

  // Create simple items mapping for checkin selection
  const checkinGoals = goals
    ? goals.map((g) => ({
        id: g.id,
        title: g.title,
      }))
    : []

  // Fetch streak + inactivity data — non-fatal: dashboard renders even if this fails
  let streakData: React.ComponentProps<typeof StreakCard>['data'] = undefined
  let inactivityProps: React.ComponentProps<typeof InactivityBanner> | null = null
  let weeklyReport: WeeklyReport | null = null

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [summary, sessions, freezes, lastReminder] = await Promise.all([
        getStreakSummary(),
        fetchStudySessions(supabase, user.id),
        fetchFreezeDays(supabase, user.id),
        fetchLastReminder(supabase, user.id),
      ])

      // Streak card data
      const FREEZE_TOTAL = 3
      const freezesRemaining = Math.max(0, FREEZE_TOTAL - freezes.length)
      streakData = {
        ...summary,
        freezesRemaining,
        freezesTotal: FREEZE_TOTAL,
        recentSessionDates: sessions.map((s) => s.studied_at),
        recentFreezeDates: freezes.map((f) => f.used_on),
      }

      // Inactivity banner data
      const inactiveDays = calcInactiveDays(summary.lastStudyDate)
      inactivityProps = {
        inactiveDays,
        risk: getInactivityRisk(inactiveDays),
        lastStudyDate: summary.lastStudyDate,
        lastReminderTier: lastReminder?.tier ?? null,
        lastReminderSentAt: lastReminder?.sent_at ?? null,
        frozenToday: summary.frozenToday,
      }

      // Weekly report
      const authUser = await supabase.auth.getUser()
      const userName =
        (authUser.data.user?.user_metadata?.full_name as string) ||
        authUser.data.user?.email?.split('@')[0] ||
        'Student'
      const userEmail = authUser.data.user?.email ?? ''

      weeklyReport = await buildWeeklyReport(supabase, user.id, {
        userName,
        userEmail,
      })
    }
  } catch (err) {
    console.error('Dashboard data fetch failed:', err)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
              Workspace
            </h1>
            <p className="text-xs text-zinc-400">
              Welcome back. Review your study stats, streak integrity, and milestone completions.
            </p>
          </div>

          {/* Inactivity banner — only renders when relevant */}
          {inactivityProps && <InactivityBanner {...inactivityProps} />}

          {/* Grid Level 1: Stats & Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StreakCard data={streakData} />
            <ProgressCard />
            <DailyCheckin goals={checkinGoals} />
          </div>

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
            <StudyHeatmap />
          </div>

          {/* Grid Level 4: Objectives & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MilestonesList />
            <RecentActivity />
          </div>

          {/* Grid Level 5: Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuoteWidget />
          </div>
        </div>
      </div>
    </div>
  )
}
