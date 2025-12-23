# Implementation Plan - Date Section & Calendar Modal

I will implement the Date section in `app/task/create.tsx` with a modal that includes a Frequency selector and a Calendar, using `react-native-calendars`.

## Dependencies

- Install `react-native-calendars` for the calendar component.

## User Interface Changes

### `app/task/create.tsx`

1.  **Imports**:
    - Import `Calendar` from `react-native-calendars`.
    - Import `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` from `@/components/ui/select`.

2.  **State Management**:
    - `dateModalVisible`: Boolean to control modal visibility.
    - `frequency`: String, defaults to "Single Day".
    - `selectedDate`: String (YYYY-MM-DD), to track calendar selection.

3.  **New "Date" Section**:
    - Add a View before the "Alarm" section.
    - Include a Label "Date".
    - Add a `Button` that displays the current selection (e.g., "Today", "Daily", or specific date) and opens the modal.

4.  **Date Modal Implementation**:
    - Create a `Modal` (similar to the existing Alarm modal).
    - **Frequency Selector**:
      - Label: "Frecuencia".
      - Use `Select` component.
      - Options:
        - "Repeat daily"
        - "Single Day" (Default)
        - "Every Week"
        - "Every Month"
    - **Calendar Section**:
      - Conditionally render based on `frequency`.
      - **Logic**: Show if `frequency !== 'Repeat daily'`. Hide if `frequency === 'Repeat daily'`.
      - Component: `<Calendar />` from `react-native-calendars`.
      - Handle `onDayPress` to update `selectedDate`.
    - **Time Section (Placeholder)**:
      - Label: "Hora".
      - A placeholder `View` or `Text` indicating "Time Picker Placeholder" (as requested).

## Implementation Details

- The Calendar will be hidden specifically when "Repeat daily" is selected.
- The default frequency will be set to "Single Day".
- The modal will match the design style of the existing Alarm modal.

## Verification

- Verify that the "Date" section appears.
- Verify that the modal opens.
- Verify that "Single Day" is selected by default and the Calendar is visible.
- Verify that selecting "Repeat daily" hides the Calendar.
- Verify that the Time placeholder is present.
