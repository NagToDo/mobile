# Notification System Refactor Plan

## Executive Summary

This document outlines the plan to refactor and fix the notification system in the NagToDo app. The primary goals are:

1. Fix broken notification scheduling for weekly/monthly frequencies
2. Implement the "nagging" feature (send 3 notifications per task at user-specified intervals)
3. Enhance notification feedback with proper vibration and sound
4. Fix existing bugs and improve error handling

---

## Current State Analysis

### What's Working

- Single-day notifications schedule and fire correctly
- Daily notifications reschedule automatically for the next day
- Permission requests work on Android
- Basic vibration pattern configured: `[0, 250, 250, 250]`
- Sound enabled via `shouldPlaySound: true`
- Notifications can be cancelled when tasks are updated/deleted

### What's Broken

#### 1. Weekly/Monthly Notifications Don't Reschedule

**Location:** `services/notification/ExpoNotificationService.ts:117`
**Issue:** Only daily frequencies trigger auto-rescheduling in `handleNotificationReceived()`
**Impact:** Weekly and monthly notifications fire once and never repeat

#### 2. Database Field Typo

**Location:** Multiple files (api/tasks.ts, all screens)
**Issue:** Field is spelled `frecuency` instead of `frequency` throughout the database schema
**Impact:** Confusing for developers, harder to maintain

#### 3. No Error Feedback for Permission Denial

**Location:** `app/task/create.tsx:302` and `app/task/[id].tsx:229`
**Issue:** If permissions are denied, notification silently fails to schedule
**Impact:** User doesn't know why notifications aren't working

#### 4. Past Dates Silently Fail

**Location:** `services/notification/ExpoNotificationService.ts:168-170`
**Issue:** Single-frequency tasks with past alarm times return without error
**Impact:** No user feedback that the notification won't fire

#### 5. Alarm Interval Field Not Used

**Location:** Throughout notification scheduling
**Issue:** Tasks have an `alarm_interval` field (1-5 minutes) that isn't actually used for scheduling
**Impact:** Prevents implementation of the nagging feature

#### 6. Memory Leaks

**Location:** `services/notification/ExpoNotificationService.ts:114`
**Issue:** Notification subscription never unsubscribed
**Impact:** Potential memory leaks if service recreated

---

## Proposed Changes

### Phase 1: Implement Nagging Feature (Core Feature)

#### 1.1 Update Notification Data Structure

**File:** `services/notification/types.ts`

Add support for tracking which "nag" in the sequence a notification represents:

```typescript
interface NotificationData {
  taskId: string;
  frequency: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
  alarm_interval: number; // Add this
  nag_number: number; // 1, 2, or 3 (which nag this is)
}
```

#### 1.2 Modify Scheduling Logic

**File:** `services/notification/ExpoNotificationService.ts`

**Current behavior:** Schedule 1 notification per task
**New behavior:** Schedule 3 notifications per task

**Implementation approach:**

```typescript
scheduleNotification(task: Task): Promise<string[]> {
  // Instead of scheduling 1 notification, schedule 3:
  // 1. First notification at exact alarm_time
  // 2. Second notification at alarm_time + alarm_interval minutes
  // 3. Third notification at alarm_time + (alarm_interval * 2) minutes

  // Return array of 3 notification IDs
  return [id1, id2, id3];
}
```

**Example:**

- Task alarm time: 9:00 AM
- Alarm interval: 5 minutes
- Notifications scheduled:
  - 9:00 AM (Nag 1)
  - 9:05 AM (Nag 2)
  - 9:10 AM (Nag 3)

#### 1.3 Update Notification Content

**Enhancement:** Differentiate the 3 nags in the notification text

**Option A (Subtle):**

- Nag 1: "Time for your task!"
- Nag 2: "Reminder: [task name]"
- Nag 3: "Final reminder: [task name]"

**Option B (Aggressive):**

- Nag 1: "[task name]"
- Nag 2: "[task name] - Don't forget!"
- Nag 3: "[task name] - Last reminder!"

