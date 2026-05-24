/**
 * @file streak-service.ts
 * @description Server-side business logic layer for streak management.
 *
 * Each exported function is a self-contained unit of work:
 *   - Reads required data from Supabase via streak-queries.ts
 *   - Runs pure calculations via streak.ts
 *   - Writes back only what changed
 *
 * All exports are async and safe to call from:
 *   - Next.js Server Actions  ("use server" files)
 *   - Route Handlers          (app/api/…/route.ts)
 *   - Cron jobs / background workers
 *
 * Never import this file on the client — it uses the server Supabase client.
 */

"use server";

import { format, startOfDay } from "date-fns";
import { createClient } from "@/utils/supabase/server";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from "@/lib/streak";
import {
  fetchStudySessions,
  fetchFreezeDays,
  fetchStreakRow,
  upsertStreakRow,
  insertFreezeDay,
  deleteFreezeDay,
  type UpsertStreakPayload,
} from "@/lib/streak-queries";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns YYYY-MM-DD for a given Date (or today if omitted). */
function toISODate(date?: Date): string {
  return format(startOfDay(date ?? new Date()), "yyyy-MM-dd");
}

/** Resolves the authenticated user or throws a clean error. */
async function requireUser() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();

  if (error || !user) throw new Error("Unauthenticated");
  return { db, userId: user.id };
}

// ---------------------------------------------------------------------------
// updateStreakAfterCheckIn
// ---------------------------------------------------------------------------

export interface UpdateStreakResult {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastStudyDate: string | null;
  isNewRecord: boolean;
  isComebackStreak: boolean;
}

/**
 * Recalculates and persists the streak after the user completes a daily
 * check-in (study session).  Call this immediately after inserting the new
 * study_sessions row so the session is already present in the DB.
 *
 * @param now  Optional — override "today" for testing.
 * @returns    Fresh streak numbers plus flags useful for UI feedback.
 */
export async function updateStreakAfterCheckIn(
  now?: Date
): Promise<UpdateStreakResult> {
  const { db, userId } = await requireUser();

  // Fetch all data needed for calculation
  const [sessions, freezeDays, existingRow] = await Promise.all([
    fetchStudySessions(db, userId),
    fetchFreezeDays(db, userId),
    fetchStreakRow(db, userId),
  ]);

  // Pure calculations
  const current = calculateCurrentStreak(sessions, freezeDays, now);
  const longest = calculateLongestStreak(sessions, freezeDays, now);

  const prevLongest = existingRow?.longest_streak ?? 0;
  const newLongest = Math.max(longest.longestStreak, prevLongest);
  const isNewRecord = newLongest > prevLongest;

  const today = toISODate(now);

  const payload: UpsertStreakPayload = {
    user_id: userId,
    current_streak: current.streak,
    longest_streak: newLongest,
    streak_start_date: current.streakStartDate,
    last_study_date: today,
    updated_at: new Date().toISOString(),
  };

  await upsertStreakRow(db, payload);

  return {
    currentStreak: current.streak,
    longestStreak: newLongest,
    streakStartDate: current.streakStartDate,
    lastStudyDate: today,
    isNewRecord,
    isComebackStreak: current.isComebackStreak,
  };
}

// ---------------------------------------------------------------------------
// resetStreak
// ---------------------------------------------------------------------------

/**
 * Explicitly resets the current streak to 0 (e.g. admin action, or called by
 * a nightly cron after detecting a missed day with no freeze cover).
 *
 * Longest streak is intentionally preserved — a reset never erases the record.
 */
export async function resetStreak(): Promise<void> {
  const { db, userId } = await requireUser();

  const existingRow = await fetchStreakRow(db, userId);

  const payload: UpsertStreakPayload = {
    user_id: userId,
    current_streak: 0,
    longest_streak: existingRow?.longest_streak ?? 0,
    streak_start_date: null,
    last_study_date: existingRow?.last_study_date ?? null,
    updated_at: new Date().toISOString(),
  };

  await upsertStreakRow(db, payload);
}

// ---------------------------------------------------------------------------
// syncStreakFromHistory
// ---------------------------------------------------------------------------

/**
 * Re-derives the streak entirely from stored session + freeze history and
 * writes the canonical values to the `streaks` table.
 *
 * Use this when:
 *   - A session is backdated or deleted
 *   - A freeze token is added/removed retroactively
 *   - Running a repair/migration job
 *
 * @param now  Optional override for testing.
 */
