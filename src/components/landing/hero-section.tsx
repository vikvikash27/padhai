"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight, CheckCircle } from "lucide-react";

const STREAK_DAYS = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: false, frozen: true },
  { day: "F", active: true },
  { day: "S", active: true },
  { day: "S", active: "today" },
];

const SOCIAL_PROOF = [
  "Priya S. built a 47-day streak",
  "Rohan K. finished his AWS cert",
  "Ananya M. cracked UPSC prelims",
];

function StreakBadge({ day, active, frozen }: { day: string; active: boolean | string; frozen?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all
          ${active === "today"
            ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)] ring-2 ring-orange-400/50 scale-110"
            : active
            ? "bg-orange-500/80 shadow-[0_0_6px_rgba(249,115,22,0.4)]"
            : frozen
            ? "bg-cyan-500/60 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
            : "bg-zinc-800/60"
          }`}
      >
        {active === "today" ? <Flame className="w-3.5 h-3.5 text-white" /> : null}
      </div>
      <span className="text-[9px] text-zinc-600 font-semibold">{day}</span>
    </div>
  );
}

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        {/* Social proof ticker */}
        <motion.div
          custom={0}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/60 backdrop-blur"
        >
          <div className="flex -space-x-1">
            {["🧑‍💻", "👩‍🎓", "🧑‍🔬"].map((e, i) => (
              <span key={i} className="text-sm">{e}</span>
            ))}
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            <span className="text-zinc-200 font-semibold">2,400+ learners</span> building streaks today
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-50 leading-[1.05]"
        >
          Someone notices when
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #fb923c 0%, #f97316 40%, #ea580c 100%)",
            }}
          >
            you stop showing up.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={2}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          PadhAI is the accountability layer for self-learners. Track streaks,
          get reminded before you fall off, and build the habit of finishing
          what you start.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/select-role"
            className="group flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.4)] active:scale-[0.98]"
          >
            Start your streak — it's free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-all"
          >
            See how it works
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          custom={4}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-600 font-medium"
        >
          {["No credit card required", "Free plan forever", "Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-green-500/70" />
              {t}
            </span>
          ))}
        </motion.div>

        {/* ── Dashboard mockup ── */}
        <motion.div
          custom={5}
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="mt-4 max-w-3xl mx-auto"
        >
          <div className="relative bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-5 shadow-2xl overflow-hidden">
            {/* Top shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-950/40 border border-orange-900/30 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-400" style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.8))" }} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Study Streak</p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-4xl font-black text-transparent bg-clip-text"
                      style={{ backgroundImage: "linear-gradient(135deg, #fb923c, #ea580c)", filter: "drop-shadow(0 0 12px rgba(249,115,22,0.4))" }}
                    >
                      23
                    </span>
                    <span className="text-zinc-500 font-semibold text-sm">days</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-0.5">Best</p>
                <p className="text-lg font-bold text-zinc-300">47d</p>
              </div>
            </div>

            {/* Week strip */}
            <div className="flex items-end gap-2 justify-center mb-4">
              {STREAK_DAYS.map((d, i) => (
                <StreakBadge key={i} {...d} active={d.active as boolean | string} />
              ))}
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "This week", value: "14.5h", color: "text-orange-400" },
                { label: "Consistency", value: "86%", color: "text-green-400" },
                { label: "Freezes left", value: "2/3", color: "text-cyan-400" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-2.5 text-center">
                  <p className={`text-sm font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom glow */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
