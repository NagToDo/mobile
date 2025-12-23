# Color System Documentation

## Overview

The NagToDo app uses a comprehensive theming system that supports multiple color themes and light/dark modes. The system eliminates hardcoded colors and provides a type-safe, centralized way to manage colors throughout the application.

## Architecture

### Core Components

```
lib/colors/
├── index.ts              # Public API exports
├── types.ts              # TypeScript type definitions
├── tokens.ts             # Base color token values
├── themes.ts             # Theme preset definitions
├── ThemeContext.tsx      # React context provider
└── useThemeColors.ts     # Extended hook with utilities
```

### Theme Structure

Each theme consists of:

- **Semantic tokens** - Background, foreground, primary, secondary, etc.
- **Component tokens** - Card, input, chart, icon, tab, FAB colors
- **Light/dark pairs** - Every color has both light and dark mode values

## Usage

### Basic Usage

```tsx
import { useColors } from "@/lib/colors";

function MyComponent() {
  const colors = useColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Hello</Text>
    </View>
  );
}
```

### Extended Usage with Utilities

```tsx
import { useThemeColors } from "@/lib/colors";

function MyComponent() {
  const { colors, colorScheme, withOpacity, toggleColorScheme } =
    useThemeColors();

  return (
    <View style={{ backgroundColor: withOpacity(colors.muted, 0.3) }}>
      <Pressable onPress={toggleColorScheme}>
        <Text>Toggle {colorScheme === "dark" ? "Light" : "Dark"} Mode</Text>
      </Pressable>
    </View>
  );
}
```

### Accessing Theme Context

```tsx
import { useTheme } from "@/lib/colors";

function MyComponent() {
  const { themePreset, setThemePreset } = useTheme();

  return (
    <Pressable onPress={() => setThemePreset("ocean")}>
      <Text>Switch to Ocean Theme (current: {themePreset})</Text>
    </Pressable>
  );
}
```

## Available Hooks

### `useColors()`

Returns resolved colors for the current theme and color scheme.

```tsx
const colors = useColors();
// colors.background, colors.foreground, colors.primary, etc.
```

### `useTheme()`

Returns the full theme context including preset management.

```tsx
const {
  colorScheme, // 'light' | 'dark'
  themePreset, // 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight'
  colors, // Resolved colors
  setColorScheme, // (scheme: ColorScheme) => void
  setThemePreset, // (preset: ThemePreset) => void
  toggleColorScheme, // () => void
} = useTheme();
```

### `useThemeColors()`

Extended hook with utility functions.

```tsx
const {
  ...colors, // All resolved colors (destructured)
  colorScheme, // Current color scheme
  themePreset, // Current theme preset
  toggleColorScheme, // Toggle light/dark
  setThemePreset, // Set theme preset
  withOpacity, // (color: string, opacity: number) => string
  getColor, // Helper for nested color access
  isDark, // Boolean: colorScheme === 'dark'
} = useThemeColors();
```

## Color Token Categories

### Semantic Tokens

General-purpose colors that represent intent:

```tsx
colors.background; // Main background
colors.foreground; // Main text color
colors.primary; // Primary brand color
colors.primaryForeground;
colors.secondary; // Secondary elements
colors.secondaryForeground;
colors.muted; // Muted backgrounds
colors.mutedForeground; // Muted text
colors.accent; // Accent color
colors.accentForeground;
colors.destructive; // Error/delete actions
colors.border; // Border color
colors.ring; // Focus ring
```

### Component Tokens

#### Card Colors

```tsx
colors.card.background;
colors.card.foreground;
colors.card.border;
```

#### Input Colors

```tsx
colors.input.background;
colors.input.border;
colors.input.placeholder;
```

#### Chart Colors

Used for data visualization:

```tsx
colors.chart.blue; // Total tasks, weekly frequency
colors.chart.green; // Completed tasks, daily frequency
colors.chart.amber; // Pending tasks, once frequency
colors.chart.purple; // Completion rate, monthly frequency
colors.chart.red; // Error states
```

#### Icon Colors

```tsx
colors.icon.default; // Primary icons
colors.icon.muted; // Secondary/meta icons
colors.icon.active; // Active state icons
```

#### Tab Bar Colors

```tsx
colors.tab.active; // Active tab
colors.tab.inactive; // Inactive tab (with opacity)
colors.tab.background; // Tab bar background
```

#### FAB (Floating Action Button) Colors

```tsx
colors.fab.background; // FAB background
colors.fab.icon; // FAB icon color
colors.fab.border; // FAB border color
```

