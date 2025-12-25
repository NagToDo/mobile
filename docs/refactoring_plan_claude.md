# Color System Refactoring Plan

## Overview

This document outlines a comprehensive plan to refactor hardcoded colors in the NagToDo codebase and introduce a multi-theme system beyond just light/dark mode.

---

## Current State Analysis

### Existing Infrastructure (Strengths)

The codebase has a solid foundation:

1. **HSL CSS Variables** (`global.css`) - Light/dark mode variables
2. **Tailwind Config** (`tailwind.config.js`) - References CSS variables
3. **Theme Constants** (`lib/theme.ts`) - TypeScript exports for React Navigation
4. **NativeWind** - Tailwind CSS for React Native with dark mode support

### Problems to Address

| Location                  | Issue                    | Example                                        |
| ------------------------- | ------------------------ | ---------------------------------------------- |
| `app/(tabs)/stats.tsx`    | Hardcoded chart colors   | `#3b82f6`, `#10b981`, `#f59e0b`, `#8b5cf6`     |
| `app/(tabs)/_layout.tsx`  | Inline rgba calculations | `rgba(255,255,255,0.55)`, `#f8fafc`, `#0f172a` |
| `components/TaskCard.tsx` | Scattered icon colors    | `#9ca3af`, `#6b7280`, `#b3b3b3`, `#525252`     |
| `app/user/index.tsx`      | Inline rgba backgrounds  | `rgba(255,255,255,0.06)`, `rgba(0,0,0,0.05)`   |
| `app/auth/*.tsx`          | Placeholder colors       | Hardcoded gray values                          |
| `app.json`                | Static splash colors     | `#E6F4FE`, `#ffffff`, `#000000`                |

### Unique Hardcoded Colors Found

```
# Chart/Status Colors
#3b82f6  - Blue (Total Tasks)
#10b981  - Green (Completed, Daily)
#f59e0b  - Amber (Pending, Once)
#8b5cf6  - Purple (Completion Rate, Monthly)

# UI Colors
#f8fafc  - Light Slate (FAB background light)
#0f172a  - Dark Slate (FAB background dark)
#9ca3af  - Gray 400 (Icons, placeholders)
#6b7280  - Gray 500 (Icons dark)
#b3b3b3  - Gray (Icons dark mode)
#525252  - Neutral 600 (Icons light mode)

# Opacity Patterns
rgba(255,255,255,0.55) - Inactive tab light
rgba(0,0,0,0.6)        - Inactive tab dark
rgba(0,0,0,0.08)       - FAB border light
rgba(255,255,255,0.25) - FAB border dark
```

---

## Goals

1. **Eliminate all hardcoded colors** - Every color should reference a theme token
2. **Introduce multiple themes** - Beyond light/dark, add accent color themes
3. **Type-safe theme system** - Full TypeScript support with autocomplete
4. **Runtime theme switching** - Users can change themes without restart
5. **Maintainability** - Single source of truth for all colors

---

## Proposed Architecture

### Theme Token Structure

```typescript
// lib/colors/tokens.ts
export const colorTokens = {
  // Semantic tokens (what the color means)
  background: { light: string, dark: string },
  foreground: { light: string, dark: string },
  primary: { light: string, dark: string },
  secondary: { light: string, dark: string },
  muted: { light: string, dark: string },
  accent: { light: string, dark: string },
  destructive: { light: string, dark: string },

  // Component tokens
  card: { background: {...}, foreground: {...}, border: {...} },
  input: { background: {...}, border: {...}, placeholder: {...} },
  button: { primary: {...}, secondary: {...}, ghost: {...} },

  // Data visualization tokens
  chart: {
    blue: { light: string, dark: string },
    green: { light: string, dark: string },
    amber: { light: string, dark: string },
    purple: { light: string, dark: string },
    red: { light: string, dark: string },
  },

  // Icon tokens
  icon: {
    default: { light: string, dark: string },
    muted: { light: string, dark: string },
    active: { light: string, dark: string },
  },

  // Navigation tokens
  tab: {
    active: { light: string, dark: string },
    inactive: { light: string, dark: string },
    background: { light: string, dark: string },
  },
  fab: {
    background: { light: string, dark: string },
    icon: { light: string, dark: string },
    border: { light: string, dark: string },
  },
};
```

### Theme Presets

