import { Task } from "@/domain/models/Task";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationService } from "./types";

interface NotificationData {
  taskId: string;
  frequency: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
  [key: string]: unknown;
}

/**
 * Notification service implementation using expo-notifications.
 * Supports local notifications for "daily" and "single" frequency tasks.
 */
class ExpoNotificationService implements NotificationService {
  private initialized = false;
  private notificationReceivedSubscription: Notifications.EventSubscription | null =
    null;

  initialize(): void {
    if (this.initialized) return;

    // Configure how notifications are handled when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Listen for received notifications to reschedule daily ones
    this.notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        this.handleNotificationReceived(notification);
      });

    this.initialized = true;
  }

  /**
   * Handle received notifications - reschedule daily notifications for the next day.
   */
  private async handleNotificationReceived(
    notification: Notifications.Notification,
  ): Promise<void> {
    const data = notification.request.content
      .data as unknown as NotificationData;

    if (data?.frequency === "daily" && data?.taskId) {
      try {
        // Ensure time components are numbers
        const hour = Number(data.hour);
        const minute = Number(data.minute);

        // Reschedule for tomorrow at the same time
        const nextTrigger = this.getNextTriggerDate(hour, minute);
        const identifier = `task-${data.taskId}`;

        // Create a clean data object with correct types
        const nextData: NotificationData = {
          ...data,
          hour,
          minute,
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: data.title,
            body: data.body,
            data: nextData,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: nextTrigger,
          },
          identifier,
        });
      } catch (error) {
        console.warn("Failed to reschedule daily notification:", error);
      }
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      return false;
    }

    // Android requires a notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return true;
  }

  /**
   * Calculate the next occurrence of a time today or tomorrow.
   */
  private getNextTriggerDate(hour: number, minute: number): Date {
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1);
    }

    return trigger;
  }

  async scheduleNotification(task: Task): Promise<string> {
    // Cancel any existing notification for this task first
    await this.cancelNotification(task.id);

    const alarmDate = new Date(task.alarm_time);
    const now = new Date();

    let trigger: Notifications.NotificationTriggerInput;
    const body = task.description || "Time for your task!";

    // Store data needed for rescheduling daily notifications
    const notificationData: NotificationData = {
      taskId: task.id,
      frequency: task.frecuency,
      hour: alarmDate.getHours(),
      minute: alarmDate.getMinutes(),
      title: task.name,
      body: body,
    };

    if (task.frecuency === "daily") {
      // Daily repeating notification at the specified time
      // Using DATE trigger as a workaround for DAILY trigger compatibility issues
      // The notification will be rescheduled when received via handleNotificationReceived
      const nextTrigger = this.getNextTriggerDate(
        alarmDate.getHours(),
        alarmDate.getMinutes(),
      );

      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextTrigger,
      };
    } else {
      // Single day notification - only schedule if in the future
      if (alarmDate <= now) {
        // Task is in the past, don't schedule
        return task.id;
      }

      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarmDate,
      };
    }

    // Use a prefixed identifier to ensure it's always treated as a string
    const identifier = `task-${task.id}`;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: task.name,
          body: body,
          data: notificationData,
        },
        trigger,
        identifier,
      });

      return notificationId;
    } catch (error) {
      console.warn("Failed to schedule notification:", error);
      return identifier;
    }
  }

  async cancelNotification(taskId: string): Promise<void> {
    const identifier = `task-${taskId}`;
    try {
      // Get all scheduled notifications to find any that belong to this task
      // This handles cases where the identifier might not match exactly or if there are duplicates
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();

      const notificationsToCancel = scheduledNotifications.filter(
        (notification) => {
          const data = notification.content.data as unknown as NotificationData;
          return (
            data?.taskId === taskId || notification.identifier === identifier
          );
        },
      );

      // Cancel all matching notifications
      await Promise.all(
        notificationsToCancel.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(
            notification.identifier,
          ),
        ),
      );

      // Also try cancelling by the expected identifier directly as a fallback
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.warn("Error cancelling notification:", error);
    }
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export const expoNotificationService = new ExpoNotificationService();
