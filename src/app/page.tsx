import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "PadhAI — Streak Tracking & Accountability for Self-Learners",
  description:
    "PadhAI is the accountability layer for serious self-learners. Track streaks, get reminded before you fall off, and build the habit of finishing what you start.",
  keywords: [
    "study tracker",
    "streak tracking",
    "accountability app",
    "self learning",
    "UPSC prep",
    "consistency tracker",
    "learning habit",
  ],
  openGraph: {
    title: "PadhAI — Someone notices when you stop showing up.",
    description:
      "Streak tracking, accountability reminders, and weekly reports for self-learners who want to finish what they start.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <LandingNav />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
