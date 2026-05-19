import { db } from '../db/client'
import { cycles, dailyLogs, symptomLogs, settings, notifications } from '../db/schema'
import { securityService } from './security.service'
import { useSettingsStore } from '../stores/settings.store'
import { useAuthStore } from '../stores/auth.store'
import { useRecordsStore } from '../stores/records.store'

/**
 * DEVELOPMENT ONLY: Reset service for clearing all local data
 * This is used for testing onboarding flow and first-install scenarios
 * NOT VISIBLE IN PRODUCTION BUILDS
 */
export const devResetService = {
  /**
   * Clear all local data (SQLite, SecureStore, Zustand state)
   * This simulates a fresh app install
   */
  async resetAllData(): Promise<void> {
    try {
      // 1. Clear all SQLite tables
      await db.delete(notifications)
      await db.delete(symptomLogs)
      await db.delete(dailyLogs)
      await db.delete(cycles)
      await db.delete(settings)

      // 2. Clear SecureStore (PIN)
      await securityService.clearPin()

      // 3. Reset all Zustand stores to defaults
      useSettingsStore.setState({
        theme: 'rose',
        isPremium: false,
        premiumPlan: null,
        onboardingComplete: false,
        pinSkipped: false,
        notificationsEnabled: true,
        avgCycleLength: 28,
        avgPeriodLength: 5,
        bootReady: false,
      })

      useAuthStore.setState({
        hasPin: false,
        isLocked: false,
        attempts: 0,
        lockedUntil: null,
      })

      useRecordsStore.setState({
        version: 0,
      })

      console.log('[Vela Dev] All local data reset successfully')
    } catch (err) {
      console.error('[Vela Dev] Error during reset:', err)
      throw err
    }
  },

  /**
   * Reset data and reload the app
   */
  async resetAndReload(): Promise<void> {
    try {
      await devResetService.resetAllData()
      // Force full app reload
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload()
      }
    } catch (err) {
      console.error('[Vela Dev] Error during reset and reload:', err)
      throw err
    }
  },
}
