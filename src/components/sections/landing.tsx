"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type User } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid } from "@/components/shared/scroll-reveal";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  GraduationCap,
  Layers,
  Clock,
  PenLine,
  Trophy,
  Users,
  Star,
  Menu,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  Quote,
  Search,
  Play,
} from "lucide-react";

// =============================================================
// Content
// =============================================================

const stats = [
  { value: "5,000+", label: "Active Students", description: "Enrolled across the Philippines", icon: Users },
  { value: "98%", label: "Hired Rate", description: "Within 3 months of certification", icon: TrendingUp },
  { value: "50+", label: "Training Modules", description: "Covering Basic to Advanced AI PPC", icon: BookOpen },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Driven Analysis",
    description:
      "Learn to leverage the latest AI tools (ChatGPT, Claude, specialized Amazon bots) to optimize campaigns 10x faster.",
  },
  {
    icon: ShieldCheck,
    title: "Certified Curriculum",
    description:
      "Study a syllabus built by 7-figure sellers that meets current industry standards.",
  },
  {
    icon: Users,
    title: "Career Placement",
    description:
      "Top graduates get matched directly with Amazon sellers in our partner network looking for certified PPC specialists.",
  },
];

const learnItems = [
  {
    title: "Amazon PPC Fundamentals",
    description: "Understanding Sponsored Products, Brands, and Display ads.",
  },
  {
    title: "Keyword Research with AI",
    description: "Using advanced algorithms to find high-converting keywords.",
  },
  {
    title: "Campaign Optimization Logic",
    description: "Bid management, negative keyword strategies, and scaling winners.",
  },
  {
    title: "Reporting & Client Communication",
    description: "How to present data to clients to justify your value.",
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
  { label: "Curriculum", href: "#curriculum" },
  { label: "Mentors", href: "#mentors" },
  { label: "Success Stories", href: "#stories" },
  { label: "Resources", href: "#resources" },
];

// =============================================================
// Auth modal (preserves existing login / signup / guest flow)
// =============================================================

function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "login" ? { email, password } : { email, password, name }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      const user = data.user as User;
      login(user);
      toast({
        title: authMode === "login" ? "Welcome back!" : "Account created",
        description: "Taking you to your dashboard…",
      });
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Could not sign in",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    login({
      id: "guest",
      name: "Guest Student",
      email: "guest@ppc-companion.app",
      role: "student",
    } as User);
    toast({ title: "Exploring as guest", description: "Your progress won't be saved." });
    router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="PPC Companion" width={28} height={28} />
                <h2 className="text-lg font-bold text-foreground">
                  {authMode === "login" ? "Welcome back" : "Start free"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {authMode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maria Santos"
                    required
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="px-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="mt-1 h-11 text-base font-bold">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : authMode === "login" ? (
                  "Sign in"
                ) : (
                  "Create free account"
                )}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="h-11 w-full" onClick={handleGuest}>
              Continue as guest
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
                className="font-semibold text-primary hover:underline"
              >
                {authMode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================
// Landing page
// =============================================================

export function LandingPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const openAuth = () => setAuthOpen(true);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
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
            <Button onClick={openAuth} className="font-bold">
              Enroll Now
            </Button>
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
              <Button onClick={openAuth} className="mt-2 font-bold">
                Enroll Now
              </Button>
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
                New AI Curriculum Updated
              </span>
              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Master Amazon PPC with{" "}
                <span className="text-primary">AI Strategies</span>
              </h1>
              <h2 className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-xl">
                The ultimate training designed for Filipino Virtual Assistants. Launch
                your career with industry-recognized certification and AI-powered
                campaign management skills.
              </h2>
            </div>

            <div className="mt-2 flex w-full flex-col gap-3">
              <Button
                onClick={openAuth}
                className="h-12 w-full text-base font-bold shadow-lg shadow-primary/30"
              >
                Enroll for Free
              </Button>
              <a href="#curriculum">
                <Button
                  variant="outline"
                  className="h-12 w-full text-base font-bold"
                >
                  View Syllabus
                </Button>
              </a>
            </div>

            <div className="mt-4 border-t border-border pt-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Trusted by 7-figure Sellers
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
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay z-10" />
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
                    Average Salary Increase
                  </p>
                  <p className="text-base font-bold text-foreground">+150%</p>
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
                Why Choose Our AI-Powered Training?
              </h2>
              <p className="text-base text-muted-foreground">
                Designed specifically for the modern Virtual Assistant landscape. We
                don&apos;t just teach you the basics; we teach you how to dominate using
                technology.
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
                Our comprehensive curriculum takes you from beginner to expert in 6
                weeks.
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
            <div className="pt-2">
              <a href="#stories">
                <Button
                  variant="ghost"
                  className="w-fit font-bold text-primary hover:text-primary/80"
                >
                  View Full Curriculum
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
                  Module 4: Automated Bidding Rules
                </h3>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Instructor: Sarah Jenkins
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
              Upgrade Your Career?
            </h2>
            <p className="relative z-10 mx-auto mb-6 max-w-2xl text-base text-white/80">
              Join the waiting list for our next cohort. Free to start learning.
            </p>
            <div className="relative z-10 flex flex-col gap-3">
              <Button
                onClick={openAuth}
                className="h-12 w-full bg-white text-base font-bold text-primary hover:bg-white/90"
              >
                Create Free Account
              </Button>
              <Button
                onClick={openAuth}
                variant="outline"
                className="h-12 w-full border-white/40 bg-primary text-base font-bold text-white hover:bg-primary/90"
              >
                Talk to a Mentor
              </Button>
            </div>
            <p className="relative z-10 mt-4 text-xs text-white/60">
              No credit card required. Instant access.
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
                <ShieldCheck className="h-4 w-4 text-primary" /> Makati City, Metro Manila
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

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
