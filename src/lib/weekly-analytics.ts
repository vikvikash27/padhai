/**
 * @file weekly-analytics.ts
 * @description Pure analytics utilities for the weekly report.
 * No DB calls — only data transformations and calculations.
 */

import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
  eachDayOfInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import type {
  WeekWindow,
  WeeklySessionRow,
  WeeklyStats,
  WeeklyComparison,
  TrendDirection,
  WeeklyReport,
} from "@/lib/weekly-types";

// ---------------------------------------------------------------------------
// Week window helpers
// ---------------------------------------------------------------------------

/** Monday-anchored week window for a given date. */
export function getWeekWindow(date?: Date): WeekWindow {
  const ref = date ?? new Date();
  const start = startOfWeek(ref, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(ref, { weekStartsOn: 1 });     // Sunday

  return {
    weekStart: format(start, "yyyy-MM-dd"),
    weekEnd: format(end, "yyyy-MM-dd"),
    label: `${format(start, "MMM d")} – ${format(end, "MMM d")}`,
  };
}

/** Returns the previous week window relative to a given window. */
export function getPreviousWeekWindow(current: WeekWindow): WeekWindow {
  const start = parseISO(current.weekStart);
  return getWeekWindow(subWeeks(start, 1));
}

// ---------------------------------------------------------------------------
// Stats aggregation
// ---------------------------------------------------------------------------

/**
 * Builds a WeeklyStats from raw session rows for a given week window.
 * `rows` must contain ONLY sessions within the week.
 */
export function aggregateWeeklyStats(
  window: WeekWindow,
  rows: WeeklySessionRow[]
): WeeklyStats {
  const start = parseISO(window.weekStart);
  const end = parseISO(window.weekEnd);

  // Build a map keyed by YYYY-MM-DD for fast lookup
  const rowMap = new Map<string, WeeklySessionRow>();
  for (const row of rows) {
    rowMap.set(row.session_date, row);
  }

  // Fill all 7 days, even those with no activity
  const dailyBreakdown: WeeklySessionRow[] = eachDayOfInterval({
    start,
    end,
  }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    return (
      rowMap.get(key) ?? { session_date: key, hours: 0, sessions: 0 }
    );
  });

  const totalHours = dailyBreakdown.reduce((sum, d) => sum + d.hours, 0);
  const activeDays = dailyBreakdown.filter((d) => d.hours > 0).length;
  const totalSessions = dailyBreakdown.reduce((sum, d) => sum + d.sessions, 0);

  return {
    weekStart: window.weekStart,
    weekEnd: window.weekEnd,
    totalHours: Math.round(totalHours * 10) / 10,
    activeDays,
    totalSessions,
    avgHoursPerDay: activeDays > 0
      ? Math.round((totalHours / activeDays) * 10) / 10
      : 0,
    consistencyScore: Math.round((activeDays / 7) * 100),
    dailyBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Trend calculation
// ---------------------------------------------------------------------------

function trend(current: number, previous: number): TrendDirection {
  const delta = current - previous;
  if (Math.abs(delta) < 0.01) return "flat";
  return delta > 0 ? "up" : "down";
}

export function compareWeeks(
  current: WeeklyStats,
  previous: WeeklyStats
): WeeklyComparison {
  return {
    current,
    previous,
    hoursDelta: Math.round((current.totalHours - previous.totalHours) * 10) / 10,
    consistencyDelta: current.consistencyScore - previous.consistencyScore,
    activeDaysDelta: current.activeDays - previous.activeDays,
    hoursTrend: trend(current.totalHours, previous.totalHours),
    consistencyTrend: trend(current.consistencyScore, previous.consistencyScore),
  };
}

// ---------------------------------------------------------------------------
// Consistency score label
// ---------------------------------------------------------------------------

export type PerformanceLabel = WeeklyReport["performanceLabel"];

export function getPerformanceLabel(consistencyScore: number): PerformanceLabel {
  if (consistencyScore === 0) return "none";
  if (consistencyScore >= 85) return "excellent";
  if (consistencyScore >= 57) return "good";   // 4+ days
  if (consistencyScore >= 28) return "moderate"; // 2–3 days
  return "low";
}

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

/**
 * Generates 2–4 human-readable insight strings from the weekly data.
 * These read like lightweight AI commentary without requiring an LLM.
 */
export function generateInsights(
  stats: WeeklyStats,
  comparison: WeeklyComparison | null,
  currentStreak: number
): string[] {
  const insights: string[] = [];

  // Hours context
  if (stats.totalHours === 0) {
    insights.push("No study sessions logged this week. A fresh start is always one session away.");
  } else if (stats.totalHours >= 20) {
    insights.push(`Outstanding — ${stats.totalHours}h logged this week. Elite-level consistency.`);
  } else if (stats.totalHours >= 10) {
    insights.push(`Strong week. ${stats.totalHours}h of focused study puts you in the top tier.`);
  } else {
    insights.push(`${stats.totalHours}h logged this week. Aim for ${Math.ceil(stats.totalHours * 1.2)}h next week for steady growth.`);
  }

  // Consistency
  if (stats.consistencyScore === 100) {
    insights.push("Perfect consistency — you studied every single day this week.");
  } else if (stats.consistencyScore >= 57) {
    insights.push(`${stats.activeDays} out of 7 days active. Solid consistency — push for one more day next week.`);
  } else if (stats.activeDays === 0) {
    // already handled above
  } else {
    insights.push(`${stats.activeDays} active day${stats.activeDays === 1 ? "" : "s"} this week. Aim for ${stats.activeDays + 2} next week to build momentum.`);
  }

  // Week-over-week comparison
  if (comparison) {
    if (comparison.hoursTrend === "up") {
      insights.push(`Up ${comparison.hoursDelta}h vs last week. You're trending in the right direction.`);
    } else if (comparison.hoursTrend === "down" && comparison.hoursDelta < -1) {
      insights.push(`Down ${Math.abs(comparison.hoursDelta)}h vs last week. This week is your chance to bounce back.`);
    }

    if (comparison.consistencyTrend === "up" && comparison.consistencyDelta >= 14) {
      insights.push(`Consistency improved by ${comparison.consistencyDelta}% — a meaningful shift.`);
    }
  }

  // Streak note
  if (currentStreak >= 7) {
    insights.push(`${currentStreak}-day streak active. Protect it — each day compounds.`);
  } else if (currentStreak >= 3) {
    insights.push(`${currentStreak}-day streak in progress. Keep showing up.`);
  }

  return insights.slice(0, 4); // Cap at 4 insights
}
