"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type User } from "@/lib/store";
import { programOverview, phases } from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrandButton, GlassButton, PremiumArrowButton } from "@/components/shared/buttons";
import { FadeUp, StaggerGrid } from "@/components/shared/scroll-reveal";
import {
  Flame,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Trophy,
  Calculator,
  BookOpen,
  PenLine,
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  Zap,
  ShieldCheck,
  Star,
  BarChart3,
  Layers,
  CheckCircle2,
  Play,
  Users,
  Award,
  Clock,
  Quote,
  Heart,
} from "lucide-react";

// =============================================================
// Constants
// =============================================================

const stats = [
  { value: "4", label: "Phase", icon: Layers },
  { value: "10", label: "Module", icon: BookOpen },
  { value: "11+", label: "Exercises", icon: PenLine },
  { value: "8–12", label: "Weeks", icon: Clock },
];

const features = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description:
      "10 modules across 4 phases — from Amazon fundamentals to a complete capstone strategy.",
    gradient: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: PenLine,
    title: "Interactive Exercises",
    description:
      "Open-ended, calculation, and decision-based exercises with instant live feedback.",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/10",
  },
  {
    icon: Calculator,
    title: "Live PPC Tools",
    description:
      "Metrics calculator, search term analyzer, and a 4-layer campaign builder.",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10",
  },
  {
    icon: Trophy,
    title: "Capstone Project",
    description:
      "Build a complete PPC strategy and present it as if your instructor is the client.",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/10",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Sign Up Free",
    description: "Create an account in seconds. No credit card required.",
    icon: UserIcon,
  },
  {
    step: "02",
    title: "Access the Curriculum",
    description: "10 modules in 4 phases — from fundamentals to advanced strategy.",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Practice with Tools",
    description: "Use live PPC tools, search term analyzer, and campaign builder.",
    icon: Target,
  },
  {
    step: "04",
    title: "Complete the Capstone",
    description: "Build a real PPC strategy and present it as if your instructor is the client.",
    icon: Award,
  },
];

const testimonials = [
  {
    name: "Maria Santos",
    role: "Amazon Seller, Manila",
    quote:
      "The structured curriculum transformed how I manage PPC campaigns. I feel much more confident now.",
    rating: 5,
  },
  {
    name: "Carlos Reyes",
    role: "E-commerce Manager, Cebu",
    quote:
      "The live tools were the biggest help. It's not just theory — you immediately apply what you learn.",
    rating: 5,
  },
  {
    name: "Ana Lim",
    role: "Virtual Assistant, Davao",
    quote:
      "From zero knowledge, I launched my own PPC campaign after 12 weeks. Absolutely worth it!",
    rating: 5,
  },
];

const floatingIcons = [
  { Icon: TrendingUp, x: "8%", y: "18%", delay: 0, duration: 7 },
  { Icon: Target, x: "85%", y: "12%", delay: 1.2, duration: 8 },
  { Icon: Calculator, x: "92%", y: "65%", delay: 0.6, duration: 9 },
  { Icon: Star, x: "5%", y: "70%", delay: 1.8, duration: 7.5 },
  { Icon: BarChart3, x: "75%", y: "85%", delay: 0.3, duration: 8.5 },
  { Icon: Layers, x: "15%", y: "45%", delay: 2.1, duration: 9.5 },
  { Icon: Zap, x: "60%", y: "8%", delay: 1.5, duration: 7 },
  { Icon: ShieldCheck, x: "40%", y: "92%", delay: 0.9, duration: 8 },
];

// =============================================================
// Main landing/login page
// =============================================================

