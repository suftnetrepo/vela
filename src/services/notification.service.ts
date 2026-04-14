import * as ExpoNotifications from 'expo-notifications'
import { db } from '../db/client'
import { notifications } from '../db/schema'
import { nowISO } from '../utils/date'
import { settingsService } from './settings.service'
import { SETTINGS_KEYS } from '../constants/config'
import type { CyclePrediction } from '../algorithm/prediction'
import { addDays, subDays } from 'date-fns'

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
          body:  'Your fertile window starts today. High chance of conception.',
        },
        trigger: { date: prediction.fertileWindowStart } as any,
      })
    }

    // Ovulation day
    if (notifyOvulation && prediction.ovulationDay > new Date()) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: '✨ Ovulation day',
          body:  'Today is your estimated ovulation day — peak fertility.',
        },
        trigger: { date: prediction.ovulationDay } as any,
      })
    }
  },

  async cancelAll(): Promise<void> {
    await ExpoNotifications.cancelAllScheduledNotificationsAsync()
  },
}
