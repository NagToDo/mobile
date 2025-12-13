import { expoNotificationService } from "./ExpoNotificationService";
import { NotificationService } from "./types";

/**
 * The notification service instance.
 * Currently uses expo-notifications for local notifications.
 * To switch to FCM or another provider, replace this export with a different implementation.
 */
export const notificationService: NotificationService = expoNotificationService;

export type { NotificationService } from "./types";