export function LandingPage() {
  const login = useAppStore((s) => s.login);
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Parallax mouse tracking
  // Parallax mouse tracking (removed for reliability)
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-based parallax (CSS-driven for reliability)
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }
    if (authMode === "signup" && !name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create an account.",
        variant: "destructive",
      });
      return;
    }
    if (authMode === "signup" && password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        authMode === "login"
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password, cohort: "Spring 2026" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const dbRole = (data.user.role ?? "STUDENT").toLowerCase() as User["role"];
      const dbStatus = data.user.status as User["status"];

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: dbRole,
        status: dbStatus,
        cohort: data.user.cohort ?? null,
        currentPhase: data.user.currentPhase ?? 1,
        targetAcos: data.user.targetAcos ?? 30,
        loggedInAt: Date.now(),
        serverProgress: data.progress,
      };

      login(user);

      const firstName = user.name.split(" ")[0];
      toast({
        title:
          authMode === "login"
            ? `Maligayang pagbabalik, ${firstName}!`
            : `Maligayang pagdating, ${firstName}!`,
        description:
          authMode === "login"
            ? user.status === "PAUSED"
              ? "Your account is paused — you can freely browse materials."
              : `Signed in as ${dbRole}. ${user.cohort ? `Cohort: ${user.cohort}.` : ""}`
            : "Your training journey begins now. Start with Phase 1.",
      });
    } catch (err: any) {
      toast({
        title: authMode === "login" ? "Sign in failed" : "Sign up failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    const user: User = {
      name: "Guest Student",
      email: "guest@ppc-training.local",
      role: "guest",
      loggedInAt: Date.now(),
    };
    login(user);
    toast({
      title: "Viewing as guest",
      description: "Your progress will be saved on your local device.",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background"
    >
      {/* ============================================================ */}
      {/* Ambient background — subtle gradient mesh                     */}
      {/* ============================================================ */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900" />

        {/* Soft gradient orbs */}
        <motion.div
          className="absolute -top-32 -left-32 h-[30rem] w-[30rem] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[100px]"
          animate={{ x: scrollY * 0.01, y: scrollY * 0.005 }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
        />
        <motion.div
          className="absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-400/15 dark:bg-amber-500/8 blur-[100px]"
          animate={{
            x: scrollY * -0.008,
            y: scrollY * -0.004,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-400/15 dark:bg-indigo-500/8 blur-[100px]"
          animate={{ x: scrollY * 0.006, y: scrollY * 0.003 }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            color: "rgb(100, 116, 139)",
          }}
        />

        {/* Floating PPC icons */}
        {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:block"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.25, 0.25, 0],
              scale: [0, 1, 1, 0.5],
              y: [0, -16, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="rounded-2xl border border-white/50 dark:border-white/5 bg-white/30 dark:bg-stone-900/30 backdrop-blur-sm p-3 shadow-sm">
              <Icon className="h-5 w-5 text-blue-500/70 dark:text-blue-400/50" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* Top nav                                                      */}
      {/* ============================================================ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 glass border-b border-white/30 dark:border-white/5"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <motion.div
            className="flex items-center gap-2.5 min-w-0"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/20">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0 leading-tight">
              <span className="text-sm font-bold tracking-tight">
                Amazon PPC
              </span>
              <span className="hidden sm:inline text-sm font-bold text-blue-600 dark:text-blue-400">
                {" "}Training
              </span>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-0.5 shrink-0">
            {[
              { label: "Curriculum", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Testimonials", href: "#testimonials" },
            ].map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(true);
                setAuthMode("login");
                setTimeout(() => {
                  document
                    .getElementById("auth-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
              className="hidden sm:inline-flex text-[13px] font-medium"
            >
              Sign in
            </Button>
            <BrandButton
              size="sm"
              onClick={() => {
                setShowForm(true);
                setAuthMode("signup");
                setTimeout(() => {
                  document
                    .getElementById("auth-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </BrandButton>
          </div>
        </div>
      </motion.header>

      {/* ============================================================ */}
      {/* Hero                                                         */}
      {/* ============================================================ */}
      <section className="relative px-4 sm:px-6 pt-20 sm:pt-28 lg:pt-32 pb-20 sm:pb-24">
        <motion.div
          style={{ transform: `translateY(${scrollY * 0.1}px)`, opacity: Math.max(0.4, 1 - scrollY * 0.0008) }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.03] border border-foreground/[0.06] px-4 py-1.5 text-[11px] font-medium text-foreground/60 tracking-wide">
                  v2026 · No Seller Central required
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-6 text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] font-semibold tracking-[-0.03em] leading-[1.05] text-foreground"
              >
                Master{" "}
                <span className="text-primary">
                  Amazon PPC
                </span>
                <br />
                in 12 Weeks
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-5 text-base sm:text-lg text-muted-foreground/80 leading-relaxed max-w-lg font-[425]"
              >
                A complete student workbook turned into an interactive
                platform. Read modules, practice with live tools,
                and build a real capstone strategy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mt-7 flex flex-col sm:flex-row gap-3"
              >
                <BrandButton
                  size="lg"
                  onClick={() => {
                    setShowForm(true);
                    setAuthMode("signup");
                    setTimeout(() => {
                      document
                        .getElementById("auth-form")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }, 100);
                  }}
                  className="group w-full sm:w-auto rounded-full px-7 py-3 text-[14px] font-medium shadow-tinted"
                >
                  Start learning free
                  <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </BrandButton>
                <GlassButton
                  size="lg"
                  onClick={handleGuest}
                  className="w-full sm:w-auto"
                >
                  <Play className="h-4 w-4" />
                  Try as guest
                </GlassButton>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div className="flex -space-x-1.5">
                  {[
                    "bg-blue-500",
                    "bg-amber-500",
                    "bg-emerald-500",
                    "bg-violet-500",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 border-background",
                        color
                      )}
                    />
                  ))}
                </div>
                <span className="text-foreground/50">Trusted by students and instructors across the Philippines</span>
              </motion.div>
            </div>

            {/* Right: animated preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
              style={{
                x: scrollY * -0.004,
                y: scrollY * -0.002,
              }}
              className="relative"
            >
              <HeroPreviewCard />
            </motion.div>
          </div>

          {/* Stats — social proof row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 sm:mt-20"
          >
            <div className="relative rounded-2xl surface-card p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {stats.map((s, i) => {
                  const StatIcon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.9 + i * 0.08,
                        duration: 0.4,
                      }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1.5">
                        <StatIcon className="h-4 w-4 text-blue-500/60" />
                        <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground stat-value">
                          {s.value}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {s.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* Divider                                                      */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-6px px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      </div>

      {/* ============================================================ */}
      {/* Features section                                             */}
      {/* ============================================================ */}
      <section id="features" className="relative px-4 sm:px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 px-3.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Lahat sa isang lugar
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Built for serious learners.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Loved by instructors across the Philippines.
              </span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Every piece of the workbook, turned into interactive tools that truly
              you can use right away.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-2xl border border-foreground/5 bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm p-6 hover:border-foreground/10 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300"
                >
                  {/* Hover glow */}
                  <div
                    className={cn(
                      "absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl",
                      f.bgGlow
                    )}
                  />
                  <div
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                      f.gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[15px]">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                  <ChevronRight className="absolute bottom-5 right-5 h-4 w-4 text-foreground/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* How it works                                                 */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        className="relative px-4 sm:px-6 py-24 sm:py-32 bg-gradient-to-b from-transparent via-blue-50/40 dark:via-blue-950/10 to-transparent"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 mb-4">
              <Zap className="h-3.5 w-3.5" />
              Simple process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              From sign up to capstone — follow 4 simple steps.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: i * 0.12,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="relative text-center group"
                >
                  {/* Connecting line (desktop) */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                      <div className="w-full h-full bg-gradient-to-r from-foreground/10 to-foreground/5" />
                      <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/10" />
                    </div>
                  )}

                  {/* Step number + icon */}
                  <div className="relative inline-flex">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-stone-800 dark:to-stone-900 border border-foreground/5 shadow-sm group-hover:shadow-md group-hover:border-foreground/10 transition-all duration-300">
                      <StepIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white text-[10px] font-bold shadow-sm">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="mt-4 font-semibold text-[15px]">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Testimonials                                                 */}
      {/* ============================================================ */}
      <section id="testimonials" className="relative px-4 sm:px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 px-3.5 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 mb-4">
              <Heart className="h-3.5 w-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What Our Students Say
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Real experiences from graduates of the program.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 grid-cols-1 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                whileHover={{ y: -3 }}
                className="relative rounded-2xl border border-foreground/5 bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm p-6 hover:border-foreground/10 hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300"
              >
                <Quote className="h-8 w-8 text-blue-500/15 mb-3" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA section                                                  */}
      {/* ============================================================ */}
      <section className="relative px-4 sm:px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_50%)]" />

            {/* Content */}
            <div className="relative rounded-2xl surface-card px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20 text-center overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-medium text-white/90 mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  From workbook to interactive platform
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
              >
                Ready to transform
                <br />
                your first step?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-base sm:text-lg text-blue-100/80 max-w-xl mx-auto leading-relaxed"
              >
                Join the students who have already started their Amazon PPC
                journey. No payment required to start — try it first, trust
                yourself.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
              >
                <BrandButton
                  size="lg"
                  variant="accent"
                  onClick={() => {
                    setShowForm(true);
                    setAuthMode("signup");
                    setTimeout(() => {
                      document
                        .getElementById("auth-form")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }, 100);
                  }}
                  className="group w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10"
                >
                  Start now — it's free
                  <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </BrandButton>
                <GlassButton
                  size="lg"
                  onClick={handleGuest}
                  className="w-full sm:w-auto border-white/25 text-white hover:bg-white/15 hover:text-white"
                >
                  <Play className="h-4 w-4" />
                  Try as guest
                </GlassButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mt-6 flex items-center justify-center gap-4 text-xs text-blue-200/60"
              >
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No credit card
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Start free
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cancel anytime
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Auth form section                                            */}
      {/* ============================================================ */}
      <section id="auth-form" className="relative px-4 sm:px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-md">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <AuthCard
                  authMode={authMode}
                  setAuthMode={setAuthMode}
                  email={email}
                  setEmail={setEmail}
                  name={name}
                  setName={setName}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                  handleGuest={handleGuest}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative rounded-2xl surface-card p-8 sm:p-10 overflow-hidden"
                >
                  <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-2xl" />
                  <Trophy className="h-12 w-12 mx-auto text-amber-500" />
                  <h3 className="mt-5 text-2xl font-bold tracking-tight">
                    Ready to begin?
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Sign in to track your progress across all 4
                    phases — or join as a guest.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <BrandButton
                      onClick={() => {
                        setShowForm(true);
                        setAuthMode("signup");
                      }}
                      className="w-full sm:w-auto"
                    >
                      Create account
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </BrandButton>
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(true)}
                      className="w-full sm:w-auto"
                    >
                      Mayroon na akong account
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Footer                                                       */}
      {/* ============================================================ */}
      <footer className="relative px-4 sm:px-6 py-10 border-t border-foreground/5">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
                  <Flame className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  Amazon PPC Training
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-xs">
                Isang kumpletong workbook ng estudyante na naging interactive na
                learning platform para sa Amazon PPC advertising.
              </p>
            </div>

            {/* Program */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Programa
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Curriculum
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-foreground transition-colors">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Impormasyon
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {programOverview.title}
                  </span>
                </li>
                <li>Bersyon {programOverview.version}</li>
                <li>{programOverview.duration}</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-foreground/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Amazon PPC Manager · Companion
              karapatan ay nakalaan.
            </p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ginawa gamit ang motion · Student Workbook
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =============================================================
// Animated hero preview card — shows a mini dashboard mockup
// =============================================================

function HeroPreviewCard() {
  const phaseColors = [
    "from-blue-500 to-blue-600",
    "from-rose-500 to-red-500",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
  ];

  const phases = [
    { num: 1, title: "Foundations", desc: "How Amazon works & core PPC metrics", color: "bg-blue-500" },
    { num: 2, title: "Optimization", desc: "Campaign structure & bidding strategies", color: "bg-rose-500" },
    { num: 3, title: "Advanced", desc: "Keyword research & data analysis", color: "bg-emerald-500" },
    { num: 4, title: "Portfolio", desc: "Reporting & capstone project", color: "bg-violet-500" },
  ];

  return (
    <div className="relative">
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-violet-500/20 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Double-Bezel Outer Shell */}
      <div className="rounded-[2rem] bg-white/5 dark:bg-black/20 p-[2px] ring-1 ring-black/5 dark:ring-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40">
        {/* Double-Bezel Inner Core */}
        <div className="rounded-[calc(2rem-2px)] bg-white dark:bg-stone-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
          {/* Window header */}
          <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-black/5 dark:border-white/5">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-400/80 ring-1 ring-rose-400/30" />
              <div className="h-3 w-3 rounded-full bg-amber-400/80 ring-1 ring-amber-400/30" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/80 ring-1 ring-emerald-400/30" />
            </div>
            <div className="ml-3 flex-1 max-w-[180px]">
              <div className="h-2 rounded-full bg-black/5 dark:bg-white/10" />
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              training.ppc
            </div>
          </div>

          {/* Mock dashboard content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Greeting row */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-2.5 w-20 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="mt-2 h-4 w-36 rounded-full bg-black/15 dark:bg-white/15" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Phase pills */}
            <div className="grid grid-cols-2 gap-2">
              {phases.map((p) => (
                <div
                  key={p.num}
                  className="rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-3 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${p.color} text-white text-[10px] font-bold`}>
                      {p.num}
                    </div>
                    <span className="text-[11px] font-semibold">{p.title}</span>
                  </div>
                  <p className="mt-1.5 text-[9px] text-muted-foreground/70 leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mock progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-muted-foreground/50">
                <span>Overall Progress</span>
                <span className="font-medium text-foreground/60">42%</span>
              </div>
              <div className="h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full w-[42%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 1.5, delay: 0.8, ease: [0.32, 0.72, 0, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}function AuthCard({
  authMode,
  setAuthMode,
  email,
  setEmail,
  name,
  setName,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  submitting,
  handleSubmit,
  handleGuest,
}: {
  authMode: "login" | "signup";
  setAuthMode: (m: "login" | "signup") => void;
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleGuest: () => void;
}) {
  return (
    <div className="relative">
      {/* Glow */}
      <motion.div
        className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-blue-500/15 blur-xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative rounded-2xl glass-strong border border-white/40 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 p-6 sm:p-8">
        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-foreground/5 mb-6 relative">
          {(["login", "signup"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAuthMode(mode)}
              className={cn(
                "relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors z-10",
                authMode === mode
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {authMode === mode && (
                <motion.div
                  layoutId="authTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {mode === "login" ? "Sign in" : "Create account"}
              </span>
            </button>
          ))}
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {authMode === "login"
              ? "Welcome back"
              : "Begin your journey"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {authMode === "login"
              ? "Sign in to continue your training."
              : "Create an account to track your progress."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {authMode === "signup" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <Label htmlFor="name" className="text-xs font-medium">
                  Full name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan dela Cruz"
                    className="pl-10 h-11"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="pl-10 h-11"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                autoComplete={
                  authMode === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {authMode === "login" && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                <input type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          )}

          <BrandButton
            type="submit"
            disabled={submitting}
            className="w-full h-11 group"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {authMode === "login"
                  ? "Signing in…"
                  : "Creating account…"}
              </>
            ) : (
              <>
                {authMode === "login"
                  ? "Sign in"
                  : "Create account"}
                <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </BrandButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            o
          </span>
          <div className="flex-1 h-px bg-foreground/10" />
        </div>

        {/* Guest */}
        <GlassButton onClick={handleGuest} className="w-full h-11">
          Continue as guest
        </GlassButton>

        <div className="mt-5 rounded-xl bg-foreground/5 border border-foreground/5 p-3.5 text-center">
          <p className="text-[10px] text-muted-foreground">
            Admin access ·{" "}
            <code className="px-1.5 py-0.5 rounded bg-foreground/10 font-mono text-[9px] text-foreground">
              admin@ppc-companion.app
            </code>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground opacity-80">
            Secure your admin account after first login.
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground opacity-60">
            Create a student account above or sign in as guest.
          </p>
        </div>
      </div>
    </div>
  );
}
