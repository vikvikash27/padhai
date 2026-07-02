/**
 * @file reminder-types.ts
 * @description Shared types for the PadhAI reminder engine.
 */

// ---------------------------------------------------------------------------
// Escalation tiers
// ---------------------------------------------------------------------------

/** The three escalation levels, in ascending severity. */
export type ReminderTier = "gentle" | "accountability" | "comeback";

/** Maps inactive-day thresholds to their tier. */
export const REMINDER_THRESHOLDS: Record<number, ReminderTier> = {
  2: "gentle",
  4: "accountability",
  7: "comeback",
} as const;

/** Sorted thresholds ascending — used for tier resolution. */
export const THRESHOLD_DAYS = [2, 4, 7] as const;

// ---------------------------------------------------------------------------
// User inactivity profile
// ---------------------------------------------------------------------------

export interface InactivityProfile {
  userId: string;
  email: string;
  name: string;
  /** Days since the user last studied (calendar days, UTC). */
  inactiveDays: number;
  /** YYYY-MM-DD of their last study session, or null if never. */
  lastStudyDate: string | null;
  /** Their current streak count (may be 0). */
  currentStreak: number;
  /** Their all-time best streak. */
  longestStreak: number;
  /** Whether today is covered by a freeze token (excluded from inactivity). */
  frozenToday: boolean;
  /** Whether the user has any active goals. */
  hasGoals: boolean;
}

// ---------------------------------------------------------------------------
// Reminder record (mirrors the `reminders` DB table)
// ---------------------------------------------------------------------------

export interface ReminderRecord {
  id: string;
  user_id: string;
  tier: ReminderTier;
  /** YYYY-MM-DD the reminder was for. */
  reminder_date: string;
  /** Resend message ID, for delivery tracking. */
  resend_id: string | null;
  /** Whether delivery succeeded. */
  delivered: boolean;
  /** Auto-populated timestamp from Supabase. */
  created_at: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface SendReminderResult {
  userId: string;
  tier: ReminderTier;
  sent: boolean;
  skipped: boolean;
  /** Skip reason when skipped = true */
  reason?: string;
  resendId?: string;
}

export interface CronRunResult {
  processedAt: string;
  totalUsers: number;
  sent: number;
  skipped: number;
  errors: number;
  results: SendReminderResult[];
}
