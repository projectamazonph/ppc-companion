"use client";

import { clsx } from "clsx";
import styles from "./page-header.module.css";

const badgeVariants: Record<string, string> = {
  default: styles.badgeDefault,
  accent: styles.badgeAccent,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  error: styles.badgeError,
};

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: { text: string; variant?: keyof typeof badgeVariants };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, children, className }: PageHeaderProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badge && (
            <span className={clsx(styles.badge, badgeVariants[badge.variant ?? "default"] || badgeVariants.default)}>
              {badge.text}
            </span>
          )}
        </div>
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
