"use client";

import { AlertTriangle, Clock, Bell, CheckCircle, Zap, Flame } from "lucide-react";
import type { InactivityRisk } from "@/lib/inactivity";
import type { ReminderTier } from "@/lib/reminder-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InactivityBannerProps {
  /** Days since last study session (0 = studied today). */
  inactiveDays: number;
  /** Risk level computed by getInactivityRisk(). */
  risk: InactivityRisk;
  /** YYYY-MM-DD of last study session. */
  lastStudyDate: string | null;
  /** Last reminder tier sent (if any). */
  lastReminderTier: ReminderTier | null;
  /** ISO timestamp of last reminder. */
  lastReminderSentAt: string | null;
  /** Whether today is protected by a freeze token. */
  frozenToday: boolean;
}

// ---------------------------------------------------------------------------
// Risk config
// ---------------------------------------------------------------------------

const RISK_CONFIG: Record<
  InactivityRisk,
  {
    border: string;
    icon: React.ReactNode;
    badge: string;
    badgeColor: string;
    label: string;
    sublabel: string;
  }
> = {
  none: {
    border: "border-green-900/30",
    icon: <CheckCircle className="w-4 h-4 text-green-400" />,
    badge: "bg-green-950/50 text-green-400",
    badgeColor: "text-green-400",
    label: "Active today",
    sublabel: "Your streak is safe. Keep it going.",
  },
  low: {
    border: "border-amber-900/30",
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    badge: "bg-amber-950/50 text-amber-400",
    badgeColor: "text-amber-400",
    label: "At risk",
    sublabel: "Log a session today to protect your streak.",
  },
  medium: {
    border: "border-orange-900/40",
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    badge: "bg-orange-950/50 text-orange-400",
    badgeColor: "text-orange-400",
    label: "Streak broken",
    sublabel: "Start fresh today. A new streak begins with one session.",
  },
  high: {
    border: "border-red-900/40",
    icon: <Zap className="w-4 h-4 text-red-400" />,
    badge: "bg-red-950/50 text-red-400",
    badgeColor: "text-red-400",
    label: "Extended inactivity",
    sublabel: "Come back today — every expert restarts from here.",
  },
};

const TIER_LABELS: Record<ReminderTier, string> = {
  gentle: "Gentle nudge",
  accountability: "Accountability",
  comeback: "Comeback",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLastSeen(lastStudyDate: string | null): string {
  if (!lastStudyDate) return "Never";

  const parts = lastStudyDate.split("-");
  const d = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatReminderTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InactivityBanner({
  inactiveDays,
  risk,
  lastStudyDate,
  lastReminderTier,
  lastReminderSentAt,
  frozenToday,
}: InactivityBannerProps) {
  const cfg = RISK_CONFIG[risk];

  // Don't render anything when user is active and no prior reminders
  if (risk === "none" && !lastReminderTier) return null;

  return (
    <div
      className={`relative bg-zinc-950/60 backdrop-blur-xl border ${cfg.border} rounded-2xl p-4 overflow-hidden transition-all duration-500`}
    >
      {/* Top accent line */}
      <div
        className={`absolute inset-x-0 top-0 h-px ${
          risk === "none"
            ? "bg-gradient-to-r from-transparent via-green-500/40 to-transparent"
            : risk === "low"
            ? "bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
            : risk === "medium"
            ? "bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + text */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-2 rounded-lg bg-zinc-900/60 border ${cfg.border}`}>
            {cfg.icon}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${cfg.badgeColor}`}>
                {cfg.label}
              </span>

              {frozenToday && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-950/50 border border-cyan-900/40 rounded-full text-[9px] font-semibold text-cyan-400 uppercase tracking-widest">
                  🧊 Frozen
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">{cfg.sublabel}</p>
          </div>
        </div>

        {/* Right: stats */}
        <div className="shrink-0 text-right space-y-1">
          <div className="flex items-center justify-end gap-1">
            <Flame className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              {inactiveDays === 0
                ? "Active"
                : `${inactiveDays}d inactive`}
            </span>
          </div>
          <div className="text-[10px] text-zinc-600">
            Last: {formatLastSeen(lastStudyDate)}
          </div>
        </div>
      </div>

      {/* Reminder status row */}
      {lastReminderTier && (
        <div className="mt-3 pt-3 border-t border-zinc-800/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-600">
              Last reminder:{" "}
              <span className="text-zinc-400 font-semibold">
                {TIER_LABELS[lastReminderTier]}
              </span>
            </span>
          </div>
          {lastReminderSentAt && (
            <span className="text-[10px] text-zinc-700">
              {formatReminderTime(lastReminderSentAt)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
