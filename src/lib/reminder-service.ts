/**
 * @file reminder-service.ts
 * @description Orchestration layer for the reminder engine.
 *
 * Responsibilities:
 *  - Compose pure utilities (inactivity.ts) with DB queries (reminder-queries.ts)
 *  - Send emails via Resend
 *  - Record every send attempt in the `reminders` table
 *  - Prevent duplicate sends (idempotent per user+tier+day)
 *
 * Designed to be called from the cron route handler only.
 * Does NOT use "use server" — this runs in a Node.js Route Handler context.
 */

import { Resend } from "resend";
import { format, startOfDay } from "date-fns";
import {
  calcInactiveDays,
  resolveReminderTier,
  isEligibleForReminder,
} from "@/lib/inactivity";
import {
  fetchAllInactivityProfiles,
  hasReminderSentToday,
  insertReminderRecord,
} from "@/lib/reminder-queries";
import { renderReminderEmail } from "@/lib/reminder-templates";
import type {
  InactivityProfile,
  SendReminderResult,
  CronRunResult,
  ReminderTier,
} from "@/lib/reminder-types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Push notification helper
// ---------------------------------------------------------------------------

async function sendPushNotification(
  db: SupabaseClient,
  userId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const { data: tokens } = await db
      .from("push_tokens")
      .select("expo_push_token")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (!tokens?.length) return false;

    // Call the push notification API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://padhai.app";
    const res = await fetch(
      `${appUrl}/api/push-notifications?secret=${process.env.CRON_SECRET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, body }),
      }
    );

    return res.ok;
  } catch (e) {
    console.error("[push] Failed to send push notification:", e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Resend client (lazy singleton)
// ---------------------------------------------------------------------------

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "PadhAI <noreply@padhai.app>";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://padhai.app";
}

// ---------------------------------------------------------------------------
// Single-user reminder send
// ---------------------------------------------------------------------------

/**
 * Processes one user profile:
 *  1. Calculates inactive days
 *  2. Resolves tier
 *  3. Checks eligibility + dedup
 *  4. Sends email via Resend
 *  5. Records the attempt in `reminders` table
 */
export async function processSingleUserReminder(
  db: SupabaseClient,
  profile: InactivityProfile,
  now?: Date
): Promise<SendReminderResult> {
  const inactiveDays = calcInactiveDays(profile.lastStudyDate, now);
  const tier = resolveReminderTier(inactiveDays);

  // -- Eligibility check --
  const eligibility = isEligibleForReminder({
    email: profile.email,
    inactiveDays,
    frozenToday: profile.frozenToday,
    tier,
  });

  if (!eligibility.eligible) {
    return {
      userId: profile.userId,
      tier: tier ?? "gentle",
      sent: false,
      skipped: true,
      reason: eligibility.reason,
    };
  }

  const resolvedTier = tier as ReminderTier;
  const today = format(startOfDay(now ?? new Date()), "yyyy-MM-dd");

  // -- Dedup: already sent this tier today? --
  const alreadySent = await hasReminderSentToday(db, profile.userId, resolvedTier);
  if (alreadySent) {
    return {
      userId: profile.userId,
      tier: resolvedTier,
      sent: false,
      skipped: true,
      reason: "already_sent_today",
    };
  }

  // -- Build and send email --
  const { subject, html } = renderReminderEmail(resolvedTier, {
    name: profile.name,
    inactiveDays,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastStudyDate: profile.lastStudyDate,
    appUrl: getAppUrl(),
  });

  let resendId: string | null = null;
  let delivered = false;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: profile.email,
      subject,
      html,
    });

    if (error) {
      console.error(`[reminder] Resend error for ${profile.userId}:`, error);
    } else {
      resendId = data?.id ?? null;
      delivered = true;
    }
  } catch (err) {
    console.error(`[reminder] Send failed for ${profile.userId}:`, err);
  }

  // -- Always record the attempt (success or failure) --
  await insertReminderRecord(db, {
    user_id: profile.userId,
    tier: resolvedTier,
    reminder_date: today,
    resend_id: resendId,
    delivered,
  });

  // -- Send push notification alongside email --
  const pushTitle = "PadhAI Reminder";
  const pushBody = inactiveDays > 0
    ? `You haven't studied in ${inactiveDays} day${inactiveDays > 1 ? "s" : ""}. Your streak is at risk!`
    : "Time to check in and keep your streak going!";
  await sendPushNotification(db, profile.userId, pushTitle, pushBody);

  return {
    userId: profile.userId,
    tier: resolvedTier,
    sent: delivered,
    skipped: false,
    resendId: resendId ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Batch cron run
// ---------------------------------------------------------------------------

/**
 * Processes all eligible users in a single cron execution.
 * Results are returned for logging — no exceptions are thrown.
 *
 * @param db    Supabase client with service-role key (bypasses RLS)
 * @param now   Optional override for "today" (testing)
 */
export async function runReminderCron(
  db: SupabaseClient,
  now?: Date
): Promise<CronRunResult> {
  const processedAt = new Date().toISOString();

  // Fetch all profiles
  let profiles: InactivityProfile[] = [];
  try {
    profiles = await fetchAllInactivityProfiles(db);
  } catch (err) {
    console.error("[reminder-cron] Failed to fetch profiles:", err);
    return {
      processedAt,
      totalUsers: 0,
      sent: 0,
      skipped: 0,
      errors: 1,
      results: [],
    };
  }

  const results: SendReminderResult[] = [];
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  // Process sequentially to avoid Resend rate-limit bursts
  for (const profile of profiles) {
    try {
      const result = await processSingleUserReminder(db, profile, now);
      results.push(result);
      if (result.sent) sent++;
      else skipped++;
    } catch (err) {
      console.error(`[reminder-cron] Error for user ${profile.userId}:`, err);
      errors++;
      results.push({
        userId: profile.userId,
        tier: "gentle",
        sent: false,
        skipped: false,
        reason: "internal_error",
      });
    }
  }

  console.log(
    `[reminder-cron] Done. total=${profiles.length} sent=${sent} skipped=${skipped} errors=${errors}`
  );

  return {
    processedAt,
    totalUsers: profiles.length,
    sent,
    skipped,
    errors,
    results,
  };
}