export async function syncStreakFromHistory(now?: Date): Promise<void> {
  const { db, userId } = await requireUser();

  const [sessions, freezeDays] = await Promise.all([
    fetchStudySessions(db, userId),
    fetchFreezeDays(db, userId),
  ]);

  const current = calculateCurrentStreak(sessions, freezeDays, now);
  const longest = calculateLongestStreak(sessions, freezeDays, now);

  // Determine last_study_date from session history
  const sortedSessions = [...sessions].sort((a, b) =>
    a.studied_at < b.studied_at ? 1 : -1
  );
  const lastStudyDate = sortedSessions[0]
    ? toISODate(new Date(sortedSessions[0].studied_at))
    : null;

  const payload: UpsertStreakPayload = {
    user_id: userId,
    current_streak: current.streak,
    longest_streak: longest.longestStreak,
    streak_start_date: current.streakStartDate,
    last_study_date: lastStudyDate,
    updated_at: new Date().toISOString(),
  };

  await upsertStreakRow(db, payload);
}

// ---------------------------------------------------------------------------
// applyFreezeDay
// ---------------------------------------------------------------------------

export interface ApplyFreezeDayResult {
  applied: boolean;
  /** The date the freeze was applied to (YYYY-MM-DD). */
  frozenDate: string;
  /** Updated current streak after freeze is considered. */
  currentStreak: number;
}

/**
 * Applies a freeze token to a specific date (default: today).
 *
 * The token is inserted into `freeze_days`, then the streak is recalculated
 * so the UI can immediately reflect the protected streak count.
 *
 * @param targetDate  The calendar date to freeze (default: today).
 * @param now         Override "today" for testing.
 */
export async function applyFreezeDay(
  targetDate?: string,
  now?: Date
): Promise<ApplyFreezeDayResult> {
  const { db, userId } = await requireUser();

  const frozenDate = targetDate ?? toISODate(now);

  await insertFreezeDay(db, { user_id: userId, used_on: frozenDate });

  // Recalculate streak with the new freeze in effect
  const [sessions, freezeDays] = await Promise.all([
    fetchStudySessions(db, userId),
    fetchFreezeDays(db, userId),
  ]);

  const current = calculateCurrentStreak(sessions, freezeDays, now);

  // Persist updated streak
  const existingRow = await fetchStreakRow(db, userId);

  await upsertStreakRow(db, {
    user_id: userId,
    current_streak: current.streak,
    longest_streak: existingRow?.longest_streak ?? current.streak,
    streak_start_date: current.streakStartDate,
    last_study_date: existingRow?.last_study_date ?? null,
    updated_at: new Date().toISOString(),
  });

  return {
    applied: true,
    frozenDate,
    currentStreak: current.streak,
  };
}

// ---------------------------------------------------------------------------
// removeFreezeDay
// ---------------------------------------------------------------------------

/**
 * Reverts a previously applied freeze token (admin / user correction flow).
 * Streak is re-synced from history after removal.
 *
 * @param targetDate  The YYYY-MM-DD date whose freeze token should be removed.
 * @param now         Override "today" for testing.
 */
export async function removeFreezeDay(
  targetDate: string,
  now?: Date
): Promise<void> {
  const { db, userId } = await requireUser();

  await deleteFreezeDay(db, userId, targetDate);
  await syncStreakFromHistory(now);
}

// ---------------------------------------------------------------------------
// getStreakSummary
// ---------------------------------------------------------------------------

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastStudyDate: string | null;
  studiedToday: boolean;
  frozenToday: boolean;
  isComebackStreak: boolean;
  freezesUsedInStreak: number;
}

/**
 * Returns a complete streak summary derived from live session + freeze history.
 * Prefer this over reading the `streaks` table directly in UI Server Components
 * since it reflects the true state without requiring a prior update call.
 *
 * @param now  Override "today" for testing.
 */
export async function getStreakSummary(now?: Date): Promise<StreakSummary> {
  const { db, userId } = await requireUser();

  const [sessions, freezeDays, row] = await Promise.all([
    fetchStudySessions(db, userId),
    fetchFreezeDays(db, userId),
    fetchStreakRow(db, userId),
  ]);

  const current = calculateCurrentStreak(sessions, freezeDays, now);
  const longest = calculateLongestStreak(sessions, freezeDays, now);

  return {
    currentStreak: current.streak,
    longestStreak: Math.max(longest.longestStreak, row?.longest_streak ?? 0),
    streakStartDate: current.streakStartDate,
    lastStudyDate: row?.last_study_date ?? null,
    studiedToday: current.studiedToday,
    frozenToday: current.frozenToday,
    isComebackStreak: current.isComebackStreak,
    freezesUsedInStreak: current.freezesUsedInStreak,
  };
}
