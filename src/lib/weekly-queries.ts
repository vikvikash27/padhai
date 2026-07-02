/**
 * @file weekly-queries.ts
 * @description Supabase data-access layer for the weekly report system.
 *
 * All queries are scoped to a single user and a specific date range.
 * No business logic lives here — only typed reads.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklySessionRow, CompletedMilestone } from "@/lib/weekly-types";

// ---------------------------------------------------------------------------
// Study sessions for a date range
// ---------------------------------------------------------------------------

/**
 * Fetches per-day aggregated study data for a user within [weekStart, weekEnd].
 *
 * Returns one row per calendar day that has sessions.
 * Days without sessions are NOT returned — the analytics layer fills the gaps.
 */
export async function fetchWeeklySessionRows(
  db: SupabaseClient,
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeeklySessionRow[]> {
  // study_sessions table has: session_date (date), hours (numeric), user_id
  const { data, error } = await db
    .from("study_sessions")
    .select("session_date, hours")
    .eq("user_id", userId)
    .gte("session_date", weekStart)
    .lte("session_date", weekEnd)
    .order("session_date", { ascending: true });

  if (error) throw new Error(`fetchWeeklySessionRows: ${error.message}`);

  // Aggregate by date (multiple sessions same day → sum)
  const map = new Map<string, WeeklySessionRow>();
  for (const row of data ?? []) {
    const existing = map.get(row.session_date);
    if (existing) {
      existing.hours += row.hours;
      existing.sessions += 1;
    } else {
      map.set(row.session_date, {
        session_date: row.session_date,
        hours: row.hours,
        sessions: 1,
      });
    }
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Streak row for the user
// ---------------------------------------------------------------------------

export interface UserStreakSnapshot {
  currentStreak: number;
  longestStreak: number;
}

export async function fetchUserStreakSnapshot(
  db: SupabaseClient,
  userId: string
): Promise<UserStreakSnapshot> {
  const { data, error } = await db
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`fetchUserStreakSnapshot: ${error.message}`);

  return {
    currentStreak: data?.current_streak ?? 0,
    longestStreak: data?.longest_streak ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Completed milestones this week
// ---------------------------------------------------------------------------

export async function fetchCompletedMilestonesThisWeek(
  db: SupabaseClient,
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<CompletedMilestone[]> {
  // milestones table: id, title, completed_at, goal_id (no user_id)
  // goals table: id, title, user_id
  const { data, error } = await db
    .from("milestones")
    .select("id, title, completed_at, goal_id, goals!inner(title)")
    .eq("goals.user_id", userId)
    .eq("is_completed", true)
    .gte("completed_at", `${weekStart}T00:00:00Z`)
    .lte("completed_at", `${weekEnd}T23:59:59Z`);

  if (error) throw new Error(`fetchCompletedMilestonesThisWeek: ${error.message}`);

  return (data ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    goalTitle: m.goals?.title ?? "Unknown Goal",
    completedAt: m.completed_at,
  }));
}

// ---------------------------------------------------------------------------
// Active goal count
// ---------------------------------------------------------------------------

export async function fetchActiveGoalCount(
  db: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await db
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw new Error(`fetchActiveGoalCount: ${error.message}`);
  return count ?? 0;
}
