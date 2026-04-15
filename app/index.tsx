import { useEffect, useRef } from 'react'
import { router, useRootNavigationState } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { useSettingsStore } from '../src/stores/settings.store'

export default function Index() {
  const rootNavState        = useRootNavigationState()
  const isLocked            = useAuthStore(s => s.isLocked)
  const hasPin              = useAuthStore(s => s.hasPin)
  const onboardingComplete  = useSettingsStore(s => s.onboardingComplete)
  const pinSkipped          = useSettingsStore(s => s.pinSkipped)

  // Track whether onboarding was already complete at mount time.
  // If it wasn't (first launch / just completed), we skip the lock screen
  // even if hasPin becomes true mid-session (user just set their PIN).
  const wasOnboardingComplete = useRef(onboardingComplete)

  useEffect(() => {
    if (!rootNavState?.key) return

    // ROUTING LOGIC (in order of evaluation):
    // 1. Onboarding not complete → welcome
    // 2. Onboarding complete but PIN not created and not skipped → PIN setup
    // 3. Onboarding complete, PIN setup done (created or skipped), user locked → lock screen
    // 4. Otherwise → home

    if (!onboardingComplete) {
      // First-time users: send to welcome
      router.replace('/(auth)/welcome')
    } else if (!hasPin && !pinSkipped && wasOnboardingComplete.current) {
      // Onboarding done, but PIN setup not yet done or skipped
      // Send to PIN setup for first time
      router.replace('/(auth)/pin-setup')
    } else if (isLocked && hasPin && wasOnboardingComplete.current) {
      // Onboarding done, PIN was already set up in a previous session, user is locked
      // Send to lock screen
      router.replace('/(lock)/lock-screen')
    } else {
      // All setup done: onboarding complete, PIN handled (created or skipped)
      // Send to main app
      router.replace('/(app)/home')
    }
  }, [rootNavState?.key, isLocked, hasPin, onboardingComplete, pinSkipped])

  return null
}
