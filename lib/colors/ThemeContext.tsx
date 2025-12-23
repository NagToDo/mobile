/**
 * Theme context provider for managing app-wide theming
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { themePresets } from "./themes";
import type {
  ColorScheme,
  ResolvedColors,
  ThemeColors,
  ThemeContextValue,
  ThemePreset,
} from "./types";

const THEME_PRESET_STORAGE_KEY = "@nagtodo/theme-preset";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Resolves theme colors based on the current color scheme
 */
function resolveColors(
  themeColors: ThemeColors,
  scheme: ColorScheme,
): ResolvedColors {
  return {
    background: themeColors.background[scheme],
    foreground: themeColors.foreground[scheme],
    primary: themeColors.primary[scheme],
    primaryForeground: themeColors.primaryForeground[scheme],
    secondary: themeColors.secondary[scheme],
    secondaryForeground: themeColors.secondaryForeground[scheme],
    muted: themeColors.muted[scheme],
    mutedForeground: themeColors.mutedForeground[scheme],
    accent: themeColors.accent[scheme],
    accentForeground: themeColors.accentForeground[scheme],
    destructive: themeColors.destructive[scheme],
    border: themeColors.border[scheme],
    ring: themeColors.ring[scheme],
    card: {
      background: themeColors.card.background[scheme],
      foreground: themeColors.card.foreground[scheme],
      border: themeColors.card.border[scheme],
    },
    input: {
      background: themeColors.input.background[scheme],
      border: themeColors.input.border[scheme],
      placeholder: themeColors.input.placeholder[scheme],
    },
    chart: {
      blue: themeColors.chart.blue[scheme],
      green: themeColors.chart.green[scheme],
      amber: themeColors.chart.amber[scheme],
      purple: themeColors.chart.purple[scheme],
      red: themeColors.chart.red[scheme],
    },
    icon: {
      default: themeColors.icon.default[scheme],
      muted: themeColors.icon.muted[scheme],
      active: themeColors.icon.active[scheme],
    },
    tab: {
      active: themeColors.tab.active[scheme],
      inactive: themeColors.tab.inactive[scheme],
      background: themeColors.tab.background[scheme],
    },
    fab: {
      background: themeColors.fab.background[scheme],
      icon: themeColors.fab.icon[scheme],
      border: themeColors.fab.border[scheme],
    },
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const { colorScheme: nativeWindScheme, setColorScheme: setNativeWindScheme } =
    useNativeWindColorScheme();

  const [themePreset, setThemePresetState] = useState<ThemePreset>("default");
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize color scheme
  const colorScheme: ColorScheme =
    nativeWindScheme === "dark" ? "dark" : "light";

  // Load persisted theme preset on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_PRESET_STORAGE_KEY)
      .then((stored) => {
        if (stored && stored in themePresets) {
          setThemePresetState(stored as ThemePreset);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // Set color scheme (syncs with NativeWind)
  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setNativeWindScheme(scheme);
    },
    [setNativeWindScheme],
  );

  // Toggle color scheme
  const toggleColorScheme = useCallback(() => {
    setNativeWindScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setNativeWindScheme]);

  // Set theme preset (persists to AsyncStorage)
  const setThemePreset = useCallback((preset: ThemePreset) => {
    setThemePresetState(preset);
    AsyncStorage.setItem(THEME_PRESET_STORAGE_KEY, preset).catch((err) => {
      console.warn("Failed to persist theme preset:", err);
    });
  }, []);

  // Resolve colors based on current scheme and preset
  const colors = useMemo(() => {
    const themeColors = themePresets[themePreset];
    return resolveColors(themeColors, colorScheme);
  }, [themePreset, colorScheme]);

  const value: ThemeContextValue = useMemo(
    () => ({
      colorScheme,
      themePreset,
      colors,
      setColorScheme,
      setThemePreset,
      toggleColorScheme,
    }),
    [
      colorScheme,
      themePreset,
      colors,
      setColorScheme,
      setThemePreset,
      toggleColorScheme,
    ],
  );

  // Don't render until we've loaded the persisted theme
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the full theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Hook to access resolved colors for the current theme
 */
export function useColors(): ResolvedColors {
  return useTheme().colors;
}
