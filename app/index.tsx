import { useEffect } from 'react'
import { router, useRootNavigationState } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { useSettingsStore } from '../src/stores/settings.store'

export default function Index() {
  const rootNavState        = useRootNavigationState()
  const isLocked            = useAuthStore(s => s.isLocked)
  const hasPin              = useAuthStore(s => s.hasPin)
  const onboardingComplete  = useSettingsStore(s => s.onboardingComplete)
  const pinSkipped          = useSettingsStore(s => s.pinSkipped)
  const bootReady           = useSettingsStore(s => s.bootReady)

  useEffect(() => {
    // ⚠️ CRITICAL: Block routing until boot is completely ready
    // This prevents race conditions where router runs before hydration completes
    if (!bootReady) {
      console.log('[🧭 VELA ROUTER] ⏳ WAITING: Boot not ready yet, delaying routing decision')
      return
    }

    if (!rootNavState?.key) return

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('[🧭 VELA ROUTER] Making routing decision...')
    console.log(`[🧭 VELA ROUTER] onboardingComplete=${onboardingComplete}, hasPin=${hasPin}, pinSkipped=${pinSkipped}, isLocked=${isLocked}`)
    console.log('═══════════════════════════════════════════════════════════════\n')

    // ROUTING LOGIC (guaranteed to have hydrated state due to bootReady guard):
    // 1. Onboarding not complete → welcome
    // 2. Onboarding complete but PIN not created and not skipped → PIN setup
    // 3. Onboarding complete, PIN exists and app is locked → lock screen
    // 4. Otherwise → home (PIN skipped or doesn't exist, or already unlocked)

    if (!onboardingComplete) {
      // First-time users: send to welcome
      console.log('[🧭 VELA ROUTER] → DECISION: New user (onboarding incomplete) → WELCOME\n')
      router.replace('/(auth)/welcome')
    } else if (!hasPin && !pinSkipped) {
      // Onboarding done, but PIN setup not yet done or skipped
      // Send to PIN setup for first time
      console.log('[🧭 VELA ROUTER] → DECISION: Onboarding complete, PIN not handled → PIN SETUP\n')
      router.replace('/(auth)/pin-setup')
    } else if (isLocked && hasPin) {
      // Onboarding done, PIN exists and app is locked
      // Send to lock screen
      console.log('[🧭 VELA ROUTER] → DECISION: Onboarding complete, PIN exists, app locked → LOCK SCREEN\n')
      router.replace('/(lock)/lock-screen')
    } else {
      // All setup done: onboarding complete AND (PIN skipped OR no PIN requirement OR already unlocked)
      // Send to main app
      console.log('[🧭 VELA ROUTER] → DECISION: All setup complete → HOME\n')
      router.replace('/(app)/home')
    }
  }, [rootNavState?.key, isLocked, hasPin, onboardingComplete, pinSkipped, bootReady])

  return null
}
