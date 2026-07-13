"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useAppStore, useProgressStats, pathToSection } from "@/lib/store";
import {
  Menu,
  Moon,
  Sun,
  RotateCcw,
  LogOut,
  User as UserIcon,
  BookOpen,
  Target,
  Search,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { programOverview } from "@/lib/course-data";
import { useToast } from "@/hooks/use-toast";
import { BrandButton, GlassButton } from "@/components/shared/buttons";
import { ProjectAmazonPHHeader } from "@/components/shared/ProjectAmazonPHHeader";
import { NotificationsPanel } from "@/components/shared/notifications-panel";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { cn } from "@/lib/utils";

const sectionLabels: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your training overview & progress" },
  curriculum: { title: "Curriculum", subtitle: "8–12 weeks · 4 phases · 10 modules" },
  exercises: { title: "Exercises", subtitle: "Practice & submit your answers" },
  quizzes: { title: "Quizzes", subtitle: "Phase checkpoints — auto-graded" },
  tools: { title: "Tools", subtitle: "Calculators & analyzers" },
  reference: { title: "Reference", subtitle: "Glossary · formulas · checklists" },
  capstone: { title: "Capstone", subtitle: "Final project deliverables" },
  students: { title: "Student Management", subtitle: "Admin · full CRUD on all students" },
  myprofile: { title: "My Profile", subtitle: "Your progress, submissions, and activity" },
  mystudents: { title: "My Students", subtitle: "Instructor · view and grade your students" },
  cohorts: { title: "Cohorts", subtitle: "Training cohorts and enrollments" },
  audit: { title: "Audit Log", subtitle: "Admin · all recorded actions" },
  downloads: { title: "Downloads", subtitle: "Templates, cheat sheets & reference materials" },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  // Lazy-initialize theme from localStorage (avoids setState-in-effect lint)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("ppc-theme");
    return stored === "dark" ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(() => typeof window !== "undefined");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  // Derive the active section from the URL — the source of truth is now the
  // browser address bar, not the Zustand store. This keeps the topbar label
  // in sync with sidebar highlights even on browser back/forward.
  const activeSection = pathToSection(pathname);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const stats = useProgressStats();
  const { toast } = useToast();

  // Apply theme class to <html> when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("ppc-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("ppc-theme", next);
  };

  const handleReset = () => {
    resetProgress();
    toast({
      title: "Progress reset",
      description: "All your saved answers, quiz results, and checklist items have been cleared.",
    });
  };

  const handleLogout = () => {
    const firstName = user?.name?.split(" ")[0] ?? "there";
    logout();
    toast({
      title: "Signed out",
      description: `Goodbye, ${firstName}! Your progress was saved locally.`,
    });
  };

  // Compute initials for avatar
  const userInitials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  const roleColor =
    user?.role === "admin"
      ? "from-rose-500 to-red-600"
      : user?.role === "instructor"
      ? "from-violet-500 to-purple-600"
      : user?.role === "guest"
      ? "from-stone-400 to-stone-600"
      : "from-orange-500 to-orange-600";

  const meta = sectionLabels[activeSection] ?? sectionLabels.dashboard;
  // Compute overall progress percentage (simple blend)
  const overall =
    Math.min(100,
      Math.round(
        ((stats.exercisesAttempted / 11) * 25 +
          (stats.quizzesTaken / 4) * 30 +
          (stats.capstoneDone / 5) * 30 +
          (stats.checklistDone / 9) * 15)
      )
    );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ═══════════════════════════════════════════════════════════
          Top bar
          ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-3 z-30 mx-4 lg:mx-6 rounded-2xl apple-glass border-none shadow-tinted">
        <div className="flex h-12 items-center gap-3 px-4">
          {/* Mobile sidebar trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden -ml-1 shrink-0 flex flex-col items-center justify-center h-11 w-11 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
            <div className="relative flex flex-col items-center justify-center w-5 h-4">
              <span
                className={`absolute block h-[2px] w-5 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  mobileMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                }`}
              />
              <span
                className={`absolute block h-[2px] w-5 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  mobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                }`}
              />
              <span
                className={`absolute block h-[2px] w-5 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  mobileMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                }`}
              />
            </div>
          </button>

          {/* ProjectAmazonPH brand header */}
          <ProjectAmazonPHHeader projectName="PPC Companion" />

          {/* Page title + subtitle */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight truncate leading-tight text-foreground">
              {meta.title}
            </h2>
            <p className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">
              {meta.subtitle}
            </p>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {/* Search trigger */}
            <div
              className={cn(
                "hidden md:flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all",
                searchFocused
                  ? "bg-background border-blue-400/50 shadow-sm shadow-blue-500/10 w-52"
                  : "bg-muted/40 border-transparent w-40"
              )}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="hidden lg:inline-flex text-[9px] text-muted-foreground/40 bg-muted/60 rounded px-1 py-0.5 font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Progress badge */}
            <div className="hidden md:flex items-center">
              <Badge
                variant="outline"
                className="bg-blue-500/5 border-blue-500/15 text-blue-600 dark:text-blue-400 px-2.5 py-1 font-medium"
              >
                <span className="text-[10px] uppercase tracking-wider mr-1.5 opacity-70">
                  Progress
                </span>
                <span className="text-[11px] font-semibold tabular-nums">
                  {mounted ? overall : 0}%
                </span>
              </Badge>
            </div>

            {/* Notification bell with panel */}
            <div className="mobile-tap-target flex items-center"><NotificationsPanel /></div>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 text-muted-foreground"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </Button>

            {/* Reset */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Reset progress"
                  className="h-9 w-9 text-muted-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently clear all your saved exercise answers, quiz results,
                    capstone checklist, and weekly checklist items. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-border mx-1" />

            {/* User menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2.5 rounded-full hover:bg-muted/50 transition-colors shrink-0 py-1 pl-1 pr-2.5"
                    aria-label="User menu"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-semibold shadow-sm ring-2 ring-background shrink-0",
                        roleColor
                      )}
                    >
                      {userInitials}
                    </div>
                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-[12px] font-medium leading-tight max-w-[110px] lg:max-w-[140px] truncate text-foreground">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1.5">
                  <div className="px-2.5 py-2">
                    <p className="text-[13px] font-semibold leading-none text-foreground">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{user.email}</p>
                    {user.cohort && (
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
                        Cohort: {user.cohort}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-muted-foreground cursor-default pointer-events-none py-1.5">
                    <UserIcon className="h-3.5 w-3.5 mr-2.5 text-muted-foreground/60" />
                    Role:{" "}
                    <span className="font-medium text-foreground capitalize ml-1">
                      {user.role}
                    </span>
                    {user.status && user.status !== "ACTIVE" && (
                      <Badge variant="secondary" className="ml-auto text-[9px] capitalize">
                        {user.status.toLowerCase()}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  {user.currentPhase && (
                    <DropdownMenuItem className="text-xs text-muted-foreground cursor-default pointer-events-none py-1.5">
                      <BookOpen className="h-3.5 w-3.5 mr-2.5 text-muted-foreground/60" />
                      Phase:{" "}
                      <span className="font-medium text-foreground ml-1">
                        {user.currentPhase} / 4
                      </span>
                    </DropdownMenuItem>
                  )}
                  {user.targetAcos && (
                    <DropdownMenuItem className="text-xs text-muted-foreground cursor-default pointer-events-none py-1.5">
                      <Target className="h-3.5 w-3.5 mr-2.5 text-muted-foreground/60" />
                      Target ACoS:{" "}
                      <span className="font-medium text-foreground ml-1">
                        {user.targetAcos}%
                      </span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-xs text-muted-foreground cursor-default pointer-events-none py-1.5">
                    <span className="mr-2.5">Signed in:</span>
                    <span className="font-medium text-foreground ml-1">
                      {new Date(user.loggedInAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer py-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          Main split layout
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block shrink-0 border-r border-border/60">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <Sidebar />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <div key={activeSection} className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Mobile overlay sidebar
          ═══════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl shadow-black/20 animate-slide-in-left safe-top">
            <Sidebar
              mobile
              onClose={() => setMobileMenuOpen(false)}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-border/40 bg-background">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/60 text-center sm:text-left">
          <p className="min-w-0">
            <span className="font-medium text-foreground/70">
              {programOverview.title}
            </span>
            <span className="mx-2 text-border/40 hidden sm:inline">/</span>
            <span className="block sm:inline text-muted-foreground/50">
              v{programOverview.version} — {programOverview.duration}
            </span>
          </p>
          <p className="text-muted-foreground/40">Student Workbook</p>
        </div>
      </footer>
    </div>
  );
}
