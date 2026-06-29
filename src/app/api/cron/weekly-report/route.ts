/**
 * @file app/api/cron/weekly-report/route.ts
 * @description Cron endpoint that sends weekly reports to all users.
 *
 * Schedule: Sunday at 20:00 UTC (1:30 AM IST Monday)
 *
 * vercel.json:
 * { "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 20 * * 0" }] }
 *
 * Supabase pg_cron alternative:
 * select cron.schedule('padhai-weekly', '0 20 * * 0',
 *   $$ select net.http_post(url := 'https://domain.com/api/cron/weekly-report',
 *       headers := '{"Authorization":"Bearer <CRON_SECRET>"}'::jsonb) $$);
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildWeeklyReport } from "@/lib/weekly-report-service";
import { renderWeeklyReportEmail } from "@/lib/weekly-email-template";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase service-role config");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

async function handleWeeklyReport(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL ?? "PadhAI <noreply@padhai.app>";

  // Fetch all users who have streaks (proxy for "active users")
  const { data: streakRows, error } = await db
    .from("streaks")
    .select("user_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: authUsers } = await db.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(
    (authUsers?.users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? "",
        name:
          (u.user_metadata?.full_name as string) ||
          u.email?.split("@")[0] ||
          "Student",
      },
    ])
  );

  const results: { userId: string; sent: boolean; error?: string }[] = [];

  for (const row of streakRows ?? []) {
    const auth = userMap.get(row.user_id);
    if (!auth?.email) {
      results.push({ userId: row.user_id, sent: false, error: "no_email" });
      continue;
    }

    try {
      const report = await buildWeeklyReport(db, row.user_id, {
        userName: auth.name,
        userEmail: auth.email,
      });

      // Skip users with zero activity to avoid spam
      if (report.stats.totalHours === 0 && report.previousStats?.totalHours === 0) {
        results.push({ userId: row.user_id, sent: false, error: "no_activity" });
        continue;
      }

      const { subject, html } = renderWeeklyReportEmail(report);
      const { error: sendError } = await resend.emails.send({
        from,
        to: auth.email,
        subject,
        html,
      });

      results.push({
        userId: row.user_id,
        sent: !sendError,
        error: sendError?.message,
      });
    } catch (err: any) {
      results.push({ userId: row.user_id, sent: false, error: err.message });
    }
  }

  const sent = results.filter((r) => r.sent).length;
  const skipped = results.filter((r) => !r.sent).length;

  return NextResponse.json(
    { processedAt: new Date().toISOString(), total: results.length, sent, skipped },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  return handleWeeklyReport(req);
}

export async function POST(req: NextRequest) {
  return handleWeeklyReport(req);
}
