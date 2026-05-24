/**
 * @file inactivity.ts
 * @description Pure inactivity detection utilities — no DB, no side effects.
 *
 * All date arithmetic uses UTC calendar days to remain timezone-safe
 * regardless of where the server or user is located.
 */

import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import {
  REMINDER_THRESHOLDS,
  THRESHOLD_DAYS,
  type ReminderTier,
} from "@/lib/reminder-types";

// ---------------------------------------------------------------------------
// Core: inactive days calculation
// ---------------------------------------------------------------------------

/**
 * Returns the number of UTC calendar days since the user last studied.
 *
 * - Returns 0 if `lastStudyDate` is today.
 * - Returns `Infinity` if the user has never studied.
 * - `now` defaults to the current instant; pass a fixed value for testing.
 */
export function calcInactiveDays(
  lastStudyDate: string | null,
  now?: Date
): number {
  if (!lastStudyDate) return Infinity;

  const today = startOfDay(now ?? new Date());
  const last = startOfDay(parseISO(lastStudyDate));

  return differenceInCalendarDays(today, last);
}

// ---------------------------------------------------------------------------
// Tier resolution
// ---------------------------------------------------------------------------

/**
 * Resolves which reminder tier applies for a given inactive-day count.
 *
 * - Returns `null` if no threshold is met (user is still active or at day 1).
 * - Returns the *highest* applicable tier (e.g. 8 inactive days → "comeback").
 * - Freeze-day users should be excluded before calling this function.
 */
export function resolveReminderTier(inactiveDays: number): ReminderTier | null {
  if (!isFinite(inactiveDays) || inactiveDays < 2) return null;

  // Walk thresholds from highest to lowest, return first match
  for (const days of [...THRESHOLD_DAYS].reverse()) {
    if (inactiveDays >= days) {
      return REMINDER_THRESHOLDS[days];
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Eligibility checks
// ---------------------------------------------------------------------------

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

/**
 * Determines whether a reminder should be sent for a user.
 *
 * Checks (in order):
 *  1. User has an email address
 *  2. User is not active today (inactiveDays >= 1)
 *  3. Today is not covered by a freeze token
 *  4. Resolved tier is not null (threshold met)
 */
export function isEligibleForReminder(opts: {
  email: string | null;
  inactiveDays: number;
  frozenToday: boolean;
  tier: ReminderTier | null;
}): EligibilityResult {
  const { email, inactiveDays, frozenToday, tier } = opts;

  if (!email) return { eligible: false, reason: "no_email" };
  if (inactiveDays === 0) return { eligible: false, reason: "active_today" };
  if (frozenToday) return { eligible: false, reason: "frozen_today" };
  if (!tier) return { eligible: false, reason: "below_threshold" };

  return { eligible: true };
}

// ---------------------------------------------------------------------------
// Risk level for UI indicators
// ---------------------------------------------------------------------------

export type InactivityRisk = "none" | "low" | "medium" | "high";

/**
 * Maps inactive days to a risk level for dashboard indicators.
 *
 * - none   → 0 days (studied today)
 * - low    → 1 day  (at risk of losing streak)
 * - medium → 2–3 days (streak already broken)
 * - high   → 4+ days (accountability / comeback territory)
 */
export function getInactivityRisk(inactiveDays: number): InactivityRisk {
  if (inactiveDays === 0) return "none";
  if (inactiveDays === 1) return "low";
  if (inactiveDays <= 3) return "medium";
  return "high";
}
