import { useEffect, useRef } from 'react'
import { router, useRootNavigationState } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { useSettingsStore } from '../src/stores/settings.store'

export default function Index() {
  const rootNavState        = useRootNavigationState()
  const isLocked            = useAuthStore(s => s.isLocked)
  const hasPin              = useAuthStore(s => s.hasPin)
  const onboardingComplete  = useSettingsStore(s => s.onboardingComplete)

  // Track whether onboarding was already complete at mount time.
  // If it wasn't (first launch / just completed), we skip the lock screen
  // even if hasPin becomes true mid-session (user just set their PIN).
  const wasOnboardingComplete = useRef(onboardingComplete)

  useEffect(() => {
    if (!rootNavState?.key) return

    if (!onboardingComplete) {
      router.replace('/(auth)/welcome')
    } else if (isLocked && hasPin && wasOnboardingComplete.current) {
      // Only redirect to lock if onboarding was already done before this session
      router.replace('/(lock)/lock-screen')
    } else {
      router.replace('/(app)/home')
    }
  }, [rootNavState?.key, isLocked, hasPin, onboardingComplete])

  return null
}
