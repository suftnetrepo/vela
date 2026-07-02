import React, { useEffect, useState } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AppState } from 'react-native'
import {
  useFonts,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { GlobalPortalProvider, PortalManager } from 'fluent-styles'
import { initDatabase } from '../src/db/client'
import { seedDatabase } from '../src/db/seed'
import { settingsService } from '../src/services/settings.service'
import { securityService } from '../src/services/security.service'
import { getEntitlement, initializeRevenueCat, refreshEntitlement, subscribeToEntitlementUpdates } from '../src/services/premium.service'
import { notificationService } from '../src/services/notification.service'
import { useSettingsStore } from '../src/stores/settings.store'
import { useAuthStore } from '../src/stores/auth.store'
import { SETTINGS_KEYS } from '../src/constants/config'
import type { ThemeName } from '../src/constants/themes'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const hydrateSettings = useSettingsStore(s => s.hydrate)
  const setPremiumEntitlement = useSettingsStore(s => s.setPremiumEntitlement)
  const setBootReady = useSettingsStore(s => s.setBootReady)
  const setLocked = useAuthStore(s => s.setLocked)
  const setHasPin = useAuthStore(s => s.setHasPin)
  const hydrateLockout = useAuthStore(s => s.hydrateLockout)

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  useEffect(() => {
    async function boot() {
      try {
        // Initialize RevenueCat first (for app lifecycle)
        await initializeRevenueCat()

        await initDatabase()
        // await seedDatabase()

        const all = await settingsService.getAll()
        
        const onboardingComplete = Boolean(all[SETTINGS_KEYS.ONBOARDING_COMPLETE])
        const pinSkipped = Boolean(all[SETTINGS_KEYS.PIN_SKIPPED])
        
        hydrateSettings({
          theme: (all[SETTINGS_KEYS.THEME] as ThemeName) ?? 'rose',
          isPremium: Boolean(all[SETTINGS_KEYS.IS_PREMIUM]),
          onboardingComplete,
          pinSkipped,
          notificationsEnabled: Boolean(all[SETTINGS_KEYS.NOTIFICATIONS_ENABLED] ?? true),
          avgCycleLength: Number(all[SETTINGS_KEYS.AVG_CYCLE_LENGTH] ?? 28),
          avgPeriodLength: Number(all[SETTINGS_KEYS.AVG_PERIOD_LENGTH] ?? 5),
          weightUnit: (all['weight_unit'] as any) ?? 'kg',
          tempUnit: (all[SETTINGS_KEYS.TEMPERATURE_UNIT] as any) ?? 'celsius',
        })

        // Hydrate premium entitlement state from RevenueCat
        const entitlement = await getEntitlement()
        setPremiumEntitlement(entitlement.isActive, entitlement.plan)

        const hasPin = await securityService.hasPin()
        
        setHasPin(hasPin)
        if (hasPin) {
          setLocked(true)
        }

        // Restore any persisted lockout state (e.g. mid-lockout from before
        // the app was force-quit) — this must not reset on relaunch, or the
        // brute-force lockout can be bypassed just by killing the app.
        const { attempts, lockedUntil } = await securityService.getLockoutState()
        hydrateLockout(attempts, lockedUntil)

        // ⚠️ CRITICAL: Mark boot as ready ONLY after ALL hydration and state setup is complete
        // This prevents router from making decisions before persisted state is loaded
        setBootReady(true)
        
        setAppReady(true)

        // Fire-and-forget: recompute the prediction and (re)schedule
        // reminder notifications to match. Not awaited so it never blocks
        // app startup — notification permission prompts / scheduling can
        // happen in the background after the UI is already interactive.
        notificationService.refreshScheduledNotifications()
      } catch (err) {
        console.error('[Vela] Boot error:', err)
        setAppReady(true)
        // Still mark boot ready even on error to prevent infinite wait
        setBootReady(true)
      }
    }
    boot()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToEntitlementUpdates((info) => {
      console.log('[Premium] Root entitlement update', info)
      setPremiumEntitlement(info.isActive, info.plan)
    })

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return

      refreshEntitlement('app-foreground')
        .then((info) => {
          console.log('[Premium] Foreground refresh', info)
          setPremiumEntitlement(info.isActive, info.plan)
        })
        .catch((error) => {
          console.error('[Premium] Foreground refresh failed:', error)
        })

      notificationService.refreshScheduledNotifications()
    })

    return () => {
      unsubscribe()
      appStateSubscription.remove()
    }
  }, [setPremiumEntitlement])

  useEffect(() => {
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, appReady])

  return (
    <GlobalPortalProvider>
      <PortalManager>
        <Slot />
      </PortalManager>
    </GlobalPortalProvider>
  )
}