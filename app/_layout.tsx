import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
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
import { useSettingsStore } from '../src/stores/settings.store'
import { useAuthStore } from '../src/stores/auth.store'
import { SETTINGS_KEYS } from '../src/constants/config'
import type { ThemeName } from '../src/constants/themes'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const hydrateSettings = useSettingsStore(s => s.hydrate)
  const setBootReady = useSettingsStore(s => s.setBootReady)
  const setLocked = useAuthStore(s => s.setLocked)
  const setHasPin = useAuthStore(s => s.setHasPin)

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  })

  useEffect(() => {
    async function boot() {
      try {
        await initDatabase()
        await seedDatabase()

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
        })

        const hasPin = await securityService.hasPin()
        
        setHasPin(hasPin)
        if (hasPin) {
          setLocked(true)
        }

        // ⚠️ CRITICAL: Mark boot as ready ONLY after ALL hydration and state setup is complete
        // This prevents router from making decisions before persisted state is loaded
        setBootReady(true)
        
        setAppReady(true)
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
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, appReady])

  // CRITICAL: Always render <Slot /> so the root navigator mounts immediately.
  // Returning null here is what causes "Attempted to navigate before mounting
  // the Root Layout component" — index.tsx tries to navigate before Slot exists.
  // Instead we hide the content via opacity=0 until boot is complete, then
  // the navigator is already mounted and ready to receive router.replace().
  const isReady = fontsLoaded && appReady

  return (
    <GlobalPortalProvider>
      <PortalManager>
        <Slot />
      </PortalManager>
    </GlobalPortalProvider>
  )
}
