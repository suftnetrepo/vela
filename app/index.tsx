import { useEffect } from 'react'
import { router, useRootNavigationState } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { useSettingsStore } from '../src/stores/settings.store'

export default function Index() {
  const rootNavState        = useRootNavigationState()
  const isLocked            = useAuthStore(s => s.isLocked)
  const hasPin              = useAuthStore(s => s.hasPin)
  const onboardingComplete  = useSettingsStore(s => s.onboardingComplete)

  useEffect(() => {
    // Wait until the root navigator has mounted before attempting navigation.
    // Without this guard, router.replace fires before <Slot /> is ready and
    // throws: "Attempted to navigate before mounting the Root Layout component"
    if (!rootNavState?.key) return

    if (!onboardingComplete) {
      router.replace('/(auth)/welcome')
    } else if (isLocked && hasPin) {
      router.replace('/(lock)/lock-screen')
    } else {
      router.replace('/(app)/home')
    }
  }, [rootNavState?.key, isLocked, hasPin, onboardingComplete])

  return null
}
