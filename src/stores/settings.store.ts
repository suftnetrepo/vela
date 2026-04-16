import { create } from 'zustand'
import type { ThemeName } from '../constants/themes'
import type { PremiumPlan } from '../services/premium.service'

interface SettingsState {
  theme:              ThemeName
  isPremium:          boolean
  premiumPlan:        PremiumPlan
  onboardingComplete: boolean
  pinSkipped:         boolean
  notificationsEnabled: boolean
  avgCycleLength:     number
  avgPeriodLength:    number
  bootReady:          boolean
  setTheme:           (t: ThemeName) => void
  setIsPremium:       (v: boolean)   => void
  setPremiumEntitlement: (active: boolean, plan: PremiumPlan) => void
  setOnboardingComplete: (v: boolean) => void
  setPinSkipped:      (v: boolean)   => void
  setNotificationsEnabled: (v: boolean) => void
  setAvgCycleLength:  (n: number)    => void
  setAvgPeriodLength: (n: number)    => void
  setBootReady:       (v: boolean)   => void
  hydrate: (data: Partial<SettingsState>) => void
}

export const useSettingsStore = create<SettingsState>(set => ({
  theme:               'rose',
  isPremium:           false,
  premiumPlan:         null,
  onboardingComplete:  false,
  pinSkipped:          false,
  notificationsEnabled: true,
  avgCycleLength:      28,
  avgPeriodLength:     5,
  bootReady:           false,

  setTheme:                t  => set({ theme: t }),
  setIsPremium:            v  => set({ isPremium: v }),
  setPremiumEntitlement: (active, plan) => set({ isPremium: active, premiumPlan: plan }),
  setOnboardingComplete:   v  => set({ onboardingComplete: v }),
  setPinSkipped:           v  => set({ pinSkipped: v }),
  setNotificationsEnabled: v  => set({ notificationsEnabled: v }),
  setAvgCycleLength:       n  => set({ avgCycleLength: n }),
  setAvgPeriodLength:      n  => set({ avgPeriodLength: n }),
  setBootReady:            v  => set({ bootReady: v }),
  hydrate:                 d  => set(d),
}))
