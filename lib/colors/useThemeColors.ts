/**
 * Hook for accessing theme colors with utility functions
 */

import { useCallback, useMemo } from "react";
import { useTheme } from "./ThemeContext";

/**
 * Parse a color string and return opacity-modified version
 */
function withOpacity(color: string, opacity: number): string {
  // Handle rgba format
  if (color.startsWith("rgba")) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
  }

  // Handle rgb format
  if (color.startsWith("rgb(")) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
  }

  // Handle hex format
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Fallback: return original color
  return color;
}

/**
 * Extended hook for theme colors with utility functions
 */
export function useThemeColors() {
  const {
    colors,
    colorScheme,
    themePreset,
    toggleColorScheme,
    setThemePreset,
  } = useTheme();

  /**
   * Apply opacity to a color
   */
  const colorWithOpacity = useCallback(
    (color: string, opacity: number) => withOpacity(color, opacity),
    [],
  );

  /**
   * Get color with opacity based on theme token
   */
  const getColor = useCallback(
    (
      category: "chart" | "icon" | "tab" | "fab" | "card" | "input",
      key: string,
      opacity?: number,
    ): string => {
      const categoryColors = colors[category] as Record<string, string>;
      const color = categoryColors[key] ?? colors.foreground;

      if (opacity !== undefined) {
        return withOpacity(color, opacity);
      }
      return color;
    },
    [colors],
  );

  return useMemo(
    () => ({
      ...colors,
      colorScheme,
      themePreset,
      toggleColorScheme,
      setThemePreset,
      withOpacity: colorWithOpacity,
      getColor,
      isDark: colorScheme === "dark",
    }),
    [
      colors,
      colorScheme,
      themePreset,
      toggleColorScheme,
      setThemePreset,
      colorWithOpacity,
      getColor,
    ],
  );
}
