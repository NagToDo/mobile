import { Task } from "@/domain/models/Task";

/**
 * Abstract notification service interface.
 * Implementations can use expo-notifications, FCM, or any other provider.
 */
export interface NotificationService {
  /**
   * Initialize the notification service (e.g., set handlers).
   * Should be called once when the app starts.
   */
  initialize(): void;

  /**
   * Request notification permissions from the user.
   * @returns true if permissions were granted, false otherwise.
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Schedule a notification for a task.
   * If a notification for this task already exists, it will be replaced.
   * @param task The task to schedule a notification for.
   * @returns The notification identifier.
   */
  scheduleNotification(task: Task): Promise<string>;

  /**
   * Cancel a scheduled notification for a task.
   * @param taskId The task ID whose notification should be cancelled.
   */
  cancelNotification(taskId: string): Promise<void>;

  /**
   * Cancel all scheduled notifications.
   */
  cancelAll(): Promise<void>;
}