## Theme Presets

### Available Presets

| Preset     | Description            | Accent Color |
| ---------- | ---------------------- | ------------ |
| `default`  | Black/white minimalist | `#000000`    |
| `ocean`    | Blue ocean vibes       | `#0369a1`    |
| `forest`   | Green nature theme     | `#166534`    |
| `sunset`   | Orange/warm tones      | `#c2410c`    |
| `midnight` | Purple dark theme      | `#6b21a8`    |

### Preset Metadata

```tsx
import { themePresetNames, themePresetAccentColors } from "@/lib/colors";

// Display names
themePresetNames.ocean; // "Ocean"

// Preview colors
themePresetAccentColors.ocean; // "#0369a1"
```

## Creating Custom Themes

### 1. Define Theme Colors

In `lib/colors/themes.ts`:

```tsx
const customColors: ThemeColors = {
  ...defaultColors, // Inherit base colors
  primary: {
    light: "#your-light-color",
    dark: "#your-dark-color",
  },
  accent: {
    light: "#accent-light",
    dark: "#accent-dark",
  },
  // Override other tokens as needed
};
```

### 2. Register Theme Preset

Add to the `ThemePreset` type in `lib/colors/types.ts`:

```tsx
export type ThemePreset =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight"
  | "custom"; // Add your theme
```

### 3. Add to Preset Map

In `lib/colors/themes.ts`:

```tsx
export const themePresets: Record<ThemePreset, ThemeColors> = {
  // ... existing presets
  custom: customColors,
};

export const themePresetNames: Record<ThemePreset, string> = {
  // ... existing names
  custom: "Custom Theme",
};

export const themePresetAccentColors: Record<ThemePreset, string> = {
  // ... existing colors
  custom: "#your-accent-color",
};
```

## Utilities

### Color with Opacity

```tsx
const { withOpacity } = useThemeColors();

// Convert any color to rgba with opacity
const transparentBg = withOpacity("#3b82f6", 0.5);
// Returns: "rgba(59, 130, 246, 0.5)"

// Works with hex, rgb, and rgba formats
withOpacity("rgb(255, 0, 0)", 0.3);
withOpacity("rgba(0, 0, 0, 0.5)", 0.8);
```

### Nested Color Access

```tsx
const { getColor } = useThemeColors();

// Get chart color with opacity
const chartBlue = getColor("chart", "blue", 0.5);

// Get icon color
const iconMuted = getColor("icon", "muted");
```

## Integration with Tailwind CSS

### CSS Variables

The theme system integrates with Tailwind through CSS variables in `global.css`:

```css
:root {
  --chart-blue: 217 91% 60%;
  --icon-default: 0 0% 0%;
  --tab-active: 0 0% 0%;
  /* ... more variables */
}

.dark:root {
  --chart-blue: 213 94% 68%;
  --icon-default: 0 0% 100%;
  /* ... dark mode overrides */
}
```

### Tailwind Classes

Use theme colors in className:

```tsx
<View className="bg-background text-foreground">
  <Text className="text-chart-blue">Chart</Text>
  <Icon className="text-icon-muted" />
</View>
```

### Configuration

Extended colors in `tailwind.config.js`:

```js
colors: {
  chart: {
    blue: "hsl(var(--chart-blue))",
    green: "hsl(var(--chart-green))",
    // ...
  },
  icon: {
    DEFAULT: "hsl(var(--icon-default))",
    muted: "hsl(var(--icon-muted))",
  },
  // ...
}
```

## Theme Persistence

Themes are automatically persisted to AsyncStorage:

```tsx
// Theme preset is saved automatically
setThemePreset("ocean"); // Saved to @nagtodo/theme-preset

// On app restart, the theme is loaded from storage
// Loading happens in ThemeProvider before first render
```

### Storage Key

```tsx
const THEME_PRESET_STORAGE_KEY = "@nagtodo/theme-preset";
```

## Components

### ThemeSelector

Full theme selection UI with light/dark toggle:

```tsx
import { ThemeSelector } from "@/components/ThemeSelector";

<ThemeSelector showLabel={true} />;
```

### ThemeSwatchRow

Compact color swatch row:

```tsx
import { ThemeSwatchRow } from "@/components/ThemeSelector";

<ThemeSwatchRow />;
```

## Best Practices

### ✅ Do

```tsx
// Use theme colors from hooks
const colors = useColors();
<Icon color={colors.icon.default} />

// Use semantic token names
<View style={{ backgroundColor: colors.background }} />

// Combine with Tailwind classes
<View className="bg-card border border-border" />
```

