"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Flame,
  CheckCircle,
  Lightbulb,
  Target,
} from "lucide-react";
import type { WeeklyReport } from "@/lib/weekly-types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WeeklyInsightsWidgetProps {
  report: WeeklyReport;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PERF_CONFIG = {
  excellent: {
    label: "Excellent",
    color: "text-orange-400",
    border: "border-orange-900/30",
    bar: "#f97316",
  },
  good: {
    label: "Good",
    color: "text-purple-400",
    border: "border-purple-900/30",
    bar: "#a78bfa",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-400",
    border: "border-amber-900/30",
    bar: "#fbbf24",
  },
  low: {
    label: "Low",
    color: "text-red-400",
    border: "border-red-900/30",
    bar: "#f87171",
  },
  none: {
    label: "No Activity",
    color: "text-zinc-500",
    border: "border-zinc-800/40",
    bar: "#3f3f46",
  },
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up")
    return <TrendingUp className="w-3.5 h-3.5 text-green-400" />;
  if (direction === "down")
    return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-zinc-500" />;
}

function DeltaBadge({
  delta,
  unit,
}: {
  delta: number;
  unit: string;
}) {
  const color =
    delta > 0
      ? "text-green-400"
      : delta < 0
      ? "text-red-400"
      : "text-zinc-500";
  const prefix = delta > 0 ? "+" : "";
  return (
    <span className={`text-[11px] font-bold ${color}`}>
      {prefix}
      {delta}
      {unit}
    </span>
  );
}

// Custom tooltip for the bar chart
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-zinc-100">
        {payload[0].value}h
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WeeklyInsightsWidget({ report }: WeeklyInsightsWidgetProps) {
  const { stats, comparison, insights, completedMilestones, performanceLabel } =
    report;
  const perf = PERF_CONFIG[performanceLabel];

  const chartData = stats.dailyBreakdown.map((d, i) => ({
    day: DAY_LABELS[i] ?? "",
    hours: d.hours,
    active: d.hours > 0,
  }));

  return (
    <div
      className={`relative bg-zinc-950/80 backdrop-blur-2xl border ${perf.border} rounded-2xl overflow-hidden shadow-2xl`}
    >
      {/* Top accent */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
          performanceLabel === "excellent"
            ? "via-orange-500/60"
            : performanceLabel === "good"
            ? "via-purple-500/60"
            : performanceLabel === "moderate"
            ? "via-amber-500/60"
            : "via-zinc-700/40"
        } to-transparent`}
      />

      {/* ── Header ── */}
      <div className="p-5 border-b border-zinc-800/50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
              Weekly Report
            </p>
            <h2 className="text-base font-bold text-zinc-100">
              {report.week.label}
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${perf.border} ${perf.color} uppercase tracking-widest`}
          >
            {perf.label}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: <Flame className="w-3 h-3" />,
              label: "Hours",
              value: `${stats.totalHours}h`,
              color: "text-orange-400",
            },
            {
              icon: <Target className="w-3 h-3" />,
              label: "Days",
              value: `${stats.activeDays}/7`,
              color: "text-purple-400",
            },
            {
              icon: <CheckCircle className="w-3 h-3" />,
              label: "Score",
              value: `${stats.consistencyScore}%`,
              color: "text-green-400",
            },
            {
              icon: <Trophy className="w-3 h-3" />,
              label: "Streak",
              value: `${report.currentStreak}d`,
              color: "text-amber-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-2.5 flex flex-col gap-1"
            >
              <div className={`flex items-center gap-1 ${stat.color}`}>
                {stat.icon}
                <span className="text-[9px] font-semibold uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <span className="text-base font-extrabold text-zinc-100 leading-none">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bar chart ── */}
        <div>
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">
            Daily Study Hours
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barCategoryGap="30%"
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#52525b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#3f3f46" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.active ? perf.bar : "#27272a"}
                      fillOpacity={entry.active ? 1 : 0.5}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Week comparison ── */}
        {comparison && (
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
              vs Last Week
            </p>
            {[
              {
                label: "Hours",
                delta: comparison.hoursDelta,
                unit: "h",
                dir: comparison.hoursTrend,
              },
              {
                label: "Consistency",
                delta: comparison.consistencyDelta,
                unit: "%",
                dir: comparison.consistencyTrend,
              },
              {
                label: "Active days",
                delta: comparison.activeDaysDelta,
                unit: "d",
                dir:
                  comparison.activeDaysDelta > 0
                    ? "up"
                    : comparison.activeDaysDelta < 0
                    ? "down"
                    : "flat",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <TrendIcon
                    direction={row.dir as "up" | "down" | "flat"}
                  />
                  <span className="text-[11px] text-zinc-500">{row.label}</span>
                </div>
                <DeltaBadge delta={row.delta} unit={row.unit} />
              </div>
            ))}
          </div>
        )}

        {/* ── Insights ── */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-zinc-600" />
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                Insights
              </p>
            </div>
            {insights.map((insight, i) => (
              <div
                key={i}
                className="px-3 py-2 bg-zinc-900/40 border-l-2 border-orange-500/40 rounded-r-lg"
              >
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Completed milestones ── */}
        {completedMilestones.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500/70" />
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                Milestones Completed
              </p>
            </div>
            <div className="space-y-1.5">
              {completedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-2 px-3 py-2 bg-green-950/20 border border-green-900/20 rounded-lg"
                >
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-300">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-zinc-600">{m.goalTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
    </div>
  );
}
