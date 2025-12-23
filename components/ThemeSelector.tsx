/**
 * Theme selector component for choosing app color themes
 */

import { Text } from "@/components/ui/text";
import {
  themePresetAccentColors,
  themePresetNames,
  useTheme,
  type ThemePreset,
} from "@/lib/colors";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";

const THEME_PRESETS: ThemePreset[] = [
  "default",
  "ocean",
  "forest",
  "sunset",
  "midnight",
];

interface ThemeSelectorProps {
  showLabel?: boolean;
}

export function ThemeSelector({ showLabel = true }: ThemeSelectorProps) {
  const {
    themePreset,
    setThemePreset,
    colorScheme,
    toggleColorScheme,
    colors,
  } = useTheme();

  return (
    <View className="gap-4">
      {/* Color scheme toggle */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.muted }}
          >
            <Feather
              name={colorScheme === "dark" ? "moon" : "sun"}
              size={20}
              color={colors.foreground}
            />
          </View>
          <View>
            <Text className="font-medium dark:text-white">Appearance</Text>
            <Text className="text-sm text-black/60 dark:text-white/60">
              {colorScheme === "dark" ? "Dark" : "Light"} mode
            </Text>
          </View>
        </View>
        <Pressable
          onPress={toggleColorScheme}
          className="h-10 px-4 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.muted }}
        >
          <Text className="text-sm font-medium dark:text-white">
            {colorScheme === "dark" ? "Light" : "Dark"}
          </Text>
        </Pressable>
      </View>

      {/* Theme preset selector */}
      {showLabel && (
        <Text className="text-sm font-medium text-black/60 dark:text-white/60">
          Theme Color
        </Text>
      )}
      <View className="flex-row flex-wrap gap-3">
        {THEME_PRESETS.map((preset) => {
          const isSelected = themePreset === preset;
          const accentColor = themePresetAccentColors[preset];

          return (
            <Pressable
              key={preset}
              onPress={() => setThemePreset(preset)}
              className="items-center gap-2"
            >
              <View
                className="h-14 w-14 rounded-2xl items-center justify-center border-2"
                style={{
                  backgroundColor: accentColor,
                  borderColor: isSelected ? colors.foreground : "transparent",
                }}
              >
                {isSelected && (
                  <Feather name="check" size={24} color="#ffffff" />
                )}
              </View>
              <Text
                className="text-xs"
                style={{
                  color: isSelected
                    ? colors.foreground
                    : colors.mutedForeground,
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                {themePresetNames[preset]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Compact theme selector showing only color swatches
 */
export function ThemeSwatchRow() {
  const { themePreset, setThemePreset, colors } = useTheme();

  return (
    <View className="flex-row gap-2">
      {THEME_PRESETS.map((preset) => {
        const isSelected = themePreset === preset;
        const accentColor = themePresetAccentColors[preset];

        return (
          <Pressable
            key={preset}
            onPress={() => setThemePreset(preset)}
            className="h-8 w-8 rounded-full items-center justify-center border-2"
            style={{
              backgroundColor: accentColor,
              borderColor: isSelected ? colors.foreground : "transparent",
            }}
          >
            {isSelected && <Feather name="check" size={14} color="#ffffff" />}
          </Pressable>
        );
      })}
    </View>
  );
}
