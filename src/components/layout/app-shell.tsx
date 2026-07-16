"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Sidebar } from "./sidebar";
import { useAppStore, useProgressStats, pathToSection } from "@/lib/store";
import {
  List as Menu, Moon, Sun, ArrowsCounterClockwise as RotateCcw, SignOut as LogOut, User as UserIcon, BookOpen, Target, MagnifyingGlass as Search, Bell } from "@phosphor-icons/react";
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
import styles from "./app-shell.module.css";

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
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("ppc-theme");
    return stored === "dark" ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(() => typeof window !== "undefined");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  const activeSection = pathToSection(pathname);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const stats = useProgressStats();
  const { toast } = useToast();

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

  const userInitials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  const roleColor =
    user?.role === "admin"
      ? "bg-rose-500"
      : user?.role === "instructor"
      ? "bg-violet-500"
      : user?.role === "guest"
      ? "bg-stone-500"
      : "bg-orange-500";

  const meta = sectionLabels[activeSection] ?? sectionLabels.dashboard;
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
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuBtn}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
            <div className={clsx(styles.hamburgerBox, mobileMenuOpen && styles.hamburgerOpen)}>
              <span className={clsx(styles.hamburgerLine, styles.hamburgerTop)} />
              <span className={clsx(styles.hamburgerLine, styles.hamburgerMid)} />
              <span className={clsx(styles.hamburgerLine, styles.hamburgerBot)} />
            </div>
          </button>

          <ProjectAmazonPHHeader projectName="PPC Companion" />

          <div className={styles.pageMeta}>
            <h2 className={styles.pageTitle}>{meta.title}</h2>
            <p className={styles.pageSubtitle}>{meta.subtitle}</p>
          </div>

          <div className={styles.actions}>
            <div
              className={clsx(
                styles.searchBox,
                searchFocused ? styles.searchBoxFocused : styles.searchBoxDefault
              )}
            >
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search…"
                className={styles.searchInput}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </div>

            <div className={styles.progressBadge}>
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

            <div className="flex items-center"><NotificationsPanel /></div>

            <button
              onClick={toggleTheme}
              className={styles.actionIcon}
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className={styles.actionIcon} aria-label="Reset progress">
                  <RotateCcw className="w-4 h-4" />
                </button>
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

            <div className={styles.separator} />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={styles.userBtn} aria-label="User menu">
                    <div className={clsx(styles.userAvatar, roleColor)}>
                      {userInitials}
                    </div>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userRole}>{user.role}</p>
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

      <div className={styles.layout}>
        <aside className={styles.sidebarWrapper}>
          <div className={styles.sidebarSticky}>
            <Sidebar />
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            <div key={activeSection} className={styles.contentInner}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.overlayBackdrop} onClick={() => setMobileMenuOpen(false)} />
          <div className={styles.overlaySidebar}>
            <Sidebar
              mobile
              onClose={() => setMobileMenuOpen(false)}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>
            <span className={styles.footerTitle}>{programOverview.title}</span>
            <span className={styles.footerVersion}>v{programOverview.version} — {programOverview.duration}</span>
          </p>
          <p>Student Workbook</p>
        </div>
      </footer>
    </div>
  );
}
