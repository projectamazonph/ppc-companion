"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// =============================================================
// Brand Button — primary CTA
// =============================================================

const brandButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_2px_8px_rgb(62_82_114/0.08)] hover:brightness-[1.15] hover:shadow-[0_2px_8px_rgb(0_0_0/0.06),0_8px_24px_rgb(62_82_114/0.1)]",
        accent:
          "bg-foreground text-background shadow-tinted hover:brightness-[1.8]",
        success:
          "bg-emerald-600 text-white shadow-tinted hover:brightness-[1.15]",
        danger:
          "bg-rose-600 text-white shadow-tinted hover:brightness-[1.15]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/[0.03] active:bg-foreground/[0.06]",
        ghost:
          "bg-transparent text-foreground/70 hover:text-foreground hover:bg-foreground/[0.03]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BrandButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(brandButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
BrandButton.displayName = "BrandButton";

// =============================================================
// Glass Button — secondary CTA with glassmorphism
// =============================================================

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] border",
  {
    variants: {
      variant: {
        default:
          "glass-strong border-white/40 dark:border-white/10 text-foreground hover:bg-white/80 dark:hover:bg-white/10",
        subtle:
          "bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { BrandButton, GlassButton, brandButtonVariants, glassButtonVariants };


// =============================================================
// Premium Arrow Button — Nested CTA with button-in-button icon
// =============================================================

export function PremiumArrowButton({
  children,
  onClick,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "glass" | "outline";
}) {
  const base =
    variant === "primary"
      ? "bg-foreground text-background hover:opacity-90"
      : variant === "glass"
      ? "bg-white/10 text-foreground backdrop-blur-xl border border-white/10 hover:bg-white/15"
      : "bg-transparent text-foreground border border-border hover:bg-accent/50";

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${base} ${className ?? ""}`}
    >
      <span>{children}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}
