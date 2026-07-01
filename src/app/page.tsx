"use client";

import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardSection } from "@/components/sections/dashboard";
import { CurriculumSection } from "@/components/sections/curriculum";
import { ExercisesSection } from "@/components/sections/exercises";
import { QuizzesSection } from "@/components/sections/quizzes";
import { ToolsSection } from "@/components/sections/tools";
import { ReferenceSection } from "@/components/sections/reference";
import { CapstoneSection } from "@/components/sections/capstone";
import { StudentsSection } from "@/components/sections/students";
import { LandingPage } from "@/components/sections/landing";
import { MyProfileSection } from "@/components/sections/my-profile";
import { MyStudentsSection } from "@/components/sections/my-students";
import { CohortsSection } from "@/components/sections/cohorts";
import { AuditLogSection } from "@/components/sections/audit";
import { DownloadsSection } from "@/components/sections/downloads";
import { AdminDashboardSection } from "@/components/sections/admin-dashboard";
import { NotificationCenterSection } from "@/components/sections/notification-center";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const activeSection = useAppStore((s) => s.activeSection);
  const user = useAppStore((s) => s.user);

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ErrorBoundary>
          <AppShell>
            {activeSection === "dashboard" && <DashboardSection />}
            {activeSection === "curriculum" && <CurriculumSection />}
            {activeSection === "exercises" && <ExercisesSection />}
            {activeSection === "quizzes" && <QuizzesSection />}
            {activeSection === "tools" && <ToolsSection />}
            {activeSection === "reference" && <ReferenceSection />}
            {activeSection === "capstone" && <CapstoneSection />}
            {activeSection === "students" && <StudentsSection />}
            {activeSection === "myprofile" && <MyProfileSection />}
            {activeSection === "mystudents" && <MyStudentsSection />}
            {activeSection === "cohorts" && <CohortsSection />}
            {activeSection === "audit" && <AuditLogSection />}
            {activeSection === "downloads" && <DownloadsSection />}
            {activeSection === "admin-dashboard" && <AdminDashboardSection />}
            {activeSection === "notifications" && <NotificationCenterSection />}
          </AppShell>
          </ErrorBoundary>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