#### 1.4 Handle Rescheduling for Daily/Weekly/Monthly

**File:** `services/notification/ExpoNotificationService.ts:handleNotificationReceived()`

**Current issue:** Only reschedules if frequency is "daily"
**Fix:** Reschedule all 3 nags for weekly/monthly frequencies too

**Logic:**

```typescript
if (data?.nag_number === 3) {
  // Only reschedule after the 3rd nag
  if (frequency === "daily") {
    // Schedule 3 nags for tomorrow
  } else if (frequency === "weekly") {
    // Schedule 3 nags for next week
  } else if (frequency === "monthly") {
    // Schedule 3 nags for next month
  }
}
```

#### 1.5 Update Cancellation Logic

**Files:** All files that call `cancelNotification()`

**Current behavior:** Cancel 1 notification
**New behavior:** Cancel 3 notifications (all nags)

**Implementation:**

```typescript
cancelNotification(taskId: string): Promise<void> {
  // Cancel all 3 identifiers:
  // - task-${taskId}-nag1
  // - task-${taskId}-nag2
  // - task-${taskId}-nag3
}
```

---

### Phase 2: Fix Broken Weekly/Monthly Notifications

#### 2.1 Add Weekly Rescheduling Logic

**File:** `services/notification/ExpoNotificationService.ts`

**Current:** No logic exists
**Add:**

```typescript
private getNextWeeklyTrigger(hour: number, minute: number): Date {
  const now = new Date();
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + 7);  // Add 7 days
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate;
}
```

#### 2.2 Add Monthly Rescheduling Logic

**File:** `services/notification/ExpoNotificationService.ts`

**Add:**

```typescript
private getNextMonthlyTrigger(hour: number, minute: number): Date {
  const now = new Date();
  const nextDate = new Date(now);
  nextDate.setMonth(nextDate.getMonth() + 1);  // Add 1 month
  nextDate.setHours(hour, minute, 0, 0);

  // Handle month overflow (e.g., Jan 31 -> Mar 3)
  // Solution: Cap at last day of target month
  const targetMonth = nextDate.getMonth();
  while (nextDate.getMonth() !== targetMonth) {
    nextDate.setDate(nextDate.getDate() - 1);
  }

  return nextDate;
}
```

#### 2.3 Update Notification Received Handler

**File:** `services/notification/ExpoNotificationService.ts:117`

**Current:** Only handles "daily"
**Update:**

```typescript
const handleNotificationReceived = (notification) => {
  const { frequency, hour, minute, taskId, nag_number } =
    notification.request.content.data;

  // Only reschedule after the 3rd nag fires
  if (nag_number !== 3) return;

  if (frequency === "daily") {
    // Schedule 3 nags for tomorrow
  } else if (frequency === "weekly") {
    // Schedule 3 nags for next week
  } else if (frequency === "monthly") {
    // Schedule 3 nags for next month
  }
};
```

---

### Phase 3: Enhance Vibration and Sound

#### 3.1 Current Configuration Audit

**Current vibration:** `[0, 250, 250, 250]`

- 0ms initial delay
- 250ms vibrate, 250ms pause, 250ms vibrate
- **Duration:** ~750ms total

**Current sound:** System default (no custom sound)

- `shouldPlaySound: true` in handler
- `sounds: []` in app.json

#### 3.2 Proposed Enhancements

**Option A (Minimal Change):**
Keep current settings, ensure they work across all 3 nags

**Option B (Enhanced Vibration):**

```typescript
// Longer, more attention-grabbing pattern
vibrationPattern: [0, 500, 300, 500, 300, 500];
// 0ms delay, then 500ms vibrate, 300ms pause, repeated 3 times
// Total: ~2.1 seconds
```

**Option C (Progressive Intensity):**

```typescript
// Nag 1: Gentle
vibrationPattern: [0, 250, 250, 250];

// Nag 2: Medium
vibrationPattern: [0, 400, 200, 400, 200, 400];

// Nag 3: Aggressive
vibrationPattern: [0, 600, 150, 600, 150, 600];
```

