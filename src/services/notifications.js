import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";

let Notifications = null;

// In Expo SDK 53+, remote push notifications were removed from Android Expo Go.
// Importing or requiring expo-notifications on Android in Expo Go throws an Uncaught Error.
// We safely guard against this by only loading expo-notifications when NOT in Android Expo Go.
const isAndroidExpoGo = Platform.OS === "android" && isRunningInExpoGo();

if (Platform.OS !== "web" && !isAndroidExpoGo) {
  try {
    Notifications = require("expo-notifications");
    if (Notifications?.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  } catch (err) {
    console.warn("expo-notifications module could not be initialized:", err);
  }
}

export async function requestNotificationPermission() {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") return true;
      if (Notification.permission !== "denied") {
        try {
          const perm = await Notification.requestPermission();
          return perm === "granted";
        } catch {
          return false;
        }
      }
    }
    return false;
  }

  if (isAndroidExpoGo || !Notifications) {
    // In Expo Go on Android, native push notifications are not supported by Expo SDK 53+.
    // We return false gracefully without throwing errors.
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") {
      return true;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (err) {
    console.warn("Error requesting notification permissions:", err);
    return false;
  }
}

export async function sendWeatherNotification(alert) {
  if (!alert) return;

  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(alert.title || "Mausam Weather Alert", {
          body: alert.message || "Please check the latest weather conditions.",
          icon: "/icon.png",
        });
      } catch (e) {
        console.warn("Web Notification dispatch failed", e);
      }
    }
    return;
  }

  if (isAndroidExpoGo || !Notifications) {
    // Native push is disabled in Expo Go Android SDK 53+.
    // In-app alert sounds, visual alerts, and voice announcements work seamlessly.
    return;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title || "Mausam Weather Alert",
        body: alert.message || "Please check the latest weather conditions.",
        data: {
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
        },
      },
      trigger: null,
    });
  } catch (err) {
    console.warn("Failed to schedule notification:", err);
  }
}

export async function cancelAllWeatherNotifications() {
  if (isAndroidExpoGo || !Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn("Cancel notifications error:", err);
  }
}