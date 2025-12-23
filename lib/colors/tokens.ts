/**
 * Base color token definitions
 * These are the raw color values used across the app
 */

import type { ThemeColors } from "./types";

/**
 * Default theme colors (black/white based)
 * This matches the current app design
 */
export const defaultColors: ThemeColors = {
  // Semantic tokens
  background: {
    light: "#ffffff",
    dark: "#000000",
  },
  foreground: {
    light: "#0a0a0a",
    dark: "#fafafa",
  },
  primary: {
    light: "#171717",
    dark: "#fafafa",
  },
  primaryForeground: {
    light: "#fafafa",
    dark: "#171717",
  },
  secondary: {
    light: "#f5f5f5",
    dark: "#262626",
  },
  secondaryForeground: {
    light: "#171717",
    dark: "#fafafa",
  },
  muted: {
    light: "#f5f5f5",
    dark: "#262626",
  },
  mutedForeground: {
    light: "#737373",
    dark: "#a3a3a3",
  },
  accent: {
    light: "#f5f5f5",
    dark: "#262626",
  },
  accentForeground: {
    light: "#171717",
    dark: "#fafafa",
  },
  destructive: {
    light: "#ef4444",
    dark: "#dc2626",
  },
  border: {
    light: "#e5e5e5",
    dark: "#262626",
  },
  ring: {
    light: "#a1a1a1",
    dark: "#737373",
  },

  // Card tokens
  card: {
    background: {
      light: "#ffffff",
      dark: "#171717",
    },
    foreground: {
      light: "#0a0a0a",
      dark: "#fafafa",
    },
    border: {
      light: "rgba(0, 0, 0, 0.05)",
      dark: "rgba(255, 255, 255, 0.1)",
    },
  },

  // Input tokens
  input: {
    background: {
      light: "#ffffff",
      dark: "#171717",
    },
    border: {
      light: "rgba(0, 0, 0, 0.1)",
      dark: "rgba(255, 255, 255, 0.15)",
    },
    placeholder: {
      light: "#9ca3af",
      dark: "#9ca3af",
    },
  },

  // Chart colors
  chart: {
    blue: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
    green: {
      light: "#10b981",
      dark: "#34d399",
    },
    amber: {
      light: "#f59e0b",
      dark: "#fbbf24",
    },
    purple: {
      light: "#8b5cf6",
      dark: "#a78bfa",
    },
    red: {
      light: "#ef4444",
      dark: "#f87171",
    },
  },

  // Icon colors
  icon: {
    default: {
      light: "#000000",
      dark: "#ffffff",
    },
    muted: {
      light: "#6b7280",
      dark: "#9ca3af",
    },
    active: {
      light: "#000000",
      dark: "#ffffff",
    },
  },

  // Tab bar colors
  tab: {
    active: {
      light: "#000000",
      dark: "#ffffff",
    },
    inactive: {
      light: "rgba(0, 0, 0, 0.6)",
      dark: "rgba(255, 255, 255, 0.55)",
    },
    background: {
      light: "#ffffff",
      dark: "#171717",
    },
  },

  // FAB colors
  fab: {
    background: {
      light: "#0f172a",
      dark: "#f8fafc",
    },
    icon: {
      light: "#f8fafc",
      dark: "#0f172a",
    },
    border: {
      light: "rgba(255, 255, 255, 0.25)",
      dark: "rgba(0, 0, 0, 0.08)",
    },
  },
};