#### 3.3 Custom Sound Implementation (Optional)

**Current:** No custom sounds
**Enhancement:** Add custom notification sound

**Steps:**

1. Add sound file to assets (e.g., `assets/sounds/nag_notification.mp3`)
2. Update `app.json`:
   ```json
   "sounds": ["./assets/sounds/nag_notification.mp3"]
   ```
3. Update notification content:
   ```typescript
   content: {
     title: task.name,
     body: task.description,
     sound: 'nag_notification.mp3',  // Add this
     data: notificationData,
   }
   ```

**Sound Selection Criteria:**

- Short (1-2 seconds)
- Pleasant but attention-getting
- Not annoying (user will hear it 3 times)
- Distinct from default system sounds

#### 3.4 iOS Critical Alerts (Future Enhancement)

**Note:** Requires special Apple entitlement
**Benefit:** Notification sounds even if phone is in silent mode
**Reference:** https://docs.expo.dev/versions/latest/sdk/notifications/#ios-critical-alerts

---

### Phase 4: Fix Existing Bugs

#### 4.1 Fix Database Field Typo (Optional but Recommended)

**Issue:** `frecuency` → `frequency`
**Impact:** Large refactor across entire codebase

**Decision needed:**

- **Option A:** Fix now (breaking change, requires database migration)
- **Option B:** Keep `frecuency` for consistency, add comment explaining typo
- **Option C:** Alias both spellings in TypeScript types

**Recommendation:** Option B (keep existing spelling to avoid breaking changes)

#### 4.2 Add Permission Denial Feedback

**Files:** `app/task/create.tsx:302`, `app/task/[id].tsx:229`

**Current:**

```typescript
const hasPermission = await notificationService.requestPermissions();
if (hasPermission) {
  await notificationService.scheduleNotification(newTask);
}
```

**Enhanced:**

```typescript
const hasPermission = await notificationService.requestPermissions();
if (hasPermission) {
  await notificationService.scheduleNotification(newTask);
} else {
  Alert.alert(
    "Notification Permission Denied",
    "Please enable notifications in your device settings to receive task reminders.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
  );
}
```

#### 4.3 Add Past Date Validation

**File:** `services/notification/ExpoNotificationService.ts:168`

**Current:** Silently returns task ID
**Enhanced:**

```typescript
if (alarmDate <= now && task.frecuency === "single") {
  // Log warning or throw error
  console.warn(
    `Cannot schedule notification for past date: ${task.alarm_time}`,
  );
  // Optionally throw error to surface to UI
  throw new Error("Cannot schedule notification for a past date");
}
```

**UI Side:** Catch error and show alert to user

#### 4.4 Fix Memory Leak

**File:** `services/notification/ExpoNotificationService.ts:114`

**Current:**

```typescript
initialize() {
  // ...
  Notifications.addNotificationReceivedListener(handleNotificationReceived);
}
```

**Enhanced:**

```typescript
class ExpoNotificationService {
  private subscription: Subscription | null = null;

  initialize() {
    // ...
    this.subscription = Notifications.addNotificationReceivedListener(
      handleNotificationReceived,
    );
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }
}
```

**Note:** Call `cleanup()` when app unmounts (if ever needed)

#### 4.5 Improve Type Safety

**File:** `services/notification/types.ts`

**Current:**

```typescript
interface NotificationData {
  [key: string]: unknown;
}
```

**Enhanced:**

```typescript
interface NotificationData {
  taskId: string;
  frequency: "daily" | "single" | "weekly" | "monthly";
  hour: number;
  minute: number;
  title: string;
  body: string;
  alarm_interval: number;
  nag_number: 1 | 2 | 3;
}
```

---

### Phase 5: Testing & Validation

#### 5.1 Manual Testing Checklist

**Nagging Feature:**

- [ ] Create task with 1-minute interval, verify 3 notifications arrive
- [ ] Create task with 5-minute interval, verify proper spacing
- [ ] Verify notification content differs for each nag
- [ ] Verify all 3 nags vibrate/sound

