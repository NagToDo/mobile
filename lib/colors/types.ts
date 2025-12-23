/**
 * Color system type definitions
 */

export type ColorScheme = "light" | "dark";

export type ThemePreset =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight";

/** Light/Dark color pair */
export interface ColorPair {
  light: string;
  dark: string;
}

/** Chart color tokens */
export interface ChartColors {
  blue: ColorPair;
  green: ColorPair;
  amber: ColorPair;
  purple: ColorPair;
  red: ColorPair;
}

/** Icon color tokens */
export interface IconColors {
  default: ColorPair;
  muted: ColorPair;
  active: ColorPair;
}

/** Tab bar color tokens */
export interface TabColors {
  active: ColorPair;
  inactive: ColorPair;
  background: ColorPair;
}

/** Floating action button color tokens */
export interface FabColors {
  background: ColorPair;
  icon: ColorPair;
  border: ColorPair;
}

/** Input color tokens */
export interface InputColors {
  background: ColorPair;
  border: ColorPair;
  placeholder: ColorPair;
}

/** Card color tokens */
export interface CardColors {
  background: ColorPair;
  foreground: ColorPair;
  border: ColorPair;
}

/** Complete theme color tokens */
export interface ThemeColors {
  // Semantic tokens
  background: ColorPair;
  foreground: ColorPair;
  primary: ColorPair;
  primaryForeground: ColorPair;
  secondary: ColorPair;
  secondaryForeground: ColorPair;
  muted: ColorPair;
  mutedForeground: ColorPair;
  accent: ColorPair;
  accentForeground: ColorPair;
  destructive: ColorPair;
  border: ColorPair;
  ring: ColorPair;

  // Component tokens
  card: CardColors;
  input: InputColors;
  chart: ChartColors;
  icon: IconColors;
  tab: TabColors;
  fab: FabColors;
}

/** Resolved colors for current color scheme (no light/dark pairs) */
export interface ResolvedColors {
  // Semantic tokens
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  ring: string;

  // Component tokens
  card: {
    background: string;
    foreground: string;
    border: string;
  };
  input: {
    background: string;
    border: string;
    placeholder: string;
  };
  chart: {
    blue: string;
    green: string;
    amber: string;
    purple: string;
    red: string;
  };
  icon: {
    default: string;
    muted: string;
    active: string;
  };
  tab: {
    active: string;
    inactive: string;
    background: string;
  };
  fab: {
    background: string;
    icon: string;
    border: string;
  };
}

/** Theme context value */
export interface ThemeContextValue {
  colorScheme: ColorScheme;
  themePreset: ThemePreset;
  colors: ResolvedColors;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemePreset: (preset: ThemePreset) => void;
  toggleColorScheme: () => void;
}
