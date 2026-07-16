"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid } from "@/components/shared/scroll-reveal";
import { ArrowRight, BookOpen, Calculator, CheckCircle as CheckCircle2, GraduationCap, Stack as Layers, Clock, Pen as PenLine, Trophy, Users, Star, List as Menu, X, Envelope as Mail, Lock, Eye, EyeSlash as EyeOff, CircleNotch as Loader2, Sparkle as Sparkles, TrendUp as TrendingUp, Target, ShieldCheck, Quotes as Quote, MagnifyingGlass as Search, Play } from "@phosphor-icons/react";

// =============================================================
// Content
// =============================================================

const stats = [
  { value: "500+", label: "VAs Coached", description: "Across the Philippines", icon: Users },
  { value: "₱50M+", label: "Ads Managed", description: "Real Amazon ad spend", icon: TrendingUp },
  { value: "14 yrs", label: "Amazon Ads Experience", description: "Led by a verified coach", icon: BookOpen },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Built by 14-Year Amazon Ads Veterans",
    description:
      "A program shaped by coaches who have managed ₱50M+ in real Amazon ad spend for sellers.",
  },
  {
    icon: Sparkles,
    title: "Real PPC Tasks, Not Theory",
    description:
      "Practice the exact work an Amazon PPC specialist does — retail readiness, search-term triage, and campaign decisions.",
  },
  {
    icon: Users,
    title: "A Clear Path to the Full Course",
    description:
      "Try the free sampler, then continue to the AMPH v2 program built for Filipino Virtual Assistants.",
  },
];

const learnItems = [
  {
    title: "How an Amazon PPC Specialist Spends the Day",
    description: "A realistic look at the work behind Sponsored Products, Brands, and Display.",
  },
  {
    title: "Retail Readiness Check",
    description: "Is this listing ready to advertise? Stock, Buy Box, price, reviews, and images.",
  },
  {
    title: "Search-Term Triage",
    description: "What to negate, what to keep, and how to explain a safe PPC decision.",
  },
  {
    title: "Your Path into Amazon PPC VA Work",
    description: "Where the free sampler fits and which AMPH v2 track suits you.",
  },
];

const testimonials = [
  {
    name: "Maria S.",
    location: "Davao City, PH",
    quote:
      "This course doubled my hourly rate as a VA! I went from doing general admin tasks for $5/hr to managing PPC campaigns for $15/hr.",
  },
  {
    name: "Juan D.",
    location: "Cebu City, PH",
    quote:
      "I had zero experience with Amazon ads. The videos were so easy to follow. I got hired by a US client 2 weeks after getting my certificate.",
  },
  {
    name: "Anna R.",
    location: "Manila, PH",
    quote:
      "The community support is amazing. Whenever I get stuck on a campaign, the mentors help me out. It feels like having a senior expert.",
  },
];

const navLinks = [
  { label: "What You'll Learn", href: "#curriculum" },
  { label: "Stories", href: "#stories" },
  { label: "AMPH v2", href: "/projectamazonph" },
  { label: "Free Sampler", href: "/sampler" },
];

// =============================================================
// Landing page
// =============================================================

