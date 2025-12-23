/**
 * Theme presets with different accent colors
 */

import type { ThemeColors, ThemePreset } from "./types";
import { defaultColors } from "./tokens";

/**
 * Ocean theme - Blue based
 */
const oceanColors: ThemeColors = {
  ...defaultColors,
  primary: {
    light: "#0369a1",
    dark: "#38bdf8",
  },
  primaryForeground: {
    light: "#ffffff",
    dark: "#0c4a6e",
  },
  accent: {
    light: "#e0f2fe",
    dark: "#0c4a6e",
  },
  accentForeground: {
    light: "#0369a1",
    dark: "#7dd3fc",
  },
  ring: {
    light: "#0ea5e9",
    dark: "#0284c7",
  },
  fab: {
    background: {
      light: "#0369a1",
      dark: "#38bdf8",
    },
    icon: {
      light: "#ffffff",
      dark: "#0c4a6e",
    },
    border: {
      light: "rgba(255, 255, 255, 0.3)",
      dark: "rgba(0, 0, 0, 0.1)",
    },
  },
  tab: {
    ...defaultColors.tab,
    active: {
      light: "#0369a1",
      dark: "#38bdf8",
    },
  },
};

/**
 * Forest theme - Green based
 */
const forestColors: ThemeColors = {
  ...defaultColors,
  primary: {
    light: "#166534",
    dark: "#4ade80",
  },
  primaryForeground: {
    light: "#ffffff",
    dark: "#14532d",
  },
  accent: {
    light: "#dcfce7",
    dark: "#14532d",
  },
  accentForeground: {
    light: "#166534",
    dark: "#86efac",
  },
  ring: {
    light: "#22c55e",
    dark: "#16a34a",
  },
  fab: {
    background: {
      light: "#166534",
      dark: "#4ade80",
    },
    icon: {
      light: "#ffffff",
      dark: "#14532d",
    },
    border: {
      light: "rgba(255, 255, 255, 0.3)",
      dark: "rgba(0, 0, 0, 0.1)",
    },
  },
  tab: {
    ...defaultColors.tab,
    active: {
      light: "#166534",
      dark: "#4ade80",
    },
  },
};

/**
 * Sunset theme - Orange/warm based
 */
const sunsetColors: ThemeColors = {
  ...defaultColors,
  primary: {
    light: "#c2410c",
    dark: "#fb923c",
  },
  primaryForeground: {
    light: "#ffffff",
    dark: "#7c2d12",
  },
  accent: {
    light: "#ffedd5",
    dark: "#7c2d12",
  },
  accentForeground: {
    light: "#c2410c",
    dark: "#fdba74",
  },
  ring: {
    light: "#f97316",
    dark: "#ea580c",
  },
  fab: {
    background: {
      light: "#c2410c",
      dark: "#fb923c",
    },
    icon: {
      light: "#ffffff",
      dark: "#7c2d12",
    },
    border: {
      light: "rgba(255, 255, 255, 0.3)",
      dark: "rgba(0, 0, 0, 0.1)",
    },
  },
  tab: {
    ...defaultColors.tab,
    active: {
      light: "#c2410c",
      dark: "#fb923c",
    },
  },
};

/**
 * Midnight theme - Purple based
 */
const midnightColors: ThemeColors = {
  ...defaultColors,
  primary: {
    light: "#6b21a8",
    dark: "#c084fc",
  },
  primaryForeground: {
    light: "#ffffff",
    dark: "#3b0764",
  },
  accent: {
    light: "#f3e8ff",
    dark: "#3b0764",
  },
  accentForeground: {
    light: "#6b21a8",
    dark: "#d8b4fe",
  },
  ring: {
    light: "#a855f7",
    dark: "#9333ea",
  },
  fab: {
    background: {
      light: "#6b21a8",
      dark: "#c084fc",
    },
    icon: {
      light: "#ffffff",
      dark: "#3b0764",
    },
    border: {
      light: "rgba(255, 255, 255, 0.3)",
      dark: "rgba(0, 0, 0, 0.1)",
    },
  },
  tab: {
    ...defaultColors.tab,
    active: {
      light: "#6b21a8",
      dark: "#c084fc",
    },
  },
};

/**
 * All available theme presets
 */
export const themePresets: Record<ThemePreset, ThemeColors> = {
  default: defaultColors,
  ocean: oceanColors,
  forest: forestColors,
  sunset: sunsetColors,
  midnight: midnightColors,
};

/**
 * Theme preset display names for UI
 */
export const themePresetNames: Record<ThemePreset, string> = {
  default: "Default",
  ocean: "Ocean",
  forest: "Forest",
  sunset: "Sunset",
  midnight: "Midnight",
};

/**
 * Theme preset accent colors for previews (light mode)
 */
export const themePresetAccentColors: Record<ThemePreset, string> = {
  default: "#000000",
  ocean: "#0369a1",
  forest: "#166534",
  sunset: "#c2410c",
  midnight: "#6b21a8",
};
