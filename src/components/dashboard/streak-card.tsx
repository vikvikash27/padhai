"use client";

import { useEffect } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { Flame, Snowflake, Trophy, Zap, TrendingUp } from "lucide-react";
import type { StreakSummary } from "@/lib/streak-service";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StreakCardProps {
  /** Live data from getStreakSummary(). Falls back to MOCK when omitted. */
  data?: StreakSummary & {
    freezesRemaining: number;
    freezesTotal: number;
    /** Ordered oldest→newest: each session/freeze date as ISO string */
    recentSessionDates?: string[];
    recentFreezeDates?: string[];
  };
}

// ---------------------------------------------------------------------------
// Mock data – used when no real data prop is passed
// ---------------------------------------------------------------------------

const MOCK_RECENT_DAYS = [
  { label: "S", status: "studied" },
  { label: "M", status: "studied" },
  { label: "T", status: "studied" },
  { label: "W", status: "frozen" },
  { label: "T", status: "studied" },
  { label: "F", status: "studied" },
  { label: "S", status: "missed" },
  { label: "S", status: "studied" },
  { label: "M", status: "studied" },
  { label: "T", status: "studied" },
  { label: "W", status: "studied" },
  { label: "T", status: "studied" },
  { label: "F", status: "studied" },
  { label: "S", status: "today" },
] as { label: string; status: "studied" | "frozen" | "missed" | "today" }[];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMotivationalMessage(
  streak: number,
  studiedToday: boolean,
  isComeback: boolean
): string {
  if (isComeback) return "Welcome back. The streak lives.";
  if (!studiedToday) return "One session away from keeping the fire alive.";
  if (streak >= 30) return "Exceptional. Month-long discipline is rare.";
  if (streak >= 14) return "Two weeks of pure momentum.";
  if (streak >= 7) return "A full week locked in. Stay the course.";
  if (streak >= 3) return "Consistency is building. Don't look back.";
  return "Every expert was once a beginner. Keep going.";
}

function getDayStyle(status: string) {
  switch (status) {
    case "studied":
      return "bg-orange-500/80 shadow-[0_0_6px_rgba(249,115,22,0.6)]";
    case "frozen":
      return "bg-cyan-500/70 shadow-[0_0_6px_rgba(6,182,212,0.5)]";
    case "today":
      return "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)] ring-1 ring-orange-300/50 scale-110";
    case "missed":
    default:
      return "bg-zinc-800/60";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
      <div className={`flex items-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest truncate">
          {label}
        </span>
      </div>
      <span className="text-lg font-extrabold text-zinc-100 leading-none">
        {value}
      </span>
    </div>
  );
}

function FreezePip({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-4 h-4 rounded-full border transition-all duration-300 ${
        filled
          ? "bg-cyan-500/80 border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.7)]"
          : "bg-zinc-800/50 border-zinc-700/50"
      }`}
    />
  );
}

// ---------------------------------------------------------------------------
// Build 14-day activity strip from real data
// ---------------------------------------------------------------------------

