// =============================================================
// Design System Tokens — Amazon PPC Training Platform
// =============================================================

export const tokens = {
  // ---- Color Palette ----
  color: {
    // Primary
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    // Accent — warm amber/orange (Amazon brand nod)
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Semantic
    success: { light: "#dcfce7", DEFAULT: "#22c55e", dark: "#15803d" },
    warning: { light: "#fef9c3", DEFAULT: "#eab308", dark: "#a16207" },
    error: { light: "#fee2e2", DEFAULT: "#ef4444", dark: "#b91c1c" },
    info: { light: "#dbeafe", DEFAULT: "#3b82f6", dark: "#1d4ed8" },
    // Phase colors
    phase: {
      1: { from: "#2563eb", to: "#1d4ed8", bg: "#eff6ff", text: "#1e40af" },
      2: { from: "#e11d48", to: "#be123c", bg: "#fff1f2", text: "#9f1239" },
      3: { from: "#059669", to: "#047857", bg: "#ecfdf5", text: "#065f46" },
      4: { from: "#7c3aed", to: "#6d28d9", bg: "#f5f3ff", text: "#5b21b6" },
    },
    // Neutral
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
  },

  // ---- Typography ----
  font: {
    sans: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    display: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  },
  size: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem",// 36px
    "5xl": "3rem",    // 48px
    "6xl": "3.75rem", // 60px
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  leading: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.65,
    loose: 2,
  },

  // ---- Spacing ----
  space: {
    0: "0",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },

  // ---- Border Radius ----
  radius: {
    sm: "0.375rem",   // 6px
    md: "0.5rem",     // 8px
    lg: "0.75rem",    // 12px
    xl: "1rem",       // 16px
    "2xl": "1.25rem", // 20px
    "3xl": "1.5rem",  // 24px
    full: "9999px",
  },

  // ---- Shadows ----
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glow: "0 0 20px 4px rgb(59 130 246 / 0.15)",
    "glow-accent": "0 0 20px 4px rgb(251 191 36 / 0.15)",
  },

  // ---- Transitions ----
  transition: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // ---- Z-Index ----
  z: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
  },
} as const;

// ---- Phase color helper ----
export function getPhaseColor(phase: number) {
  return tokens.color.phase[phase as keyof typeof tokens.color.phase] ?? tokens.color.phase[1];
}
