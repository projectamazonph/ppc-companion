"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAppStore, type Section, useProgressStats, pathToSection, sectionToPath } from "@/lib/store";
import { SquaresFour as LayoutDashboard, BookOpen, Pen as PenLine, GraduationCap, Calculator, BookBookmark as BookMarked, Trophy, Flame, CheckCircle as CheckCircle2, Users, UserCircle, ClipboardText as ClipboardList, Student as School, Scroll as ScrollText, Download, CaretLeft as ChevronLeft, CaretRight as ChevronRight, SignOut as LogOut, X, Bell, Gauge, Compass } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import styles from "./sidebar.module.css";

type NavItem = {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
  description: string;
  roles: ("student" | "instructor" | "admin" | "guest")[];
  group: "main" | "admin";
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your training overview", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "sampler", label: "PPC Sampler", icon: Compass, description: "Try a real PPC task (15 min)", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "curriculum", label: "Curriculum", icon: BookOpen, description: "All 4 phases & modules", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "exercises", label: "Exercises", icon: PenLine, description: "Practice & submit", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "quizzes", label: "Quizzes", icon: GraduationCap, description: "Phase checkpoints", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "tools", label: "Tools", icon: Calculator, description: "Calculators & analyzer", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "reference", label: "Reference", icon: BookMarked, description: "Glossary, formulas, checklist", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "capstone", label: "Capstone", icon: Trophy, description: "Final project tracker", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "downloads", label: "Downloads", icon: Download, description: "Templates & cheat sheets", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Activity alerts & updates", roles: ["student", "instructor", "admin", "guest"], group: "main" },
  { id: "myprofile", label: "My Profile", icon: UserCircle, description: "Your progress & activity", roles: ["student"], group: "main" },
];

export function Sidebar({
  onNavigate,
  mobile = false,
  onClose,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const activeSection = pathToSection(pathname);
  const user = useAppStore((s) => s.user);
  const stats = useProgressStats();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = user?.role ?? "guest";
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));
  const mainItems = visibleItems.filter((item) => item.group === "main");
  const adminItems = visibleItems.filter((item) => item.group === "admin");

  const handleNav = (id: Section) => {
    onNavigate?.();
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
      ? "bg-stone-400"
      : "bg-orange-500";

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "instructor"
      ? "Instructor"
      : user?.role === "guest"
      ? "Guest"
      : "Student";

  const desktopCollapsed = collapsed && !mobile;

  return (
    <div className={clsx(styles.sidebar, desktopCollapsed ? styles.narrow : styles.wide)}>
      <div className={clsx(styles.brand, desktopCollapsed && styles.brandCentered)}>
        <div className={clsx(styles.brandLogo, styles.brandLogoLarge)}>
          <Flame className="h-[18px] w-[18px]" />
        </div>

        {(!collapsed || mobile) && (
          <div className={styles.brandText}>
            <h1 className={styles.brandName}>ProjectAmazonPH</h1>
            <p className={styles.brandTagline}>PPC Companion</p>
          </div>
        )}

        {mobile && onClose && (
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!mobile && (
        <div className={styles.collapseToggle}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.collapseBtn}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}

      <nav className={styles.nav}>
        {(!collapsed || mobile) && (
          <p className={styles.navLabel}>Overview</p>
        )}
        <div className={styles.navList}>
          {mainItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={() => handleNav(item.id)}
              stats={stats}
              collapsed={desktopCollapsed}
            />
          ))}
        </div>

        {adminItems.length > 0 && (
          <>
            {(!collapsed || mobile) && (
              <p className={styles.navLabel}>{userRole === "admin" ? "Administration" : "Teaching"}</p>
            )}
            {desktopCollapsed && <div className="mx-auto my-2 h-px w-5 bg-sidebar-border/60" />}
            <div className={styles.navList}>
              {adminItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => handleNav(item.id)}
                  stats={stats}
                  collapsed={desktopCollapsed}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {(userRole === "student" || userRole === "guest") &&
        (!collapsed || mobile) && (
          <div className={styles.progressSection}>
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>
                <CheckCircle2 className="h-3 w-3 text-blue-500/80" />
                Exercises
              </span>
              <span className={styles.progressValue}>{stats.exercisesAttempted}</span>
            </div>
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>
                <GraduationCap className="h-3 w-3 text-blue-500/80" />
                Quiz score
              </span>
              <span className={styles.progressValue}>{stats.totalCorrect}/{stats.totalQuestions || "—"}</span>
            </div>
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>
                <Trophy className="h-3 w-3 text-blue-500/80" />
                Capstone
              </span>
              <span className={styles.progressValue}>{stats.capstoneDone}/{stats.capstoneTotal}</span>
            </div>
          </div>
        )}

      {user && (
        <div className={clsx(styles.userSection, desktopCollapsed ? styles.userSectionCompact : styles.userSectionExpanded)}>
          {desktopCollapsed ? (
            <div className={clsx(styles.userAvatar, roleColor)}>
              {userInitials}
            </div>
          ) : (
            <div className={styles.userCard}>
              <div className={clsx(styles.userAvatar, roleColor)}>
                {userInitials}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
              <button
                onClick={() => {
                  useAppStore.getState().logout();
                }}
                className={styles.logoutBtn}
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {(!collapsed || mobile) && (
            <div className={styles.userStatus}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>{roleLabel} · v2026</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    <Link
      href={sectionToPath(item.id)}
      onClick={onClick}
      className={clsx(
        styles.navItem,
        collapsed ? styles.navItemCollapsed : styles.navItemExpanded,
        active && styles.navItemActive
      )}
    >
      {active && <span className={styles.activeIndicator} />}

      <span className={clsx(
        styles.navIconBox,
        collapsed ? styles.navIconBoxSm : styles.navIconBoxLg,
        active ? styles.navIconActive : styles.navIconInactive
      )}>
        <Icon className="h-4 w-4" />
      </span>

      {!collapsed && (
        <div className={styles.navText}>
          <div className={styles.navLabel}>{item.label}</div>
          {!active && (
            <div className={styles.navDesc}>{item.description}</div>
          )}
        </div>
      )}

      {!collapsed && item.id === "capstone" && stats.capstoneDone > 0 && (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-0 text-[10px] px-1.5 font-medium">
          {stats.capstoneDone}/5
        </Badge>
      )}
      {!collapsed && item.id === "quizzes" && stats.quizzesTaken > 0 && (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-0 text-[10px] px-1.5 font-medium">
          {stats.quizzesTaken}/4
        </Badge>
      )}
    </Link>
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
