/**
 * @file weekly-report-service.ts
 * @description Orchestration layer — builds a full WeeklyReport for a user.
 *
 * Used by:
 *  - Dashboard Server Component (current week)
 *  - Weekly email cron (any week)
 *  - API routes
 *
 * Does NOT use "use server" — safe to import in Route Handlers too.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getWeekWindow,
  getPreviousWeekWindow,
  aggregateWeeklyStats,
  compareWeeks,
  generateInsights,
  getPerformanceLabel,
} from "@/lib/weekly-analytics";
import {
  fetchWeeklySessionRows,
  fetchUserStreakSnapshot,
  fetchCompletedMilestonesThisWeek,
  fetchActiveGoalCount,
} from "@/lib/weekly-queries";
import type { WeeklyReport } from "@/lib/weekly-types";

// ---------------------------------------------------------------------------
// Report generator
// ---------------------------------------------------------------------------

export interface BuildWeeklyReportOptions {
  /** Override "this week" — useful for testing or sending past reports. */
  now?: Date;
  /** User display name. */
  userName: string;
  /** User email. */
  userEmail: string;
}

/**
 * Builds a complete WeeklyReport for a user.
 * Runs all Supabase queries in parallel then computes analytics.
 */
export async function buildWeeklyReport(
  db: SupabaseClient,
  userId: string,
  opts: BuildWeeklyReportOptions
): Promise<WeeklyReport> {
  const currentWeek = getWeekWindow(opts.now);
  const prevWeek = getPreviousWeekWindow(currentWeek);

  // Parallel fetch
  const [
    currentRows,
    prevRows,
    streakSnapshot,
    completedMilestones,
    activeGoalsCount,
  ] = await Promise.all([
    fetchWeeklySessionRows(db, userId, currentWeek.weekStart, currentWeek.weekEnd),
    fetchWeeklySessionRows(db, userId, prevWeek.weekStart, prevWeek.weekEnd),
    fetchUserStreakSnapshot(db, userId),
    fetchCompletedMilestonesThisWeek(db, userId, currentWeek.weekStart, currentWeek.weekEnd),
    fetchActiveGoalCount(db, userId),
  ]);

  // Aggregate
  const currentStats = aggregateWeeklyStats(currentWeek, currentRows);
  const previousStats = aggregateWeeklyStats(prevWeek, prevRows);
  const comparison = compareWeeks(currentStats, previousStats);

  // Analytics
  const insights = generateInsights(
    currentStats,
    comparison,
    streakSnapshot.currentStreak
  );
  const performanceLabel = getPerformanceLabel(currentStats.consistencyScore);

  return {
    userId,
    userName: opts.userName,
    userEmail: opts.userEmail,
    generatedAt: new Date().toISOString(),
    week: currentWeek,
    stats: currentStats,
    previousStats,
    comparison,
    currentStreak: streakSnapshot.currentStreak,
    longestStreak: streakSnapshot.longestStreak,
    completedMilestones,
    activeGoalsCount,
    insights,
    performanceLabel,
  };
}
