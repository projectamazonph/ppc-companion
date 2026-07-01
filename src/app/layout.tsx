import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Amazon PPC Manager · Companion",
  description: "Companion platform for the Amazon PPC Manager program — curriculum, exercises, quizzes, tools, cohort management, and progress tracking.",
  keywords: ["Amazon PPC", "PPC Training", "Amazon Ads", "Companion", "Student Workbook"],
  authors: [{ name: "Amazon PPC Manager" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PPC Companion",
  },
  openGraph: {
    title: "Amazon PPC Manager · Companion",
    description: "Everything a student needs to master Amazon PPC — 4 phases, 10 modules, interactive exercises, auto-graded quizzes, calculators, and a capstone tracker.",
    siteName: "PPC Companion",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <div className="grain-overlay" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
