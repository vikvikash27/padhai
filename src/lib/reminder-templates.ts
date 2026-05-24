/**
 * @file reminder-templates.ts
 * @description Email HTML templates for each reminder tier.
 *
 * All templates:
 *  - Modern SaaS tone, emotionally supportive, concise
 *  - Personalized with user name and streak data
 *  - Plain HTML + inline styles (maximum email client compatibility)
 *  - No external image dependencies
 */

import type { ReminderTier } from "@/lib/reminder-types";

// ---------------------------------------------------------------------------
// Template data shape
// ---------------------------------------------------------------------------

export interface TemplateData {
  name: string;
  inactiveDays: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  appUrl: string;
}

// ---------------------------------------------------------------------------
// Shared layout wrapper
// ---------------------------------------------------------------------------

function layout(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PadhAI</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e4e4e7;">
  <!-- Preheader (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#1c1c1f 0%,#1e1b2e 100%);padding:24px 32px;border-bottom:1px solid #27272a;">
              <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#f4f4f5;">PadhAI</span>
              <span style="font-size:12px;color:#71717a;margin-left:8px;font-weight:500;">Study OS</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #27272a;background:#09090b;">
              <p style="margin:0;font-size:11px;color:#52525b;line-height:1.6;">
                You're receiving this because you have a PadhAI account.<br/>
                Stay consistent — every day counts.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Stat badge helper
// ---------------------------------------------------------------------------

function statBadge(label: string, value: string, color: string): string {
  return `<td style="text-align:center;padding:0 12px;">
    <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:12px 16px;">
      <div style="font-size:22px;font-weight:800;color:${color};font-variant-numeric:tabular-nums;">${value}</div>
      <div style="font-size:10px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">${label}</div>
    </div>
  </td>`;
}

// ---------------------------------------------------------------------------
// CTA button
// ---------------------------------------------------------------------------

function ctaButton(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:24px;padding:13px 28px;background:#f97316;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">${label}</a>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Tier: "gentle" — 2 inactive days */
function gentleTemplate(d: TemplateData): string {
  const body = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1.5px;">Day ${d.inactiveDays} Check-in</p>
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f4f4f5;line-height:1.2;">Hey ${d.name}, still with us? 👋</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.7;">
      You haven't logged a study session in <strong style="color:#f4f4f5;">${d.inactiveDays} days</strong>.
      Small gaps are normal — but closing them is what separates consistent learners from the rest.
    </p>

    <!-- Stats -->
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:8px;">
      <tr>
        ${statBadge("Current Streak", d.currentStreak > 0 ? `${d.currentStreak}d` : "—", "#f97316")}
        ${statBadge("Best Streak", `${d.longestStreak}d`, "#a78bfa")}
        ${statBadge("Inactive", `${d.inactiveDays}d`, "#71717a")}
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:#a1a1aa;line-height:1.7;">
      A quick 15-minute session today is all it takes. Open your dashboard and log it — your streak is worth protecting.
    </p>
    ${ctaButton("Log Today's Session →", d.appUrl)}
  `;
  return layout(`You haven't studied in ${d.inactiveDays} days — quick check-in?`, body);
}

/** Tier: "accountability" — 4 inactive days */
function accountabilityTemplate(d: TemplateData): string {
  const body = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#f59e0b;text-transform:uppercase;letter-spacing:1.5px;">Accountability Check</p>
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f4f4f5;line-height:1.2;">${d.inactiveDays} days away, ${d.name}.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.7;">
      It's been <strong style="color:#fbbf24;">${d.inactiveDays} days</strong> since your last study session.
      ${d.longestStreak > 0 ? `You once built a <strong style="color:#f4f4f5;">${d.longestStreak}-day streak</strong>. That discipline still lives in you.` : "Every consistent person starts by showing up again."}
    </p>

    <!-- Stats -->
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:8px;">
      <tr>
        ${statBadge("Days Missed", `${d.inactiveDays}`, "#f59e0b")}
        ${statBadge("Best Streak", `${d.longestStreak}d`, "#a78bfa")}
        ${statBadge("Sessions", "0", "#3f3f46")}
      </tr>
    </table>

    <div style="margin:24px 0;padding:16px;background:#1c1917;border-left:3px solid #f59e0b;border-radius:6px;">
      <p style="margin:0;font-size:13px;color:#d6d3d1;line-height:1.7;font-style:italic;">
        "Discipline is choosing between what you want now and what you want most."
      </p>
    </div>

    <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;">
      Log one session today. Just one. Momentum starts with a single step.
    </p>
    ${ctaButton("Come Back and Study →", d.appUrl)}
  `;
  return layout(`${d.inactiveDays} days inactive — your goals are waiting.`, body);
}

/** Tier: "comeback" — 7 inactive days */
function comebackTemplate(d: TemplateData): string {
  const body = `
    <div style="margin-bottom:24px;padding:12px 16px;background:linear-gradient(135deg,#3b0764,#1e1b4b);border-radius:10px;text-align:center;">
      <span style="font-size:28px;">🔥</span>
      <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#c4b5fd;text-transform:uppercase;letter-spacing:1.5px;">Comeback Mode</p>
    </div>

    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f4f4f5;line-height:1.2;">A week away, ${d.name}. It's time.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.7;">
      You've been away for <strong style="color:#c4b5fd;">${d.inactiveDays} days</strong>. That's okay — life happens.
      But the version of you that built a <strong style="color:#f4f4f5;">${d.longestStreak > 0 ? `${d.longestStreak}-day streak` : "study habit"}</strong> hasn't disappeared.
      That person is one decision away.
    </p>

    <!-- Stats -->
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:8px;">
      <tr>
        ${statBadge("Days Inactive", `${d.inactiveDays}`, "#c4b5fd")}
        ${statBadge("Best Streak", `${d.longestStreak > 0 ? `${d.longestStreak}d` : "—"}`, "#a78bfa")}
        ${statBadge("New Streak", "0 → 1", "#22c55e")}
      </tr>
    </table>

    <div style="margin:24px 0;padding:20px;background:#0f172a;border:1px solid #1e293b;border-radius:10px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your comeback starts now</p>
      <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.7;">
        Log today's session and start a new streak. New start, same goal. The best students aren't the ones who never stop — they're the ones who always come back.
      </p>
    </div>

    ${ctaButton("Start My Comeback →", d.appUrl)}
  `;
  return layout(`It's been ${d.inactiveDays} days. Your comeback starts today, ${d.name}.`, body);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Subject lines per tier. */
export const REMINDER_SUBJECTS: Record<ReminderTier, (d: TemplateData) => string> = {
  gentle: (d) => `${d.name}, a quick check-in from PadhAI 👋`,
  accountability: (d) => `${d.inactiveDays} days since your last session — let's fix that`,
  comeback: (d) => `Your comeback starts today, ${d.name} 🔥`,
};

/**
 * Returns the rendered HTML body and subject line for a given tier.
 */
export function renderReminderEmail(
  tier: ReminderTier,
  data: TemplateData
): { subject: string; html: string } {
  const subject = REMINDER_SUBJECTS[tier](data);

  let html: string;
  switch (tier) {
    case "gentle":
      html = gentleTemplate(data);
      break;
    case "accountability":
      html = accountabilityTemplate(data);
      break;
    case "comeback":
      html = comebackTemplate(data);
      break;
  }

  return { subject, html };
}
