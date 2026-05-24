/**
 * @file reminder-queries.ts
 * @description Supabase data-access layer for the reminder engine.
 *
 * Table assumed:
 *   reminders – columns: id (uuid), user_id, tier, sent_at, reminder_date,
 *               resend_id, delivered, created_at
 *
 * Also reads from:
 *   auth.users  – email, raw_user_meta_data->full_name
 *   streaks     – last_study_date, current_streak, longest_streak
 *   freeze_days – used_on
 *   goals       – user_id (to check hasGoals)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReminderRecord, ReminderTier, InactivityProfile } from "@/lib/reminder-types";
import { format, startOfDay } from "date-fns";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Read: all users eligible for reminder processing
// ---------------------------------------------------------------------------

/**
 * Fetches all users who might need a reminder check.
 * Uses the service-role client (bypasses RLS) — only call from cron routes.
 *
 * Returns a minimal profile for each user; eligibility is decided in the
 * service layer using pure functions from inactivity.ts.
 */
export async function fetchAllInactivityProfiles(
  db: SupabaseClient
): Promise<InactivityProfile[]> {
  const today = todayISO();

  // 1. Fetch all users with streak rows (last_study_date is the key signal)
  const { data: streakRows, error: streakErr } = await db
    .from("streaks")
    .select("user_id, last_study_date, current_streak, longest_streak");

  if (streakErr) throw new Error(`fetchAllInactivityProfiles/streaks: ${streakErr.message}`);
  if (!streakRows || streakRows.length === 0) return [];

  const userIds = streakRows.map((r: any) => r.user_id);

  // 2. Fetch freeze tokens for today (to filter out frozen users)
  const { data: frozenRows, error: frozenErr } = await db
    .from("freeze_days")
    .select("user_id")
    .eq("used_on", today)
    .in("user_id", userIds);

  if (frozenErr) throw new Error(`fetchAllInactivityProfiles/freeze_days: ${frozenErr.message}`);
  const frozenSet = new Set((frozenRows ?? []).map((r: any) => r.user_id));

  // 3. Fetch users who have at least one goal
  const { data: goalRows, error: goalErr } = await db
    .from("goals")
    .select("user_id")
    .in("user_id", userIds);

  if (goalErr) throw new Error(`fetchAllInactivityProfiles/goals: ${goalErr.message}`);
  const goalSet = new Set((goalRows ?? []).map((r: any) => r.user_id));

  // 4. Fetch auth user emails + names via admin API
  // Note: this requires a service-role key on the Supabase client passed in
  const { data: authUsers, error: authErr } = await db.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authErr) throw new Error(`fetchAllInactivityProfiles/auth.users: ${authErr.message}`);

  const authMap = new Map(
    (authUsers?.users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? "",
        name:
          (u.user_metadata?.full_name as string) ||
          (u.user_metadata?.name as string) ||
          (u.email?.split("@")[0] ?? "Student"),
      },
    ])
  );

  // 5. Assemble profiles
  return streakRows.map((row: any) => {
    const auth = authMap.get(row.user_id) ?? { email: "", name: "Student" };
    return {
      userId: row.user_id,
      email: auth.email,
      name: auth.name,
      lastStudyDate: row.last_study_date ?? null,
      currentStreak: row.current_streak ?? 0,
      longestStreak: row.longest_streak ?? 0,
      inactiveDays: 0, // computed externally in service layer
      frozenToday: frozenSet.has(row.user_id),
      hasGoals: goalSet.has(row.user_id),
    };
  });
}

// ---------------------------------------------------------------------------
// Read: check for existing reminder (dedup guard)
// ---------------------------------------------------------------------------

/**
 * Returns true if a reminder of the same tier was already sent today.
 * Prevents duplicate sends on cron re-execution.
 */
export async function hasReminderSentToday(
  db: SupabaseClient,
  userId: string,
  tier: ReminderTier
): Promise<boolean> {
  const today = todayISO();

  const { data, error } = await db
    .from("reminders")
    .select("id")
    .eq("user_id", userId)
    .eq("tier", tier)
    .eq("reminder_date", today)
    .maybeSingle();

  if (error) throw new Error(`hasReminderSentToday: ${error.message}`);
  return !!data;
}

// ---------------------------------------------------------------------------
// Write: insert reminder record
// ---------------------------------------------------------------------------

export interface InsertReminderPayload {
  user_id: string;
  tier: ReminderTier;
  reminder_date: string;
  resend_id: string | null;
  delivered: boolean;
}

/**
 * Persists a reminder record after a send attempt.
 * Always writes regardless of delivery success, so failures are traceable.
 */
export async function insertReminderRecord(
  db: SupabaseClient,
  payload: InsertReminderPayload
): Promise<ReminderRecord> {
  const { data, error } = await db
    .from("reminders")
    .insert({
      ...payload,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`insertReminderRecord: ${error.message}`);
  return data as ReminderRecord;
}

// ---------------------------------------------------------------------------
// Read: reminder history for a single user (for dashboard display)
// ---------------------------------------------------------------------------

/**
 * Fetches the last N reminder records for a user, newest first.
 */
export async function fetchReminderHistory(
  db: SupabaseClient,
  userId: string,
  limit = 5
): Promise<ReminderRecord[]> {
  const { data, error } = await db
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`fetchReminderHistory: ${error.message}`);
  return (data ?? []) as ReminderRecord[];
}

// ---------------------------------------------------------------------------
// Read: last reminder for a single user (for dashboard status)
// ---------------------------------------------------------------------------

export async function fetchLastReminder(
  db: SupabaseClient,
  userId: string
): Promise<ReminderRecord | null> {
  const { data, error } = await db
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`fetchLastReminder: ${error.message}`);
  return data as ReminderRecord | null;
}