type DayStatus = "studied" | "frozen" | "missed" | "today";
type DayEntry = { label: string; status: DayStatus };

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function buildRecentDays(
  sessionDates: string[],
  freezeDates: string[]
): DayEntry[] {
  const today = startOfDay(new Date());
  const studySet = new Set(sessionDates.map((d) => d.slice(0, 10)));
  const freezeSet = new Set(freezeDates.map((d) => d.slice(0, 10)));

  return Array.from({ length: 14 }, (_, i) => {
    const date = subDays(today, 13 - i);
    const key = format(date, "yyyy-MM-dd");
    const label = DAY_LABELS[date.getDay()];

    let status: DayStatus;
    if (i === 13) status = "today";
    else if (studySet.has(key)) status = "studied";
    else if (freezeSet.has(key)) status = "frozen";
    else status = "missed";

    return { label, status };
  });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StreakCard({ data }: StreakCardProps = {}) {
  // Resolve values — real data takes priority, neutral zeros when absent
  const currentStreak  = data?.currentStreak  ?? 0;
  const longestStreak  = data?.longestStreak  ?? 0;
  const freezesRemaining = data?.freezesRemaining ?? 0;
  const freezesTotal   = data?.freezesTotal   ?? 3;
  const studiedToday   = data?.studiedToday   ?? false;
  const isComebackStreak = data?.isComebackStreak ?? false;

  const recentDays: DayEntry[] = data
    ? buildRecentDays(data.recentSessionDates ?? [], data.recentFreezeDates ?? [])
    : MOCK_RECENT_DAYS;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, currentStreak, {
      duration: 1.2,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [currentStreak, count]);

  const message = getMotivationalMessage(
    currentStreak,
    studiedToday,
    isComebackStreak
  );

  return (
    <motion.div
      whileHover={{ scale: 1.015, borderColor: "var(--border-strong)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{ boxShadow: "0 0 32px var(--accent-glow)" }}
      className="relative bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/60 rounded-2xl p-5 overflow-hidden shadow-2xl group"
    >

      {/* — ambient glow behind the card — */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.07),transparent_60%)]" />

      {/* — top accent line — */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            Study Streak
          </p>

          {/* — big streak number — */}
          <div className="flex items-end gap-2">
            <motion.span
              className="text-5xl font-black text-transparent bg-clip-text leading-none"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
                filter: "drop-shadow(0 0 18px rgba(249,115,22,0.55))",
              }}
            >
              {rounded}
            </motion.span>
            <span className="text-lg font-bold text-zinc-400 mb-1">days</span>
          </div>
        </div>

        {/* — flame icon — */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-orange-500/20 blur-lg" />
          <div className="relative p-3 bg-orange-950/30 border border-orange-900/40 rounded-xl">
            <Flame
              className="w-6 h-6 text-orange-400"
              style={{ filter: "drop-shadow(0 0 6px rgba(251,146,60,0.8))" }}
            />
          </div>
          {studiedToday && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-green-400 border-2 border-zinc-950 shadow-[0_0_6px_rgba(74,222,128,0.7)]" />
          )}
        </div>
      </div>

      {/* ── Comeback badge ── */}
      {isComebackStreak && (
        <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/40 w-fit">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-semibold text-purple-300 tracking-wide">
            Comeback Streak
          </span>
        </div>
      )}

      {/* ── 14-day activity strip ── */}
      <div className="mb-4">
        <div className="flex items-end gap-1">
          {recentDays.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-5 rounded-sm transition-all duration-300 ${getDayStyle(
                  day.status
                )}`}
              />
              <span className="text-[9px] font-medium text-zinc-600">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex gap-2 mb-4">
        <StatPill
          icon={<Trophy className="w-3 h-3" />}
          label="Best"
          value={`${longestStreak}d`}
          color="text-amber-400"
        />
        <StatPill
          icon={<TrendingUp className="w-3 h-3" />}
          label="Status"
          value={studiedToday ? "Active" : "Pending"}
          color={studiedToday ? "text-green-400" : "text-zinc-500"}
        />
        <StatPill
          icon={<Snowflake className="w-3 h-3" />}
          label="Freezes"
          value={`${freezesRemaining} left`}
          color="text-cyan-400"
        />
      </div>

      {/* ── Freeze pips ── */}
      <div className="flex items-center gap-2 mb-4">
        <Snowflake className="w-3.5 h-3.5 text-cyan-500/70 shrink-0" />
        <div className="flex gap-1.5">
          {Array.from({ length: freezesTotal }).map((_, i) => (
            <FreezePip key={i} filled={i < freezesRemaining} />
          ))}
        </div>
        <span className="text-[10px] text-zinc-600 font-medium ml-1">
          freeze tokens
        </span>
      </div>

      {/* ── Motivational message ── */}
      <div className="border-t border-zinc-800/50 pt-3">
        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium italic">
          "{message}"
        </p>
      </div>

      {/* — bottom glow line — */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
    </motion.div>
  );
}
