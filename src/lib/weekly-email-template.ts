/**
 * @file weekly-email-template.ts
 * @description HTML email template for the weekly progress report.
 * Inline styles only — maximum email client compatibility.
 */

import type { WeeklyReport } from "@/lib/weekly-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statCell(label: string, value: string, color: string): string {
  return `
    <td style="text-align:center;padding:0 8px 0 0;width:25%;">
      <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:14px 10px;">
        <div style="font-size:20px;font-weight:800;color:${color};font-variant-numeric:tabular-nums;">${value}</div>
        <div style="font-size:9px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:1.2px;margin-top:3px;">${label}</div>
      </div>
    </td>`;
}

function trendBadge(delta: number, unit: string): string {
  if (Math.abs(delta) < 0.1) {
    return `<span style="color:#71717a;">→ No change</span>`;
  }
  const up = delta > 0;
  return `<span style="color:${up ? "#22c55e" : "#f87171"};">${up ? "↑" : "↓"} ${Math.abs(delta)}${unit} vs last week</span>`;
}

function dayBar(label: string, hours: number, maxHours: number): string {
  const pct = maxHours > 0 ? Math.round((hours / maxHours) * 100) : 0;
  const color = hours > 0 ? "#f97316" : "#27272a";
  return `
    <td style="text-align:center;vertical-align:bottom;padding:0 2px;">
      <div style="font-size:9px;color:#52525b;margin-bottom:3px;">${hours > 0 ? hours + "h" : ""}</div>
      <div style="background:${color};height:${Math.max(4, pct)}px;min-height:4px;border-radius:3px 3px 0 0;opacity:${hours > 0 ? "1" : "0.3"};"></div>
      <div style="font-size:9px;color:#52525b;margin-top:3px;">${label}</div>
    </td>`;
}

function milestoneRow(title: string, goalTitle: string): string {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1c1c1e;">
        <div style="font-size:13px;font-weight:600;color:#f4f4f5;">✓ ${title}</div>
        <div style="font-size:11px;color:#71717a;margin-top:1px;">${goalTitle}</div>
      </td>
    </tr>`;
}

const PERF_CONFIG = {
  excellent: { emoji: "🔥", label: "Excellent", color: "#f97316" },
  good: { emoji: "⚡", label: "Good", color: "#a78bfa" },
  moderate: { emoji: "📈", label: "Moderate", color: "#fbbf24" },
  low: { emoji: "💪", label: "Keep Going", color: "#f87171" },
  none: { emoji: "👋", label: "Get Started", color: "#71717a" },
};

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------

export function renderWeeklyReportEmail(report: WeeklyReport): {
  subject: string;
  html: string;
} {
  const { stats, comparison, performanceLabel, insights, completedMilestones } = report;
  const perf = PERF_CONFIG[performanceLabel];
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxHours = Math.max(...stats.dailyBreakdown.map((d) => d.hours), 1);

  const subject =
    performanceLabel === "none"
      ? `${report.userName}, your Week ${report.week.label} report is ready`
      : `${perf.emoji} Week ${report.week.label} — ${stats.totalHours}h studied, ${stats.consistencyScore}% consistency`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>PadhAI Weekly Report</title></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e4e4e7;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;max-width:580px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1c1917,#1c1b2e);padding:28px 32px;border-bottom:1px solid #27272a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:18px;font-weight:800;color:#f4f4f5;">PadhAI</span><span style="font-size:11px;color:#71717a;margin-left:8px;">Weekly Report</span></td>
      <td align="right"><span style="font-size:11px;color:#71717a;">${report.week.label}</span></td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  <tr><td style="padding:28px 32px 0;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${perf.color};text-transform:uppercase;letter-spacing:1.5px;">${perf.emoji} ${perf.label} week</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#f4f4f5;line-height:1.2;">Hey ${report.userName}, here's your week.</h1>
    <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">${stats.totalHours}h studied · ${stats.activeDays}/7 days active · ${stats.consistencyScore}% consistency</p>
  </td></tr>

  <!-- Stats grid -->
  <tr><td style="padding:20px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${statCell("Hours", `${stats.totalHours}h`, "#f97316")}
      ${statCell("Days Active", `${stats.activeDays}/7`, "#a78bfa")}
      ${statCell("Consistency", `${stats.consistencyScore}%`, "#22c55e")}
      ${statCell("Streak", `${report.currentStreak}d`, "#fbbf24")}
    </tr></table>
  </td></tr>

  <!-- Weekly chart (mini bar chart) -->
  <tr><td style="padding:0 32px 20px;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Daily Study Hours</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #27272a;border-radius:8px;padding:12px;background:#09090b;">
      <tr style="vertical-align:bottom;height:64px;">
        ${stats.dailyBreakdown.map((d, i) => dayBar(DAY_LABELS[i] ?? "", d.hours, maxHours)).join("")}
      </tr>
    </table>
  </td></tr>

  <!-- Comparison -->
  ${comparison ? `<tr><td style="padding:0 32px 20px;">
    <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:1px;">vs Last Week</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;color:#a1a1aa;padding:3px 0;">Study hours</td>
          <td align="right" style="font-size:12px;">${trendBadge(comparison.hoursDelta, "h")}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#a1a1aa;padding:3px 0;">Consistency</td>
          <td align="right" style="font-size:12px;">${trendBadge(comparison.consistencyDelta, "%")}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#a1a1aa;padding:3px 0;">Active days</td>
          <td align="right" style="font-size:12px;">${trendBadge(comparison.activeDaysDelta, " days")}</td>
        </tr>
      </table>
    </div>
  </td></tr>` : ""}

  <!-- Insights -->
  <tr><td style="padding:0 32px 20px;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Insights</p>
    ${insights.map((ins) => `<div style="margin-bottom:6px;padding:10px 14px;background:#0f0f11;border-left:2px solid #f97316;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">${ins}</p>
    </div>`).join("")}
  </td></tr>

  <!-- Milestones -->
  ${completedMilestones.length > 0 ? `<tr><td style="padding:0 32px 20px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:1px;">Completed This Week</p>
    <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:4px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${completedMilestones.map((m) => milestoneRow(m.title, m.goalTitle)).join("")}
      </table>
    </div>
  </td></tr>` : ""}

  <!-- CTA -->
  <tr><td style="padding:0 32px 28px;text-align:center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://padhai.app"}/dashboard" style="display:inline-block;padding:13px 32px;background:#f97316;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;">Open Dashboard →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;border-top:1px solid #27272a;background:#09090b;">
    <p style="margin:0;font-size:11px;color:#52525b;">PadhAI · Weekly progress report · ${report.week.label}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
