# Refactoring Plan: Centralized Theming & Clean Code

## 1. Overview

This plan outlines the steps to refactor the application's styling system. The primary goal is to **eliminate all hardcoded colors** and establish a robust **Single Source of Truth (SSOT)** for styling using CSS variables and NativeWind. This will enable easy switching between multiple themes (e.g., Light, Dark, Blue, Green) without modifying component code.

## 2. Architecture & Strategy

### 2.1. The "CSS Variables" Approach

We will use `global.css` as the single definition point for all colors. NativeWind maps Tailwind utility classes to these CSS variables. Changing the theme is as simple as applying a class (e.g., `.theme-blue`) to a parent container, which updates the variable values.

**Key Components:**

1.  **`global.css`**: The SSOT. Defines base variables (HSL) and overrides them inside theme classes.
2.  **`tailwind.config.js`**: Maps semantic names (e.g., `primary`, `destructive`) to these CSS variables.
3.  **`components/ThemeProvider.tsx`**: A Context Provider to manage and persist the user's active theme.

### 2.2. Semantic Naming Convention

We use semantic names describing the _purpose_ of the color.

| Semantic Name                            | Purpose                                  |
| :--------------------------------------- | :--------------------------------------- |
| `background` / `foreground`              | Page background and default text         |
| `card` / `card-foreground`               | Cards, modals, popovers                  |
| `primary` / `primary-foreground`         | Main actions (buttons, active tabs)      |
| `secondary` / `secondary-foreground`     | Secondary actions, less prominent UI     |
| `muted` / `muted-foreground`             | Subtitles, disabled states, placeholders |
| `destructive` / `destructive-foreground` | Error states, delete actions             |
| `accent` / `accent-foreground`           | Highlights, active list items            |
| `border`                                 | Borders, dividers                        |
| `input`                                  | Input fields background/border           |
| `ring`                                   | Focus rings                              |
| `chart-1` to `chart-5`                   | Data visualization colors                |

## 3. Implementation Steps

### Phase 1: Foundation (Global CSS)

1.  **Refactor `global.css`**:
    - Define a `:root` (Base/Light) and `.dark:root` (Dark) set of variables.
    - Create distinct CSS classes for new themes (e.g., `.theme-blue`, `.theme-green`, `.theme-orange`).
    - Each theme class will redefine the essential CSS variables (e.g., `--primary`, `--ring`).

    ```css
    @layer base {
      :root {
        --primary: 240 5.9% 10%;
        /* ... other base variables */
      }

      .dark:root {
        --primary: 0 0% 98%;
        /* ... other dark variables */
      }

      /* New Themes */
      .theme-blue {
        --primary: 221 83% 53%;
        --primary-foreground: 210 40% 98%;
      }

      .theme-green {
        --primary: 142 76% 36%;
        --primary-foreground: 355 100% 97%;
      }
    }
    ```

2.  **Verify `tailwind.config.js`**:
    - Ensure all semantic names map correctly to `hsl(var(--variable-name))`.

### Phase 2: Theme Management

1.  **Create `components/ThemeProvider.tsx`**:
    - **State**: Manage `themeColor` (e.g., 'blue', 'green', 'default') and `colorMode` (light/dark/system).
    - **Persistence**: Save user preference to `AsyncStorage`.
    - **Application**: Wrap the root layout (`app/_layout.tsx`) and apply the active theme class to the top-level View (e.g., `<View className="flex-1 theme-blue">`).

### Phase 3: Systematic Replacement (Cleanup)

Iterate through the codebase to replace all hardcoded hex values with semantic Tailwind classes.

**Target Files & Actions:**

1.  **`app/task/[id].tsx` & `create.tsx`**:
    - Replace `#ef4444` -> `text-destructive` / `border-destructive`.
    - Replace `placeholderTextColor="#9ca3af"` -> `placeholderClassName="text-muted-foreground"`.
    - Replace conditional logic for icon colors with standard `text-foreground` or `text-primary` classes.

2.  **`app/(tabs)/stats.tsx`**:
    - Replace hardcoded chart colors (e.g., `#3b82f6`) with `text-chart-1`, `text-chart-2`.
    - If the chart library requires raw hex strings, create a helper hook `useThemeColors()` that resolves the current Tailwind class values to hex strings.

3.  **`app/auth/*.tsx`**:
    - Standardize input borders, placeholders, and button colors using `border-input`, `text-muted-foreground`, and `bg-primary`.

4.  **`components/ui/*.tsx`**:
    - Audit UI components to ensure they strictly use CSS variables and no hardcoded fallbacks.

## 4. Guidelines

- **No Hex Codes**: Never write a hex code (e.g., `#000000`) in a component file.
- **Use Semantics**: Always use `bg-primary`, `text-muted`, etc., instead of specific color names like `bg-blue-500`.
- **New Colors**: If a new color is needed, define its semantic role in `global.css` and `tailwind.config.js` first.
