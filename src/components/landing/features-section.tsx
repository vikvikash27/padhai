"use client";

import { motion } from "framer-motion";
import { BookOpen, Bell, BarChart2, Flame, Trophy, RefreshCw, CheckSquare } from "lucide-react";

const FEATURES = [
  {
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-950/30",
    border: "border-orange-900/30",
    glow: "rgba(249,115,22,0.15)",
    title: "Streak Tracking",
    description:
      "Every day you study adds to your streak. Miss a day and you feel it. That's the whole point — accountability through momentum.",
  },
  {
    icon: Bell,
    color: "text-purple-400",
    bg: "bg-purple-950/30",
    border: "border-purple-900/30",
    glow: "rgba(167,139,250,0.12)",
    title: "Accountability Reminders",
    description:
      "Gentle nudges after 2 days. Accountability check at 4. A comeback message at 7. You'll never silently disappear again.",
  },
  {
    icon: CheckSquare,
    color: "text-cyan-400",
    bg: "bg-cyan-950/30",
    border: "border-cyan-900/30",
    glow: "rgba(34,211,238,0.10)",
    title: "Daily Check-ins",
    description:
      "Log what you studied, how long, and any notes. 30 seconds. That's it. The habit of logging creates the habit of showing up.",
  },
  {
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
    border: "border-amber-900/30",
    glow: "rgba(251,191,36,0.12)",
    title: "Milestone Tracking",
    description:
      "Break long goals into milestones. Celebrate every checkpoint. Progress feels real when you can see it move.",
  },
  {
    icon: BarChart2,
    color: "text-green-400",
    bg: "bg-green-950/30",
    border: "border-green-900/30",
    glow: "rgba(74,222,128,0.10)",
    title: "Weekly Reports",
    description:
      "Every Sunday, get a full breakdown of your week — hours studied, consistency score, trend vs last week — straight to your inbox.",
  },
  {
    icon: RefreshCw,
    color: "text-pink-400",
    bg: "bg-pink-950/30",
    border: "border-pink-900/30",
    glow: "rgba(244,114,182,0.10)",
    title: "Comeback System",
    description:
      "Returning after a break? PadhAI detects it, celebrates it, and helps you rebuild momentum from day one — not from scratch.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-orange-400 uppercase tracking-widest"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-zinc-50 tracking-tight"
          >
            Built for people who keep
            <br />
            <span className="text-zinc-400">starting over.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-zinc-500 max-w-xl mx-auto text-lg"
          >
            Motivation fades. Systems don't. PadhAI gives you the infrastructure
            to stay consistent even when you don't feel like it.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={`group relative bg-zinc-950/60 border ${f.border} rounded-2xl p-6 hover:border-opacity-70 transition-all duration-300 overflow-hidden`}
              style={{
                boxShadow: `0 0 0 0 ${f.glow}`,
              }}
              whileHover={{ boxShadow: `0 0 40px 0 ${f.glow}` }}
            >
              <div className={`inline-flex p-2.5 rounded-xl ${f.bg} border ${f.border} mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>

              {/* Corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: f.glow.replace("0.15", "1").replace("0.12", "1").replace("0.10", "1") }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
