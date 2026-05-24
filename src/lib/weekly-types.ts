/**
 * @file weekly-types.ts
 * @description Shared types for the PadhAI weekly report system.
 */

// ---------------------------------------------------------------------------
// Weekly window
// ---------------------------------------------------------------------------

export interface WeekWindow {
  /** Monday of the week (YYYY-MM-DD) */
  weekStart: string;
  /** Sunday of the week (YYYY-MM-DD) */
  weekEnd: string;
  /** Human-readable label e.g. "May 19 – May 25" */
  label: string;
}

// ---------------------------------------------------------------------------
// Raw session data for a week
// ---------------------------------------------------------------------------

export interface WeeklySessionRow {
  /** YYYY-MM-DD */
  session_date: string;
  /** Total hours studied that day */
  hours: number;
  /** Number of sessions that day */
  sessions: number;
}

// ---------------------------------------------------------------------------
// Aggregated weekly stats
// ---------------------------------------------------------------------------

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  /** Total hours studied across the week */
  totalHours: number;
  /** Number of days with at least one session */
  activeDays: number;
  /** Number of sessions total */
  totalSessions: number;
  /** Average hours per active day */
  avgHoursPerDay: number;
  /** Consistency percentage (activeDays / 7 * 100) */
  consistencyScore: number;
  /** Per-day breakdown for charts */
  dailyBreakdown: WeeklySessionRow[];
}

// ---------------------------------------------------------------------------
// Comparison between current and previous week
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "flat";

export interface WeeklyComparison {
  current: WeeklyStats;
  previous: WeeklyStats;
  hoursDelta: number;
  consistencyDelta: number;
  activeDaysDelta: number;
  hoursTrend: TrendDirection;
  consistencyTrend: TrendDirection;
}

// ---------------------------------------------------------------------------
// Completed milestones
// ---------------------------------------------------------------------------

export interface CompletedMilestone {
  id: string;
  title: string;
  goalTitle: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Full weekly report payload
// ---------------------------------------------------------------------------

export interface WeeklyReport {
  userId: string;
  userName: string;
  userEmail: string;
  generatedAt: string;
  week: WeekWindow;
  stats: WeeklyStats;
  previousStats: WeeklyStats | null;
  comparison: WeeklyComparison | null;
  currentStreak: number;
  longestStreak: number;
  completedMilestones: CompletedMilestone[];
  activeGoalsCount: number;
  /** Simple text insights generated from the data */
  insights: string[];
  /** Overall performance label */
  performanceLabel: "excellent" | "good" | "moderate" | "low" | "none";
}