**Frequency Types:**

- [ ] Single: Verify 3 nags fire once at correct time
- [ ] Daily: Verify 3 nags fire daily at correct time
- [ ] Weekly: Verify 3 nags fire weekly at correct time
- [ ] Monthly: Verify 3 nags fire monthly at correct time

**Edge Cases:**

- [ ] Update task: Verify old nags cancelled, new nags scheduled
- [ ] Delete task: Verify all 3 nags cancelled
- [ ] Past date: Verify error shown to user
- [ ] Permission denied: Verify alert shown with settings link

**Vibration/Sound:**

- [ ] Verify vibration works on all 3 nags
- [ ] Verify sound plays on all 3 nags
- [ ] Test on silent mode (should still vibrate)
- [ ] Test on Do Not Disturb mode

#### 5.2 Automated Testing (Future)

**Unit Tests:**

- Test `getNextTriggerDate()` for all frequency types
- Test `getNextWeeklyTrigger()` edge cases
- Test `getNextMonthlyTrigger()` month overflow
- Test notification ID generation for 3 nags
- Test cancellation logic for 3 nags

**Integration Tests:**

- Test full scheduling flow
- Test rescheduling flow after notification fires
- Test cancellation flow

---

## Implementation Order

### Priority 1: Core Nagging Feature

1. Update notification data structure
2. Modify scheduling to create 3 notifications
3. Update cancellation logic
4. Update rescheduling logic for all frequencies
5. Test thoroughly

**Estimated Complexity:** Medium-High
**Files Modified:** 3-4 files
**Risk:** Medium (core feature, many edge cases)

### Priority 2: Fix Weekly/Monthly Rescheduling

1. Implement `getNextWeeklyTrigger()`
2. Implement `getNextMonthlyTrigger()`
3. Update `handleNotificationReceived()`
4. Test edge cases (month boundaries, etc.)

**Estimated Complexity:** Medium
**Files Modified:** 1 file
**Risk:** Low (isolated change)

### Priority 3: Enhance Vibration/Sound

1. Decide on vibration pattern (Options A/B/C)
2. Update channel configuration
3. (Optional) Add custom sound file
4. Test on physical device

**Estimated Complexity:** Low
**Files Modified:** 1-2 files
**Risk:** Very Low (cosmetic change)

### Priority 4: Fix Bugs

1. Add permission denial feedback
2. Add past date validation
3. Fix memory leak
4. Improve type safety
5. (Optional) Fix database typo

**Estimated Complexity:** Low-Medium
**Files Modified:** 4-5 files
**Risk:** Low (mostly error handling)

---

## Files to Modify

### Core Changes

1. `services/notification/ExpoNotificationService.ts` (main logic)
2. `services/notification/types.ts` (type definitions)
3. `app/task/create.tsx` (error handling)
4. `app/task/[id].tsx` (error handling)

### Testing Changes

5. Manual testing on physical device
6. (Optional) Add unit tests

### Configuration Changes

7. `app.json` (if adding custom sounds)

---

## Risks & Mitigation

### Risk 1: Notification Limit

**Issue:** iOS/Android may have limits on scheduled notifications
**Impact:** If user creates many tasks, some nags may not schedule
**Mitigation:**

- Expo allows 64 scheduled notifications on iOS
- With 3 nags per task, max 21 tasks
- Add validation to warn user if approaching limit

### Risk 2: Battery Drain

**Issue:** 3x more notifications = more wake-ups
**Impact:** Potential battery impact
**Mitigation:**

- Use exact alarm intervals (not "approximately")
- Document this as intended behavior
- Consider adding user setting to enable/disable nagging

### Risk 3: User Annoyance

**Issue:** 3 notifications might be too aggressive
**Impact:** Users might disable notifications entirely
**Mitigation:**

- Make nag count configurable (1, 2, or 3)
- Add clear UI explanation of nagging feature
- Consider snooze functionality