```typescript
// lib/colors/themes.ts
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight';

export const themePresets: Record<ThemePreset, ThemeColors> = {
  default: {
    // Current black/white theme
    primary: { light: '#000000', dark: '#ffffff' },
    accent: { light: '#0f172a', dark: '#f8fafc' },
    ...
  },
  ocean: {
    // Blue-based theme
    primary: { light: '#0369a1', dark: '#38bdf8' },
    accent: { light: '#0ea5e9', dark: '#7dd3fc' },
    ...
  },
  forest: {
    // Green-based theme
    primary: { light: '#166534', dark: '#4ade80' },
    accent: { light: '#22c55e', dark: '#86efac' },
    ...
  },
  sunset: {
    // Orange/warm theme
    primary: { light: '#c2410c', dark: '#fb923c' },
    accent: { light: '#f97316', dark: '#fdba74' },
    ...
  },
  midnight: {
    // Purple/dark theme
    primary: { light: '#6b21a8', dark: '#c084fc' },
    accent: { light: '#a855f7', dark: '#d8b4fe' },
    ...
  },
};
```

### Theme Context

```typescript
// lib/colors/ThemeContext.tsx
interface ThemeContextValue {
  colorScheme: "light" | "dark";
  themePreset: ThemePreset;
  colors: ResolvedColors;
  setColorScheme: (scheme: "light" | "dark") => void;
  setThemePreset: (preset: ThemePreset) => void;
  toggleColorScheme: () => void;
}

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Persist to AsyncStorage
  // Merge preset with colorScheme
  // Provide resolved colors
};

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useTheme().colors;
```

### Hook for Component Colors

```typescript
// lib/colors/useColors.ts
export function useColors() {
  const { colors, colorScheme } = useTheme();

  return {
    // Direct color access
    ...colors,

    // Utility functions
    withOpacity: (color: string, opacity: number) => {...},

    // Resolved values for current scheme
    background: colors.background[colorScheme],
    foreground: colors.foreground[colorScheme],
    primary: colors.primary[colorScheme],
    // ... etc
  };
}
```

---

## File Structure

```
lib/
├── colors/
│   ├── index.ts              # Public exports
│   ├── tokens.ts             # Color token definitions
│   ├── themes.ts             # Theme presets
│   ├── ThemeContext.tsx      # React context provider
│   ├── useColors.ts          # Hook for accessing colors
│   ├── useThemeColors.ts     # Hook with resolved theme colors
│   └── types.ts              # TypeScript types
├── theme.ts                  # (Keep for React Navigation compatibility)
└── utils.ts                  # (unchanged)
```

---

## Implementation Phases

### Phase 1: Foundation

**Create the color system infrastructure**

1. Create `lib/colors/types.ts` with all TypeScript interfaces
2. Create `lib/colors/tokens.ts` with semantic color tokens
3. Create `lib/colors/themes.ts` with theme presets
4. Create `lib/colors/ThemeContext.tsx` with provider
5. Create `lib/colors/useColors.ts` hook
6. Create `lib/colors/index.ts` for exports

**Files to create:**

- `lib/colors/types.ts`
- `lib/colors/tokens.ts`
- `lib/colors/themes.ts`
- `lib/colors/ThemeContext.tsx`
- `lib/colors/useColors.ts`
- `lib/colors/index.ts`

### Phase 2: Integration

**Wire up the theme provider**

1. Wrap app in `ThemeProvider` in `app/_layout.tsx`
2. Connect to AsyncStorage for persistence
3. Sync with NativeWind's `useColorScheme`
4. Update `lib/theme.ts` to use new color system

**Files to modify:**

- `app/_layout.tsx`
- `lib/theme.ts`

### Phase 3: Component Migration

**Refactor components to use theme colors**

Priority order (by hardcoded color count):

1. `app/(tabs)/stats.tsx` - Chart colors (highest priority)
   - Replace `#3b82f6`, `#10b981`, `#f59e0b`, `#8b5cf6` with `colors.chart.*`

2. `app/(tabs)/_layout.tsx` - Tab bar colors
   - Replace inline rgba calculations with `colors.tab.*` and `colors.fab.*`

3. `components/TaskCard.tsx` - Icon colors
   - Replace `#9ca3af`, `#6b7280`, etc. with `colors.icon.*`

4. `app/user/index.tsx` - Background colors
   - Replace inline rgba with `colors.card.background`

5. `app/auth/index.tsx` & `app/auth/signup.tsx` - Placeholder colors
   - Replace hardcoded grays with `colors.input.placeholder`

6. UI Components (`components/ui/*`)
   - Audit and ensure all use Tailwind classes that reference CSS variables

**Files to modify:**

