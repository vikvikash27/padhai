"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What happens when I miss a day?",
    a: "Your streak resets. But that's the point — the emotional sting of losing a streak is one of the most effective motivators for showing up tomorrow. And if you had a genuine emergency, freeze days exist for exactly that.",
  },
  {
    q: "What are freeze days?",
    a: "Freeze days let you protect your streak on days you genuinely can't study — a family event, illness, travel. Free plan gets 1/month. Pro gets 3/month. They're not a cheat code; they're a real-life buffer.",
  },
  {
    q: "How do the reminders work?",
    a: "After 2 inactive days, you get a gentle nudge. After 4 days, an accountability check. After 7 days, a motivational comeback message. All via email. They're warm, not naggy — written the way a good mentor would check in.",
  },
  {
    q: "Can I track multiple learning goals?",
    a: "Free plan supports 1 active goal. Pro supports unlimited goals — useful if you're studying for an exam AND building a side project at the same time.",
  },
  {
    q: "What's in the weekly report?",
    a: "Every Sunday, you get an email with: total hours studied, consistency score, streak stats, completed milestones, week-over-week trend, and 2–4 personalised insights. It's the kind of report you actually want to open.",
  },
  {
    q: "Is my data private?",
    a: "Completely. Your study data is private to your account. We don't sell it, share it, or use it for ads. We're a tool for your growth — not a data business.",
  },
  {
    q: "What if I'm returning after a long break?",
    a: "PadhAI detects comeback patterns and celebrates them. You'll see a 'Comeback Streak' badge and a motivational message. Starting over isn't failure — it's the whole system working as intended.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-zinc-500"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-zinc-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-zinc-500 uppercase tracking-widest"
          >
            Questions
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-black text-zinc-50 tracking-tight"
          >
            Honest answers.
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-950/60 border border-zinc-800/50 rounded-2xl px-6"
        >
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} {...faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
