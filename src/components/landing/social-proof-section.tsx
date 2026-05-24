"use client";

import { motion } from "framer-motion";

const LOGOS = [
  "UPSC Aspirants",
  "AI Engineers",
  "Self-taught Devs",
  "Product Managers",
  "DSA Learners",
  "Career Switchers",
  "Bootcamp Alumni",
];

const STATS = [
  { value: "2,400+", label: "Active learners" },
  { value: "89%", label: "Finish their first goal" },
  { value: "34 days", label: "Average streak length" },
  { value: "4.9 ★", label: "User satisfaction" },
];

export function SocialProofSection() {
  return (
    <section className="py-16 border-y border-zinc-800/40 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Ticker */}
        <p className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-8">
          Trusted by learners across every discipline
        </p>

        <div className="relative overflow-hidden mb-14">
          <div className="flex gap-8 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span
                key={i}
                className="inline-block px-5 py-2 bg-zinc-900/60 border border-zinc-800/50 rounded-full text-zinc-400 text-sm font-semibold shrink-0"
              >
                {logo}
              </span>
            ))}
          </div>
          {/* Fade masks */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-black text-zinc-100 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