- `app/(tabs)/stats.tsx`
- `app/(tabs)/_layout.tsx`
- `components/TaskCard.tsx`
- `app/user/index.tsx`
- `app/auth/index.tsx`
- `app/auth/signup.tsx`
- `app/task/[id].tsx`
- `app/task/create.tsx`

### Phase 4: CSS Variables Update

**Sync global.css with new theme system**

1. Add new CSS variables for chart colors
2. Add variables for icon colors
3. Add variables for FAB/tab colors
4. Ensure all semantic tokens have CSS variable equivalents

**Files to modify:**

- `global.css`
- `tailwind.config.js`

### Phase 5: Theme Selector UI

**Add user-facing theme selection**

1. Create `ThemeSelector` component
2. Add to user settings screen (`app/user/index.tsx`)
3. Show color swatches for each preset
4. Persist selection to AsyncStorage

**Files to create/modify:**

- `components/ThemeSelector.tsx` (new)
- `app/user/index.tsx`

---

## Detailed Token Mapping

### Chart Colors

| Current Hardcoded | Token Name     | Usage                              |
| ----------------- | -------------- | ---------------------------------- |
| `#3b82f6`         | `chart.blue`   | Total Tasks, Weekly frequency      |
| `#10b981`         | `chart.green`  | Completed, Daily frequency         |
| `#f59e0b`         | `chart.amber`  | Pending, Once frequency            |
| `#8b5cf6`         | `chart.purple` | Completion Rate, Monthly frequency |

### Icon Colors

| Current Hardcoded     | Token Name     | Usage                   |
| --------------------- | -------------- | ----------------------- |
| `#9ca3af` / `#6b7280` | `icon.muted`   | Meta icons (light mode) |
| `#b3b3b3` / `#525252` | `icon.muted`   | Meta icons (dark mode)  |
| `#000` / `#fff`       | `icon.default` | Primary icons           |

### Tab/FAB Colors

| Current Hardcoded        | Token Name             | Usage                |
| ------------------------ | ---------------------- | -------------------- |
| `#f8fafc`                | `fab.background.light` | FAB background light |
| `#0f172a`                | `fab.background.dark`  | FAB background dark  |
| `rgba(255,255,255,0.55)` | `tab.inactive.light`   | Inactive tab light   |
| `rgba(0,0,0,0.6)`        | `tab.inactive.dark`    | Inactive tab dark    |

---

## Migration Example

### Before (stats.tsx)

```tsx
<StatCard icon="list" label="Total Tasks" value={12} color="#3b82f6" />
```

### After (stats.tsx)

```tsx
const { colors } = useColors();

<StatCard
  icon="list"
  label="Total Tasks"
  value={12}
  color={colors.chart.blue}
/>;
```

### Before (\_layout.tsx)

```tsx
const inactiveColor =
  colorScheme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.6)";
```

### After (\_layout.tsx)

```tsx
const { colors } = useColors();
const inactiveColor = colors.tab.inactive;
```

---

## Testing Strategy

1. **Visual regression testing** - Screenshot each screen before/after
2. **Theme switching** - Verify all colors update when theme changes
3. **Persistence** - Verify theme selection persists across app restarts
4. **Dark mode** - Verify dark mode still works correctly
5. **Accessibility** - Ensure contrast ratios meet WCAG guidelines

---

## Rollback Plan

If issues arise:

1. Theme context is additive - old code still works
2. Can revert to NativeWind's `useColorScheme` if needed
3. CSS variables remain unchanged initially

---

## Success Criteria

- [ ] Zero hardcoded color values in component files
- [ ] All colors reference theme tokens
- [ ] 5+ theme presets available to users
- [ ] Theme selection persists across sessions
- [ ] Dark/light mode works with all theme presets
- [ ] TypeScript autocomplete for all color tokens
- [ ] No visual regressions from current design

---

## Estimated Complexity

| Phase                        | Complexity | Risk   |
| ---------------------------- | ---------- | ------ |
| Phase 1: Foundation          | Medium     | Low    |
| Phase 2: Integration         | Medium     | Medium |
| Phase 3: Component Migration | High       | Medium |
| Phase 4: CSS Variables       | Low        | Low    |
| Phase 5: Theme Selector UI   | Medium     | Low    |

---

## Dependencies

- `@react-native-async-storage/async-storage` (likely already installed)
- No new dependencies required

---

## Future Enhancements

1. **Custom theme builder** - Let users create their own themes
2. **System accent color** - Match device accent color on supported platforms
3. **Scheduled themes** - Auto-switch themes based on time of day
4. **Per-task colors** - Allow task-specific accent colors
5. **Export/import themes** - Share custom themes between devices
