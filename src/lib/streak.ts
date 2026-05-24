/**
 * @file streak.ts
 * @description Pure streak-calculation utilities for PadhAI.
 *
 * All functions are timezone-safe: dates are normalised to UTC midnight
 * (YYYY-MM-DD) before any arithmetic so that DST transitions and
 * user-locale offsets never corrupt streak counts.
 *
 * Dependencies: date-fns v4  (already in package.json)
 * No Supabase queries – callers pass plain data in, get plain data out.
 */

import {
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** ISO-8601 date string – YYYY-MM-DD */
export type ISODate = string;

/**
 * A single study session as stored in the DB (only the date matters here).
 * Pass `studied_at` as a UTC ISO string; the helpers strip the time part.
 */
export interface StudySession {
  /** UTC ISO-8601 timestamp or date string, e.g. "2026-05-24T18:30:00Z" */
  studied_at: string;
}

/**
 * A freeze (shield) token the user has consumed.
 * `used_on` must be a UTC ISO date string.
 */
export interface FreezeDay {
  /** The calendar date the freeze was applied to, e.g. "2026-05-22" */
  used_on: ISODate;
}

/** Rich result returned by `calculateCurrentStreak`. */
export interface CurrentStreakResult {
  /** Number of consecutive active (or frozen) days up to today. */
  streak: number;
  /** The earliest date that is part of the current streak. */
  streakStartDate: ISODate | null;
  /** Whether today has already been logged (streak is "live"). */
  studiedToday: boolean;
  /** Whether today is covered by a freeze token. */
  frozenToday: boolean;
  /**
   * True when the user missed at least one non-frozen day but returned.
   * Used to surface a "Welcome back 🔥" UI badge.
   */
  isComebackStreak: boolean;
  /** How many freeze tokens were consumed within the current streak window. */
  freezesUsedInStreak: number;
}

/** Rich result returned by `calculateLongestStreak`. */
export interface LongestStreakResult {
  /** Maximum consecutive days (freeze days count as active). */
  longestStreak: number;
  /** First day of the record-breaking run. */
  startDate: ISODate | null;
  /** Last day of the record-breaking run. */
  endDate: ISODate | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strips the time component from any ISO string and returns a UTC midnight
 * Date object.  Using `startOfDay(parseISO(…))` from date-fns gives us a
 * locale-agnostic canonical date so that all comparisons are timezone-safe.
 */
function toUTCDate(iso: string): Date {
  // parseISO handles both "2026-05-24" and "2026-05-24T18:30:00Z" correctly.
  return startOfDay(parseISO(iso));
}

/**
 * Returns today as a UTC midnight Date using the *local* clock.
 * Passing an explicit `now` parameter lets callers inject a deterministic
 * instant for unit-testing.
 */
function today(now?: Date): Date {
  return startOfDay(now ?? new Date());
}

/**
 * Converts a Date to an ISO date string (YYYY-MM-DD) without any
 * timezone shifting – always UTC.
 */
function toISODate(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

/**
 * Deduplicates and sorts an array of Dates ascending (earliest first).
 * Equality is checked at the calendar-day level.
 */
function uniqueSortedDates(dates: Date[]): Date[] {
  const seen = new Set<string>();
  const unique: Date[] = [];

  for (const d of dates) {
    const key = toISODate(d);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(d);
    }
  }

  unique.sort((a, b) => a.getTime() - b.getTime());
  return unique;
}

/**
 * Builds a Set<string> of YYYY-MM-DD keys from an array of FreezeDay records.
 * O(n) lookup later.
 */
function buildFreezeSet(freezeDays: FreezeDay[]): Set<ISODate> {
  return new Set(freezeDays.map((f) => f.used_on));
}

// ---------------------------------------------------------------------------
// Comeback streak detection
// ---------------------------------------------------------------------------

/**
 * Returns `true` when a user's session history shows a pattern of:
 *   previous streak ≥ 1  →  gap of ≥ 1 missed non-frozen day  →  new activity
 *
 * A "comeback" is only meaningful when the current streak is active (streak ≥ 1)
 * and the very last gap before the current run was a broken (non-frozen) day.
 *
 * @param sortedStudyDates  Ascending-sorted unique calendar dates of all sessions.
 * @param freezeSet         Set of frozen YYYY-MM-DD dates.
 * @param currentStreakStart  Start date of the active streak (or null).
 */
function detectComebackStreak(
  sortedStudyDates: Date[],
  freezeSet: Set<ISODate>,
  currentStreakStart: Date | null
): boolean {
  if (!currentStreakStart || sortedStudyDates.length === 0) return false;

  // Find study dates strictly BEFORE the current streak window
  const priorDates = sortedStudyDates.filter((d) =>
    isBefore(d, currentStreakStart)
  );

  if (priorDates.length === 0) return false;

  // Last active date before the current streak
  const lastPriorDate = priorDates[priorDates.length - 1];

  // Days between lastPriorDate and currentStreakStart (exclusive)
  const gap = differenceInCalendarDays(currentStreakStart, lastPriorDate);

  if (gap <= 1) return false; // No real gap; streaks merged naturally

  // Check whether every day in the gap was frozen
  for (let i = 1; i < gap; i++) {
    const gapDay = toISODate(subDays(currentStreakStart, i));
    if (!freezeSet.has(gapDay)) {
      // At least one non-frozen missed day ⇒ real comeback
      return true;
    }
  }

  return false; // All gap days were frozen; no true break
}

// ---------------------------------------------------------------------------
// calculateCurrentStreak
// ---------------------------------------------------------------------------

/**
 * Calculates the user's **current** streak from a list of study sessions
 * and consumed freeze tokens, as of a given reference date (default: now).
 *
 * ### Streak rules
 * - A streak increments by 1 for each consecutive calendar day that has
 *   either a study session **or** an active freeze token.
 * - A freeze token on a day the user already studied has no extra effect
 *   (it is simply not needed).
 * - If today has neither a session nor a freeze, the streak is considered
 *   *in progress* (not yet broken) for the current calendar day only.
 *   The streak will break at midnight if the user still hasn't studied.
 * - Future dates in `sessions` or `freezeDays` are ignored.
 *
 * @param sessions    All study sessions for the user (any order, any count).
 * @param freezeDays  All freeze tokens the user has spent.
 * @param now         Optional – override "today" (useful for testing).
 */
export function calculateCurrentStreak(
  sessions: StudySession[],
  freezeDays: FreezeDay[],
  now?: Date
): CurrentStreakResult {
  const todayDate = today(now);
  const todayKey = toISODate(todayDate);
  const freezeSet = buildFreezeSet(freezeDays);

  // Collect unique study dates at or before today, ascending
  const studyDates = uniqueSortedDates(
    sessions
      .map((s) => toUTCDate(s.studied_at))
      .filter((d) => !isAfter(d, todayDate))
  );

  const studiedToday = studyDates.some((d) => toISODate(d) === todayKey);
  const frozenToday = freezeSet.has(todayKey);

  // Walk backwards from today to find the streak length
  let streak = 0;
  let streakStartDate: Date | null = null;
  let freezesUsed = 0;

  // Build a fast lookup for study dates
  const studySet = new Set(studyDates.map(toISODate));

  let cursor = todayDate;

  while (true) {
    const key = toISODate(cursor);
    const hasStudy = studySet.has(key);
    const hasFree = freezeSet.has(key);

    if (hasStudy || hasFree) {
      streak++;
      streakStartDate = cursor;
      if (hasFree && !hasStudy) freezesUsed++;
      cursor = subDays(cursor, 1);
    } else {
      break; // Gap found – streak ends here
    }
  }

  const isComebackStreak = detectComebackStreak(
    studyDates,
    freezeSet,
    streakStartDate
  );

  return {
    streak,
    streakStartDate: streakStartDate ? toISODate(streakStartDate) : null,
    studiedToday,
    frozenToday,
    isComebackStreak,
    freezesUsedInStreak: freezesUsed,
  };
}

// ---------------------------------------------------------------------------
// calculateLongestStreak
// ---------------------------------------------------------------------------

/**
 * Scans the **entire** history of sessions and freeze days to find the
 * longest consecutive run the user has ever achieved.
 *
 * Freeze days extend a run just as study days do, as long as they
 * appear in the middle or at the boundaries of an otherwise-active period.
 *
 * @param sessions    All study sessions (any order).
 * @param freezeDays  All freeze tokens (any order).
 * @param now         Optional – upper bound for "today" (useful for testing).
 */
export function calculateLongestStreak(
  sessions: StudySession[],
  freezeDays: FreezeDay[],
  now?: Date
): LongestStreakResult {
  const todayDate = today(now);
  const freezeSet = buildFreezeSet(freezeDays);

  // Merge study dates + freeze dates into one unified sorted list
  const studyDates = sessions
    .map((s) => toUTCDate(s.studied_at))
    .filter((d) => !isAfter(d, todayDate));

  const freezeDates = [...freezeSet]
    .map((iso) => toUTCDate(iso))
    .filter((d) => !isAfter(d, todayDate));

  const allDates = uniqueSortedDates([...studyDates, ...freezeDates]);

  if (allDates.length === 0) {
    return { longestStreak: 0, startDate: null, endDate: null };
  }

  let longestStreak = 1;
  let bestStart = allDates[0];
  let bestEnd = allDates[0];

  let currentRun = 1;
  let currentStart = allDates[0];

  for (let i = 1; i < allDates.length; i++) {
    const gap = differenceInCalendarDays(allDates[i], allDates[i - 1]);

    if (gap === 1) {
      // Consecutive day – extend current run
      currentRun++;
    } else {
      // Gap detected – restart run
      currentRun = 1;
      currentStart = allDates[i];
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun;
      bestStart = currentStart;
      bestEnd = allDates[i];
    }
  }

  // Edge case: single-element list handled by initial assignment above
  if (allDates.length === 1) {
    longestStreak = 1;
    bestStart = allDates[0];
    bestEnd = allDates[0];
  }

  return {
    longestStreak,
    startDate: toISODate(bestStart),
    endDate: toISODate(bestEnd),
  };
}

// ---------------------------------------------------------------------------
// getStreakStatus  (convenience aggregator)
// ---------------------------------------------------------------------------

export interface StreakStatus {
  current: CurrentStreakResult;
  longest: LongestStreakResult;
}

/**
 * Convenience wrapper that returns both current and longest streak results
 * in one call, sharing the same `now` reference for consistency.
 *
 * @example
 * ```ts
 * const { current, longest } = getStreakStatus(sessions, freezeDays);
 * console.log(`Current: ${current.streak} days`);
 * console.log(`Record:  ${longest.longestStreak} days`);
 * ```
 */
export function getStreakStatus(
  sessions: StudySession[],
  freezeDays: FreezeDay[],
  now?: Date
): StreakStatus {
  const pinnedNow = now ?? new Date();
  return {
    current: calculateCurrentStreak(sessions, freezeDays, pinnedNow),
    longest: calculateLongestStreak(sessions, freezeDays, pinnedNow),
  };
}
