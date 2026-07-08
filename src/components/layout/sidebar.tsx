"use client";

import { useState } from "react";
import { useAppStore, type Section, useProgressStats } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  GraduationCap,
  Calculator,
  BookMarked,
  Trophy,
  Flame,
  CheckCircle2,
  Users,
  UserCircle,
  ClipboardList,
  School,
  ScrollText,
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Bell,
  Gauge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// =============================================================
// Nav item definition
// =============================================================

type NavItem = {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  roles: ("student" | "instructor" | "admin" | "guest")[];
  group: "main" | "admin";
};

const navItems: NavItem[] = [
  // Main sections — visible to everyone
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your training overview", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "curriculum", label: "Curriculum", icon: BookOpen, description: "All 4 phases & modules", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "exercises", label: "Exercises", icon: PenLine, description: "Practice & submit", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "quizzes", label: "Quizzes", icon: GraduationCap, description: "Phase checkpoints", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "tools", label: "Tools", icon: Calculator, description: "Calculators & analyzer", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "reference", label: "Reference", icon: BookMarked, description: "Glossary, formulas, checklist", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "capstone", label: "Capstone", icon: Trophy, description: "Final project tracker", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "downloads", label: "Downloads", icon: Download, description: "Templates & cheat sheets", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Activity alerts & updates", roles: ["student", "instructor", "admin", "guest"], group: "main" },

  // Student-only — their own profile
  { id: "myprofile", label: "My Profile", icon: UserCircle, description: "Your progress & activity", roles: ["student"], group: "main" },

  // Instructor — their students + grading

  // Admin — full management
];

// =============================================================
// Sidebar (desktop — collapsible)
// =============================================================

export function Sidebar({
  onNavigate,
  mobile = false,
  onClose,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const activeSection = useAppStore((s) => s.activeSection);
  const setSection = useAppStore((s) => s.setSection);
  const user = useAppStore((s) => s.user);
  const stats = useProgressStats();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = user?.role ?? "guest";
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));
  const mainItems = visibleItems.filter((item) => item.group === "main");
  const adminItems = visibleItems.filter((item) => item.group === "admin");

  const handleNav = (id: Section) => {
    setSection(id);
    onNavigate?.();
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

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "instructor"
      ? "Instructor"
      : user?.role === "guest"
      ? "Guest"
      : "Student";

  // ── Collapsed width only on desktop ──
  const sidebarWidth = mobile
    ? "w-72"
    : collapsed
    ? "w-[68px]"
    : "w-72";

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        sidebarWidth
      )}
    >
      {/* ── Logo / Brand ── */}
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border/60",
          collapsed && !mobile ? "justify-center px-0 py-4" : "gap-3 px-4 py-4"
        )}
      >
        {/* Gradient icon mark */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-600/20",
            collapsed && !mobile ? "h-9 w-9" : "h-9 w-9"
          )}
        >
          <Flame className="h-4.5 w-4.5" />
        </div>

        {/* Text — hidden when collapsed on desktop */}
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <h1 className="text-[13px] font-semibold tracking-tight leading-tight truncate text-sidebar-foreground">
              ProjectAmazonPH
            </h1>
            <p className="text-[11px] text-sidebar-foreground/50 leading-tight">
              PPC Companion
            </p>
          </div>
        )}

        {/* Mobile close button */}
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Collapse toggle (desktop only) ── */}
      {!mobile && (
        <div className="flex justify-end px-3 pt-2 pb-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {/* Section label */}
        {(!collapsed || mobile) && (
          <p className="px-2.5 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/35">
            Overview
          </p>
        )}
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => handleNav(item.id)}
              stats={stats}
              collapsed={collapsed && !mobile}
            />
          ))}
        </div>

        {adminItems.length > 0 && (
          <>
            {(!collapsed || mobile) && (
              <p className="px-2.5 pb-1.5 pt-5 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/35">
                {userRole === "admin" ? "Administration" : "Teaching"}
              </p>
            )}
            {collapsed && !mobile && (
              <div className="mx-auto my-2 h-px w-5 bg-sidebar-border/60" />
            )}
            <div className="space-y-0.5">
              {adminItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => handleNav(item.id)}
                  stats={stats}
                  collapsed={collapsed && !mobile}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* ── Progress summary (students/guests) ── */}
      {(userRole === "student" || userRole === "guest") &&
        (!collapsed || mobile) && (
          <div className="border-t border-sidebar-border/60 px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-sidebar-foreground/50">
                <CheckCircle2 className="h-3 w-3 text-blue-500/80" />
                Exercises
              </span>
              <span className="font-medium text-sidebar-foreground/80 tabular-nums">
                {stats.exercisesAttempted}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-sidebar-foreground/50">
                <GraduationCap className="h-3 w-3 text-blue-500/80" />
                Quiz score
              </span>
              <span className="font-medium text-sidebar-foreground/80 tabular-nums">
                {stats.totalCorrect}/{stats.totalQuestions || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-sidebar-foreground/50">
                <Trophy className="h-3 w-3 text-blue-500/80" />
                Capstone
              </span>
              <span className="font-medium text-sidebar-foreground/80 tabular-nums">
                {stats.capstoneDone}/{stats.capstoneTotal}
              </span>
            </div>
          </div>
        )}

      {/* ── User profile ── */}
      {user && (
        <div
          className={cn(
            "border-t border-sidebar-border/60",
            collapsed && !mobile ? "px-2 py-3" : "px-3 py-3"
          )}
        >
          {collapsed && !mobile ? (
            /* Collapsed: just the avatar */
            <div className="flex justify-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-semibold shadow-sm",
                  roleColor
                )}
              >
                {userInitials}
              </div>
            </div>
          ) : (
            /* Expanded: full profile row */
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-[10px] font-semibold shadow-sm",
                  roleColor
                )}
              >
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium leading-tight truncate text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/45 leading-tight truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  const firstName = user?.name?.split(" ")[0] ?? "there";
                  useAppStore.getState().logout();
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {(!collapsed || mobile) && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-sidebar-foreground/40">
                {roleLabel} · v2026
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================
// Nav button
// =============================================================

function NavButton({
  item,
  active,
  onClick,
  stats,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  stats: ReturnType<typeof useProgressStats>;
  collapsed?: boolean;
}) {
  const Icon = item.icon;

  const buttonContent = (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center rounded-lg text-left transition-all duration-150",
        collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
        active
          ? "bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {/* Active indicator — left border accent */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-500" />
      )}

      {/* Icon container */}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md transition-colors",
          collapsed ? "h-8 w-8" : "h-7 w-7",
          active
            ? "bg-blue-500/10 text-blue-500"
            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      {/* Label + description */}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="text-[13px] leading-tight truncate">{item.label}</div>
          {!active && (
            <div className="text-[10px] text-sidebar-foreground/35 leading-tight truncate mt-0.5">
              {item.description}
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {!collapsed && item.id === "capstone" && stats.capstoneDone > 0 && (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-500 border-0 text-[10px] px-1.5 font-medium"
        >
          {stats.capstoneDone}/5
        </Badge>
      )}
      {!collapsed && item.id === "quizzes" && stats.quizzesTaken > 0 && (
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-500 border-0 text-[10px] px-1.5 font-medium"
        >
          {stats.quizzesTaken}/4
        </Badge>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
