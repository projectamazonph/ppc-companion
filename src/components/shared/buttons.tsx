"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { CircleNotch as Loader2 } from "@phosphor-icons/react";
import styles from "./buttons.module.css";

const brandVariantClasses: Record<string, string> = {
  default: styles.brandDefault,
  accent: styles.brandAccent,
  success: styles.brandSuccess,
  danger: styles.brandDanger,
  outline: styles.brandOutline,
  ghost: styles.brandGhost,
};

const brandSizeClasses: Record<string, string> = {
  sm: styles.sizeSm,
  default: styles.sizeDefault,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  icon: styles.sizeIcon,
};

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  variant?: keyof typeof brandVariantClasses;
  size?: keyof typeof brandSizeClasses;
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={clsx(
          styles.base,
          brandVariantClasses[variant] || brandVariantClasses.default,
          brandSizeClasses[size] || brandSizeClasses.default,
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className={clsx("h-4 w-4", styles.spinner)} />}
        {children}
      </Comp>
    );
  }
);
BrandButton.displayName = "BrandButton";

const glassVariantClasses: Record<string, string> = {
  default: styles.glassDefault,
  subtle: styles.glassSubtle,
};

const glassSizeClasses: Record<string, string> = {
  sm: styles.glassSizeSm,
  default: styles.glassSizeDefault,
  lg: styles.glassSizeLg,
  xl: styles.glassSizeXl,
};

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: keyof typeof glassVariantClasses;
  size?: keyof typeof glassSizeClasses;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={clsx(
          styles.glassBase,
          glassVariantClasses[variant] || glassVariantClasses.default,
          glassSizeClasses[size] || glassSizeClasses.default,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { BrandButton, GlassButton };

const premiumVariantClasses: Record<string, string> = {
  primary: styles.premiumPrimary,
  glass: styles.premiumGlass,
  outline: styles.premiumOutline,
};

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
  return (
    <button
      onClick={onClick}
      className={clsx(
        styles.premiumBase,
        premiumVariantClasses[variant] || premiumVariantClasses.primary,
        className
      )}
    >
      <span>{children}</span>
      <span className={styles.premiumArrowBox}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={styles.premiumArrowIcon}>
          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </button>
  );
}
