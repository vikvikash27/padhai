/**
 * @file app/api/cron/reminders/route.ts
 * @description Next.js Route Handler for the nightly reminder cron job.
 *
 * ## Invocation options
 *
 * ### 1. Vercel Cron (recommended for production)
 * Add to `vercel.json`:
 * ```json
 * {
 *   "crons": [{ "path": "/api/cron/reminders", "schedule": "0 18 * * *" }]
 * }
 * ```
 * This fires daily at 18:00 UTC (11:30 PM IST).
 *
 * ### 2. Supabase pg_cron → HTTP webhook
 * ```sql
 * select cron.schedule(
 *   'padhai-reminders',
 *   '0 18 * * *',
 *   $$select net.http_post(
 *     url := 'https://your-domain.com/api/cron/reminders',
 *     headers := '{"Authorization": "Bearer <CRON_SECRET>"}'::jsonb
 *   )$$
 * );
 * ```
 *
 * ## Security
 * The endpoint is guarded by a `CRON_SECRET` bearer token.
 * Set `CRON_SECRET` in your environment variables.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runReminderCron } from "@/lib/reminder-service";

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const secret = process.env.CRON_SECRET;

  // If no secret configured in production, fail closed
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Supabase service-role client (bypasses RLS for batch operations)
// ---------------------------------------------------------------------------

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

async function handleReminders(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getServiceClient();
    const result = await runReminderCron(db);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[/api/cron/reminders] Fatal error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleReminders(req);
}

export async function POST(req: NextRequest) {
  return handleReminders(req);
}
