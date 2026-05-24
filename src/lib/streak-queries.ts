/**
 * @file streak-queries.ts
 * @description Low-level Supabase data-access functions for streak-related
 * tables.  No business logic lives here — only typed reads and writes.
 *
 * Tables assumed (from the schema in PROMPTS.md / Step 2):
 *   study_sessions  – columns: id, user_id, studied_at, hours, notes
 *   streaks         – columns: id, user_id, current_streak, longest_streak,
 *                              streak_start_date, last_study_date, updated_at
 *   freeze_days     – columns: id, user_id, used_on
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FreezeDay, StudySession } from "@/lib/streak";

// ---------------------------------------------------------------------------
// Row types (mirror DB columns we care about)
// ---------------------------------------------------------------------------

export interface StreakRow {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_start_date: string | null; // YYYY-MM-DD
  last_study_date: string | null;   // YYYY-MM-DD
  updated_at: string;
}

export interface FreezeDayRow {
  id: string;
  user_id: string;
  used_on: string; // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Fetches all study sessions for a user, ordered oldest → newest.
 * Returns the minimal shape that streak.ts needs.
 */
export async function fetchStudySessions(
  db: SupabaseClient,
  userId: string
): Promise<StudySession[]> {
  const { data, error } = await db
    .from("study_sessions")
    .select("studied_at")
    .eq("user_id", userId)
    .order("studied_at", { ascending: true });

  if (error) throw new Error(`fetchStudySessions: ${error.message}`);
  return (data ?? []) as StudySession[];
}

/**
 * Fetches all freeze tokens consumed by a user.
 * Returns the minimal shape that streak.ts needs.
 */
export async function fetchFreezeDays(
  db: SupabaseClient,
  userId: string
): Promise<FreezeDay[]> {
  const { data, error } = await db
    .from("freeze_days")
    .select("used_on")
    .eq("user_id", userId)
    .order("used_on", { ascending: true });

  if (error) throw new Error(`fetchFreezeDays: ${error.message}`);
  return (data ?? []) as FreezeDay[];
}

/**
 * Fetches the current streak row for a user, or `null` if none exists yet.
 */
export async function fetchStreakRow(
  db: SupabaseClient,
  userId: string
): Promise<StreakRow | null> {
  const { data, error } = await db
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`fetchStreakRow: ${error.message}`);
  return data as StreakRow | null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface UpsertStreakPayload {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_start_date: string | null;
  last_study_date: string | null;
  updated_at: string;
}

/**
 * Upserts the streak row for a user (insert on first call, update thereafter).
 * Uses `user_id` as the conflict target — the table must have a UNIQUE
 * constraint on `user_id`.
 */
export async function upsertStreakRow(
  db: SupabaseClient,
  payload: UpsertStreakPayload
): Promise<void> {
  const { error } = await db
    .from("streaks")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw new Error(`upsertStreakRow: ${error.message}`);
}

export interface InsertFreezeDayPayload {
  user_id: string;
  used_on: string; // YYYY-MM-DD
}

/**
 * Inserts a new freeze token for `used_on` date.
 * Silently ignores duplicates (same user + same date) via the unique
 * constraint `freeze_days_user_id_used_on_key`.
 */
export async function insertFreezeDay(
  db: SupabaseClient,
  payload: InsertFreezeDayPayload
): Promise<void> {
  const { error } = await db
    .from("freeze_days")
    .upsert(payload, { onConflict: "user_id,used_on" });

  if (error) throw new Error(`insertFreezeDay: ${error.message}`);
}

/**
 * Removes a freeze token (e.g. if user cancels / admin reverts).
 */
export async function deleteFreezeDay(
  db: SupabaseClient,
  userId: string,
  usedOn: string
): Promise<void> {
  const { error } = await db
    .from("freeze_days")
    .delete()
    .eq("user_id", userId)
    .eq("used_on", usedOn);

  if (error) throw new Error(`deleteFreezeDay: ${error.message}`);
}