### ❌ Don't

```tsx
// Don't hardcode colors
<Icon color="#000000" />

// Don't use inline ternaries for light/dark
<View style={{
  backgroundColor: colorScheme === 'dark' ? '#000' : '#fff'
}} />

// Don't mix approaches unnecessarily
// Pick either hook-based or Tailwind-based per component
```

## Migration Guide

### From Hardcoded Colors

**Before:**

```tsx
const iconColor = colorScheme === "dark" ? "#ffffff" : "#000000";
<Icon color={iconColor} />;
```

**After:**

```tsx
const colors = useColors();
<Icon color={colors.icon.default} />;
```

### From useColorScheme

**Before:**

```tsx
import { useColorScheme } from "nativewind";

const { colorScheme, setColorScheme } = useColorScheme();
const toggleTheme = () =>
  setColorScheme(colorScheme === "dark" ? "light" : "dark");
```

**After:**

```tsx
import { useThemeColors } from "@/lib/colors";

const { colorScheme, toggleColorScheme } = useThemeColors();
```

## Type Safety

All colors are fully typed:

```tsx
import type {
  ThemeColors,
  ResolvedColors,
  ColorPair,
  ThemePreset,
  ColorScheme,
} from "@/lib/colors";

// Type-safe theme preset
const preset: ThemePreset = "ocean"; // ✓
const invalid: ThemePreset = "blue"; // ✗ Type error

// Type-safe color access
const colors: ResolvedColors = useColors();
colors.chart.blue; // ✓ string
colors.chart.pink; // ✗ Type error
```

## Examples

### Chart with Theme Colors

```tsx
function StatCard({ icon, label, value }: StatCardProps) {
  const colors = useColors();

  return (
    <View className="bg-card rounded-2xl p-4 border border-card-border">
      <View style={{ backgroundColor: `${colors.chart.blue}20` }}>
        <Feather name={icon} size={20} color={colors.chart.blue} />
      </View>
      <Text className="text-2xl font-bold">{value}</Text>
      <Text className="text-muted-foreground">{label}</Text>
    </View>
  );
}
```

### Tab Bar with Theme Colors

```tsx
function CustomTabBar() {
  const colors = useColors();

  return (
    <View style={{ backgroundColor: colors.tab.background }}>
      <Pressable>
        <Icon
          name="home"
          color={isFocused ? colors.tab.active : colors.tab.inactive}
        />
      </Pressable>
    </View>
  );
}
```

### Settings with Theme Switcher

```tsx
function SettingsScreen() {
  return (
    <ScrollView>
      <View className="bg-card rounded-2xl p-5 border border-border">
        <Text className="text-lg font-semibold mb-4">Theme</Text>
        <ThemeSelector />
      </View>
    </ScrollView>
  );
}
```

## Troubleshooting

### Theme not persisting

Ensure ThemeProvider is at the root level:

```tsx
// app/_layout.tsx
<ThemeProvider>
  <Stack>{/* Your screens */}</Stack>
</ThemeProvider>
```

### Colors not updating

Make sure you're using the hooks, not importing static values:

```tsx
// ✗ Wrong - static value
import { defaultColors } from "@/lib/colors";

// ✓ Correct - reactive hook
import { useColors } from "@/lib/colors";
const colors = useColors();
```

### TypeScript errors

Ensure you're importing types correctly:

```tsx
import type { ThemePreset } from "@/lib/colors"; // Type import
import { useTheme } from "@/lib/colors"; // Value import
```

## Performance

- **Memoization**: Colors are memoized and only recompute when theme changes
- **Context optimization**: ThemeProvider uses useMemo for stable references
- **Persistence**: AsyncStorage operations are non-blocking
- **Re-renders**: Only components using the hooks re-render on theme changes

## Future Enhancements

Potential additions to the color system:

1. **Custom theme builder** - UI for users to create custom themes
2. **System accent color** - Match device accent color (iOS/Android)
3. **Scheduled themes** - Auto-switch based on time of day
4. **Per-task colors** - Task-specific accent colors
5. **Theme export/import** - Share themes between devices
6. **Gradient support** - Add gradient color pairs
7. **Accessibility presets** - High contrast themes
8. **Color blindness modes** - Specialized color palettes

## Resources

- [Color token definitions](../lib/colors/tokens.ts)
- [Theme presets](../lib/colors/themes.ts)
- [Type definitions](../lib/colors/types.ts)
- [Refactoring plan](./refactoring_plan_claude.md)
