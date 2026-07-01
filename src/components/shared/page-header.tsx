"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: { text: string; variant?: "default" | "accent" | "success" | "warning" | "error" };
  children?: React.ReactNode;
  className?: string;
}

const badgeVariantStyles = {
  default: "bg-primary-500/15 text-primary-700 dark:text-primary-300 border-primary-500/30",
  accent: "bg-accent-500/15 text-accent-700 dark:text-accent-300 border-accent-500/30",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  error: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

export function PageHeader({ title, description, badge, children, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
        {badge && (
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", badgeVariantStyles[badge.variant ?? "default"])}>
            {badge.text}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}
