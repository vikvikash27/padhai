"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-zinc-900/80 border border-zinc-800/60 rounded-3xl p-12 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.06),transparent_70%)]" />
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          {/* Icon */}
          <div className="inline-flex mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <Flame
              className="w-8 h-8 text-orange-400"
              style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.6))" }}
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-zinc-50 tracking-tight mb-4 leading-tight">
            Your streak starts
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
              }}
            >
              today.
            </span>
          </h2>

          <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Don't let another week go by without progress. Sign up in 30 seconds
            and log your first session today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="group flex items-center gap-2 px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all hover:shadow-[0_0_28px_rgba(249,115,22,0.45)] active:scale-[0.98]"
            >
              Start for free — no card needed
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-zinc-600">
            Free plan forever · Pro trial available · Cancel anytime
          </p>

          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