### Risk 4: Timezone Issues

**Issue:** Notifications scheduled in one timezone fire incorrectly in another
**Impact:** User travels, notifications fire at wrong time
**Mitigation:**

- Already using local time via Date objects
- Test timezone changes
- Document expected behavior

---

## Alternative Approaches Considered

### Alternative 1: Single Notification with Repeated Actions

**Approach:** Schedule 1 notification, programmatically trigger 2 more
**Pros:** Simpler scheduling logic
**Cons:** Requires foreground service, doesn't work if app killed
**Decision:** Rejected (reliability issues)

### Alternative 2: Use Alarm Manager (Android) / Local Notifications (iOS)

**Approach:** Use native alarm APIs directly
**Pros:** More control, guaranteed delivery
**Cons:** Requires native code, breaks Expo managed workflow
**Decision:** Rejected (want to stay in Expo)

### Alternative 3: Server-Side Notifications (Push)

**Approach:** Send push notifications from backend
**Pros:** More reliable, works if app uninstalled
**Cons:** Requires backend, internet connection, more complex
**Decision:** Rejected (app is local-first, per docs/local_first.md)

---

## Success Criteria

### Must Have

- [ ] Each task triggers 3 notifications at specified intervals
- [ ] Weekly notifications reschedule correctly
- [ ] Monthly notifications reschedule correctly
- [ ] Vibration works on all 3 nags
- [ ] Sound plays on all 3 nags
- [ ] Permission denial shows error message
- [ ] Task update cancels old nags and schedules new ones
- [ ] Task deletion cancels all 3 nags

### Should Have

- [ ] Different notification text for each nag
- [ ] Past date validation with user feedback
- [ ] Memory leak fixed
- [ ] Type safety improved

### Nice to Have

- [ ] Custom notification sound
- [ ] Progressive vibration intensity
- [ ] User-configurable nag count (1-3)
- [ ] Snooze functionality

---

## Open Questions

1. **Vibration Pattern:** Which option (A, B, or C)?
2. **Custom Sound:** Should we add a custom sound file?
3. **Notification Text:** Which wording style (subtle vs aggressive)?
4. **Database Typo:** Fix `frecuency` or keep for compatibility?
5. **Nag Count:** Hardcode 3 or make configurable?
6. **Notification Limit:** Should we enforce max task count?

---

## References

- Expo Notifications Docs: https://docs.expo.dev/versions/latest/sdk/notifications/
- React Native Vibration API: https://reactnative.dev/docs/vibration
- Android Notification Channels: https://developer.android.com/develop/ui/views/notifications/channels
- iOS Critical Alerts: https://docs.expo.dev/versions/latest/sdk/notifications/#ios-critical-alerts

---

## Appendix: Current Code Locations

### Key Files

- **Main Service:** `services/notification/ExpoNotificationService.ts`
- **Type Definitions:** `services/notification/types.ts`
- **Service Export:** `services/notification/index.ts`
- **Task API:** `api/tasks.ts`
- **App Layout:** `app/_layout.tsx` (initialization)
- **Create Task:** `app/task/create.tsx`
- **Edit Task:** `app/task/[id].tsx`
- **Task Display:** `components/TaskCard.tsx`

### Database Schema

```typescript
interface Task {
  id: string;
  name: string;
  description: string | null;
  alarm_time: string; // ISO 8601 date string
  alarm_interval: number; // 1-5 minutes (currently unused!)
  frecuency: string; // "daily" | "single" | "weekly" | "monthly"
  time_zone: string;
  completed: 0 | 1;
  created_at: string;
  updated_at: string;
}
```

### Current Notification Identifiers

- Format: `task-${taskId}`
- Example: `task-abc123`

### Proposed New Identifiers

- Nag 1: `task-${taskId}-nag1`
- Nag 2: `task-${taskId}-nag2`
- Nag 3: `task-${taskId}-nag3`

---

**Document Version:** 1.0
**Date Created:** 2025-12-22
**Status:** Ready for Implementation