export function LandingPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 text-foreground"
          >
            <Image src="/logo.svg" alt="PPC Companion" width={32} height={32} />
            <span className="text-base font-bold tracking-tight">PPC Companion</span>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
            <a href="/sampler">
              <Button className="font-bold">Try Free Sampler</Button>
            </a>
          </nav>

          <button
            className="rounded-lg p-1.5 text-foreground hover:bg-muted md:hidden"
            onClick={() => setMobileNav((v) => !v)}
            aria-label="Menu"
          >
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileNav && (
            <motion.nav
              className="flex flex-col gap-1 border-t border-border bg-card px-4 py-3 md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileNav(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  {l.label}
                </a>
              ))}
              <a href="/sampler" className="mt-2 block">
                <Button className="w-full font-bold">Try Free Sampler</Button>
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Hero (asymmetric split) ───────────────────────────── */}
      <section className="w-full bg-background py-8 md:py-20 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-8 px-4 md:flex-row md:items-center md:px-10">
          <div className="flex w-full flex-col gap-6 md:w-1/2">
            <div className="flex flex-col gap-4 text-left">
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Free Sampler · By ProjectAmazonPH
              </span>
              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Try a Real Amazon PPC Task —{" "}
                <span className="text-primary">No Experience Needed</span>
              </h1>
              <h2 className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-xl">
                A free, safe taste of the work a real Amazon PPC Virtual Assistant does —
                built by the ProjectAmazonPH team with 14 years of Amazon Ads experience.
                Like it? Continue to the full AMPH v2 program.
              </h2>
            </div>

            <div className="mt-2 flex w-full flex-col gap-3">
              <a href="/sampler">
                <Button
                  className="h-12 w-full text-base font-bold shadow-lg shadow-primary/30"
                >
                  Try the Free Sampler
                </Button>
              </a>
              <a href="/projectamazonph">
                <Button
                  variant="outline"
                  className="h-12 w-full text-base font-bold"
                >
                  See the Full AMPH v2 Program
                </Button>
              </a>
            </div>

            <div className="mt-4 border-t border-border pt-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Built by the ProjectAmazonPH team
              </p>
              <div className="flex flex-wrap gap-4 opacity-60 grayscale transition-all hover:grayscale-0">
                {["Sponsored Products", "Sponsored Brands", "Sponsored Display"].map(
                  (t) => (
                    <div
                      key={t}
                      className="h-6 w-20 rounded bg-muted animate-pulse"
                      aria-label={`${t} logo placeholder`}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10" />
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://picsum.photos/seed/ppc-hero/800/600")',
                }}

              />
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    Typical VA Earnings
                  </p>
                  <p className="text-base font-bold text-foreground">₱60K–₱80K / mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats band ────────────────────────────────────────── */}
      <section className="w-full border-y border-border bg-background py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeUp key={s.label} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {s.label}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section id="tools" className="w-full bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <FadeUp>
            <div className="mb-8 flex max-w-2xl flex-col gap-3">
              <h2 className="text-2xl font-black tracking-tight">
                Why Practice With Our Sampler?
              </h2>
              <p className="text-base text-muted-foreground">
                Designed for Filipino Virtual Assistants who want a real, hands-on taste
                of Amazon PPC work before committing to the full program.
              </p>
            </div>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-1 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ─── What you'll learn ─────────────────────────────────── */}
      <section id="curriculum" className="w-full bg-primary/5 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="mb-3 text-2xl font-black tracking-tight">
                What You Will Learn
              </h2>
              <p className="text-sm text-muted-foreground">
                In the free sampler you&apos;ll work through four short, realistic steps —
                no Amazon account or prior experience required.
              </p>
            </div>
            <div className="space-y-4">
              {learnItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
                After the free sampler, you&apos;ll be able to:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Spot a listing that isn&apos;t ready to advertise — and say exactly why.</li>
                <li>• Write a short, credible escalation note a manager would accept.</li>
                <li>• Make one safe search-term decision (negate vs. keep) with clear reasoning.</li>
                <li>• Name the right AMPH v2 track for your goals.</li>
              </ul>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
                After the free sampler, you&apos;ll be able to:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Spot a listing that isn&apos;t ready to advertise — and say exactly why.</li>
                <li>• Write a short, credible escalation note a manager would accept.</li>
                <li>• Make one safe search-term decision (negate vs. keep) with clear reasoning.</li>
                <li>• Name the right AMPH v2 track for your goals.</li>
              </ul>
            </div>
            <div className="pt-2">
              <a href="/sampler">
                <Button
                  variant="ghost"
                  className="w-fit font-bold text-primary hover:text-primary/80"
                >
                  Start the Free Sampler
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute -inset-2 rotate-2 rounded-2xl bg-primary/20 blur-sm" />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div
                className="aspect-video w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://picsum.photos/seed/ppc-module/600/340")',
                }}

              />
              <div className="bg-card p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary">75%</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Sampler Step 3: Search-Term Triage
                </h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Decide what to negate, what to keep — and why
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────── */}
      <section id="stories" className="w-full bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <FadeUp>
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="mb-3 text-2xl font-black tracking-tight">
                Success Stories
              </h2>
              <p className="text-base text-muted-foreground">
                Join thousands of VAs who have transformed their careers.
              </p>
            </div>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400" />
                  ))}
                </div>
                <p className="flex-grow text-sm italic text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────── */}
      <section id="resources" className="w-full bg-background py-12 mb-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center shadow-2xl shadow-primary/30">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#ffffff 2px, transparent 2px)",
                backgroundSize: "30px 30px",
              }}
            />
            <h2 className="relative z-10 mb-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              Ready for the Full Program?
            </h2>
            <p className="relative z-10 mx-auto mb-6 max-w-2xl text-base text-white/80">
              PPC Companion is a free taste. The full curriculum, coaching, and
              certification live in AMPH v2 — built by ProjectAmazonPH for Filipino VAs.
            </p>
            <div className="relative z-10 flex flex-col gap-3">
              <a href="/projectamazonph">
                <Button
                  className="h-12 w-full bg-white text-base font-bold text-primary hover:bg-white/90"
                >
                  See AMPH v2 — from ₱2,999
                </Button>
              </a>
              <a href="/sampler">
                <Button
                  variant="outline"
                  className="h-12 w-full border-white/40 bg-primary text-base font-bold text-white hover:bg-primary/90"
                >
                  Try the Free Sampler First
                </Button>
              </a>
            </div>
            <p className="relative z-10 mt-4 text-xs text-white/60">
              No credit card required to try the sampler.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card pt-10 pb-28 md:pb-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="PPC Companion" width={28} height={28} />
              <span className="text-lg font-bold text-foreground">PPC Companion</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Empowering Filipino Virtual Assistants with world-class Amazon
              advertising skills.
            </p>
            <div className="mt-1 flex gap-4">
              {["Facebook", "LinkedIn", "Twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social}
                >
                  <div className="h-5 w-5 rounded bg-muted" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-foreground">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@projectamazonph.com
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Cebu · Davao · Iloilo · NCR
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-3 font-bold text-foreground">Academy</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <a href="#curriculum" className="transition-colors hover:text-primary">
                    Courses
                  </a>
                </li>
                <li>
                  <a href="#mentors" className="transition-colors hover:text-primary">
                    Instructors
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-bold text-foreground">Resources</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="transition-colors hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#tools" className="transition-colors hover:text-primary">
                    PPC Calculator
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-border px-4 pt-6 text-center">
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} PPC Companion — ProjectAmazonPH. All rights
            reserved.
          </p>
          <div className="mt-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Mobile bottom nav ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-card md:hidden">
        <div className="grid h-16 max-w-lg grid-cols-5 mx-auto font-medium">
          {[
            { icon: "home", label: "Home", active: true },
            { icon: "school", label: "Courses", active: false },
            { icon: "users", label: "Community", active: false },
            { icon: "bar-chart", label: "Progress", active: false },
            { icon: "user", label: "Profile", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 group",
                item.active ? "text-primary" : "text-muted-foreground"
              )}
              type="button"
            >
              <span className="mb-1 text-2xl group-hover:text-primary">
                {item.icon === "home" && <Layers className="h-6 w-6" />}
                {item.icon === "school" && <GraduationCap className="h-6 w-6" />}
                {item.icon === "users" && <Users className="h-6 w-6" />}
                {item.icon === "bar-chart" && <TrendingUp className="h-6 w-6" />}
                {item.icon === "user" && <Star className="h-6 w-6" />}
              </span>
              <span className="text-[10px] group-hover:text-primary">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
