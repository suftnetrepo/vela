import { Platform } from 'react-native'
import * as ExpoNotifications from 'expo-notifications'
import { settingsService } from './settings.service'
import { cycleService } from './cycle.service'
import { SETTINGS_KEYS } from '../constants/config'
import { APP_CONFIG } from '../constants/config'
import { predictNextCycle } from '../algorithm/prediction'
import type { CyclePrediction } from '../algorithm/prediction'
import { subDays } from 'date-fns'

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
})

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await ExpoNotifications.requestPermissionsAsync()
    return status === 'granted'
  },

  // Android 8+ (API 26+) won't post a heads-up/sound notification without a
  // channel — without this, reminders would silently fall back to a mute,
  // low-priority default channel instead of actually alerting. iOS has no
  // concept of channels, so this is a no-op there. Call once at app startup,
  // before any reminder gets scheduled.
  async ensureAndroidNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return
    await ExpoNotifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: ExpoNotifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    })
  },

  async schedulePredictionNotifications(prediction: CyclePrediction): Promise<void> {
    const enabled = await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFICATIONS_ENABLED)
    if (!enabled) return

    // Cancel existing scheduled notifications
    await ExpoNotifications.cancelAllScheduledNotificationsAsync()

    const daysBefore = await settingsService.get<number>(SETTINGS_KEYS.NOTIFY_DAYS_BEFORE) ?? 2
    const notifyFertile    = await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFY_FERTILE)    ?? true
    const notifyOvulation  = await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFY_OVULATION)  ?? true

    // Period reminder
    const periodReminderDate = subDays(prediction.nextPeriodStart, daysBefore)
    if (periodReminderDate > new Date()) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: '🌸 Period due soon',
          body:  `Your period is expected in ${daysBefore} days. Be prepared 💗`,
        },
        trigger: { date: periodReminderDate } as any,
      })
    }

    // Fertile window
    if (notifyFertile && prediction.fertileWindowStart > new Date()) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: '🌟 Fertile window opening',
          body:  'Your fertile window is estimated to be starting.',
        },
        trigger: { date: prediction.fertileWindowStart } as any,
      })
    }

    // Ovulation day
    if (notifyOvulation && prediction.ovulationDay > new Date()) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: '✨ Ovulation day',
          body:  'Your estimated ovulation day — may feel peak energy.',
        },
        trigger: { date: prediction.ovulationDay } as any,
      })
    }
  },

  async cancelAll(): Promise<void> {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync()
  },

  // Recomputes the current cycle prediction from stored cycles and
  // (re)schedules notifications to match. This is the piece that was
  // missing entirely — nothing in the app ever called this before, so no
  // period/fertile/ovulation reminder notification could ever fire, no
  // matter what the user toggled in Notifications settings.
  //
  // Call this: on app boot/foreground, and immediately after any
  // notification-related setting changes, so changes take effect without
  // requiring an app restart.
  async refreshScheduledNotifications(): Promise<void> {
    try {
      // Default to enabled when nothing's been explicitly saved yet — this
      // must match the same "default true" semantics the Notifications
      // settings screen uses (via useSettingsStore's hydration), otherwise
      // a fresh install shows the toggle as on but never actually requests
      // permission or schedules anything, since an unset DB value would
      // otherwise be treated as off here.
      const enabledRaw = await settingsService.get<boolean>(SETTINGS_KEYS.NOTIFICATIONS_ENABLED)
      const enabled = enabledRaw ?? true
      if (!enabled) {
        await this.cancelAll()
        return
      }

      const granted = await this.requestPermissions()
      if (!granted) return

      const confirmedCycles = await cycleService.getConfirmedCycles()
      if (confirmedCycles.length === 0) return

      const avgCycleLength = await settingsService.get<number>(SETTINGS_KEYS.AVG_CYCLE_LENGTH)
      const avgPeriodLength = await settingsService.get<number>(SETTINGS_KEYS.AVG_PERIOD_LENGTH)

      const prediction = predictNextCycle({
        confirmedCycles,
        today: new Date(),
        defaultCycleLength: avgCycleLength ?? APP_CONFIG.prediction.defaultCycleLength,
        defaultPeriodLength: avgPeriodLength ?? APP_CONFIG.prediction.defaultPeriodLength,
      })

      await this.schedulePredictionNotifications(prediction)
    } catch (err) {
      console.warn('[Vela] Failed to refresh scheduled notifications:', err)
    }
  },
}