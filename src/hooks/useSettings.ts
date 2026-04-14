import { useCallback } from 'react'
import { settingsService } from '../services/settings.service'
import { useSettingsStore } from '../stores/settings.store'
import { SETTINGS_KEYS } from '../constants/config'
import type { ThemeName } from '../constants/themes'

export function useSettings() {
  const store = useSettingsStore()

  const setTheme = useCallback(async (theme: ThemeName) => {
    await settingsService.set(SETTINGS_KEYS.THEME, theme)
    store.setTheme(theme)
  }, [store])

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    await settingsService.set(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, enabled)
    store.setNotificationsEnabled(enabled)
  }, [store])

  const setCycleLength = useCallback(async (days: number) => {
    await settingsService.set(SETTINGS_KEYS.AVG_CYCLE_LENGTH, days)
    store.setAvgCycleLength(days)
  }, [store])

  const setPeriodLength = useCallback(async (days: number) => {
    await settingsService.set(SETTINGS_KEYS.AVG_PERIOD_LENGTH, days)
    store.setAvgPeriodLength(days)
  }, [store])

  const completeOnboarding = useCallback(async () => {
    await settingsService.set(SETTINGS_KEYS.ONBOARDING_COMPLETE, true)
    store.setOnboardingComplete(true)
  }, [store])

  return {
    ...store,
    setTheme,
    setNotificationsEnabled,
    setCycleLength,
    setPeriodLength,
    completeOnboarding,
  }
}
