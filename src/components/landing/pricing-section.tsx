"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "For learners just getting started.",
    cta: "Get started free",
    ctaHref: "/login",
    highlight: false,
    features: [
      "1 active goal",
      "Basic streak tracking",
      "Daily check-ins",
      "Email reminders (2-day nudge)",
      "7-day activity history",
      "Freeze days (1/month)",
    ],
    missing: [
      "Unlimited goals",
      "Advanced analytics",
      "Weekly email reports",
      "Comeback system",
      "Longest streak leaderboard",
    ],
  },
  {
    name: "Pro",
    price: "₹299",
    period: "per month",
    description: "For learners serious about finishing.",
    cta: "Start Pro free for 7 days",
    ctaHref: "/login?plan=pro",
    highlight: true,
    badge: "Most popular",
    features: [
      "Unlimited active goals",
      "Full streak analytics",
      "Daily check-ins + notes",
      "Escalating reminders (2/4/7 days)",
      "Weekly progress email reports",
      "Comeback streak detection",
      "Milestone tracking",
      "Consistency score dashboard",
      "3 freeze days/month",
      "Priority support",
    ],
    missing: [],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-green-400 uppercase tracking-widest"
          >
            Simple pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-zinc-50 tracking-tight"
          >
            Invest in the habit
            <br />
            <span className="text-zinc-400">of finishing things.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl p-6 overflow-hidden ${
                plan.highlight
                  ? "bg-zinc-900/80 border-2 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.12)]"
                  : "bg-zinc-950/60 border border-zinc-800/60"
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full">
                  <Zap className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-5">
                <p className="text-sm font-bold text-zinc-400 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-zinc-50">{plan.price}</span>
                  <span className="text-sm text-zinc-500">{plan.period}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{plan.description}</p>
              </div>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 px-4 rounded-xl text-sm font-bold mb-6 transition-all ${
                  plan.highlight
                    ? "bg-orange-500 hover:bg-orange-400 text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                    : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Divider */}
              <div className="border-t border-zinc-800/50 mb-5" />

              {/* Features */}
              <div className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-zinc-600 mt-8"
        >
          7-day free trial on Pro. No credit card required. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
