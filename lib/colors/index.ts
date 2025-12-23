/**
 * Color system public API
 *
 * This module provides a comprehensive theming system with:
 * - Multiple theme presets (default, ocean, forest, sunset, midnight)
 * - Light/dark mode support
 * - Semantic color tokens
 * - Component-specific color tokens
 * - Persistent theme selection
 */

// Context and provider
export { ThemeProvider, useColors, useTheme } from "./ThemeContext";

// Extended hook with utilities
export { useThemeColors } from "./useThemeColors";

// Theme presets and configuration
export {
  themePresetAccentColors,
  themePresetNames,
  themePresets,
} from "./themes";

// Raw color tokens
export { defaultColors } from "./tokens";

// Types
export type {
  CardColors,
  ChartColors,
  ColorPair,
  ColorScheme,
  FabColors,
  IconColors,
  InputColors,
  ResolvedColors,
  TabColors,
  ThemeColors,
  ThemeContextValue,
  ThemePreset,
} from "./types";
