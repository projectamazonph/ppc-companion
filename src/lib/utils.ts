import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract up to 2 uppercase initials from a person's display name.
 * Handles multi-word names, extra whitespace, and missing input.
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Normalize a quiz/exercise answer for free-text comparison:
 * lowercase, strip non-numeric/punctuation, keep digits, dot, and percent.
 */
export function normalizeAnswer(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^0-9.%]/g, "");
}
