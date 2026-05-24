"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "UPSC Aspirant · Delhi",
    avatar: "PS",
    avatarBg: "bg-purple-900/50",
    avatarColor: "text-purple-300",
    quote:
      "I've tried every app and planner. PadhAI is the first one where I actually felt guilty about skipping. That accountability is real — and it works.",
    streak: "63-day streak",
    streakColor: "text-orange-400",
  },
  {
    name: "Rohan Mehta",
    role: "ML Engineer · Bangalore",
    avatar: "RM",
    avatarBg: "bg-blue-900/50",
    avatarColor: "text-blue-300",
    quote:
      "I was learning PyTorch on-off for 8 months. Set a goal on PadhAI, built a 3-week streak, and shipped my first model. The weekly report showing my consistency score was a game changer.",
    streak: "21-day streak",
    streakColor: "text-orange-400",
  },
  {
    name: "Ananya Krishnan",
    role: "Product Manager · Remote",
    avatar: "AK",
    avatarBg: "bg-green-900/50",
    avatarColor: "text-green-300",
    quote:
      "The comeback message after I fell off for a week genuinely moved me. It felt like someone actually cared. Came back, rebuilt the streak. Now at 41 days.",
    streak: "41-day streak",
    streakColor: "text-orange-400",
  },
  {
    name: "Vikram Nair",
    role: "Self-taught Developer · Kochi",
    avatar: "VN",
    avatarBg: "bg-amber-900/50",
    avatarColor: "text-amber-300",
    quote:
      "I failed DSA prep twice. Then I started logging daily check-ins on PadhAI. Seeing my streak go from 5 to 30 to 60 days changed how I see myself as a learner.",
    streak: "78-day streak",
    streakColor: "text-orange-400",
  },
  {
    name: "Meera Pillai",
    role: "CA Final Student · Mumbai",
    avatar: "MP",
    avatarBg: "bg-pink-900/50",
    avatarColor: "text-pink-300",
    quote:
      "Freeze days are brilliant. I used one on a family function day and didn't lose my 45-day streak. It felt fair — like the app actually understood real life.",
    streak: "52-day streak",
    streakColor: "text-cyan-400",
  },
  {
    name: "Arjun Shetty",
    role: "Freelance Designer · Hyderabad",
    avatar: "AS",
    avatarBg: "bg-indigo-900/50",
    avatarColor: "text-indigo-300",
    quote:
      "The 2-day reminder is so well-timed. Not naggy, not annoying. Just a quiet 'hey, we noticed'. That's enough to get me back on track every single time.",
    streak: "34-day streak",
    streakColor: "text-orange-400",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-zinc-950/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-purple-400 uppercase tracking-widest"
          >
            Real stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-black text-zinc-50 tracking-tight"
          >
            They started. They stayed.
            <br />
            <span className="text-zinc-400">They finished.</span>
          </motion.h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="break-inside-avoid bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-700/50 transition-colors"
            >
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                "{t.quote}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${t.avatarBg} border border-zinc-700/50 flex items-center justify-center`}
                  >
                    <span className={`text-[10px] font-bold ${t.avatarColor}`}>
                      {t.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{t.name}</p>
                    <p className="text-[10px] text-zinc-500">{t.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold ${t.streakColor} bg-zinc-950/60 px-2 py-1 rounded-full border border-zinc-800/50`}>
                  🔥 {t.streak}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
