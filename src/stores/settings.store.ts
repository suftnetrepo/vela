import { create } from 'zustand'
import type { ThemeName } from '../constants/themes'

interface SettingsState {
  theme:              ThemeName
  isPremium:          boolean
  onboardingComplete: boolean
  pinSkipped:         boolean
  notificationsEnabled: boolean
  avgCycleLength:     number
  avgPeriodLength:    number
  setTheme:           (t: ThemeName) => void
  setIsPremium:       (v: boolean)   => void
  setOnboardingComplete: (v: boolean) => void
  setPinSkipped:      (v: boolean)   => void
  setNotificationsEnabled: (v: boolean) => void
  setAvgCycleLength:  (n: number)    => void
  setAvgPeriodLength: (n: number)    => void
  hydrate: (data: Partial<SettingsState>) => void
}

export const useSettingsStore = create<SettingsState>(set => ({
  theme:               'rose',
  isPremium:           false,
  onboardingComplete:  false,
  pinSkipped:          false,
  notificationsEnabled: true,
  avgCycleLength:      28,
  avgPeriodLength:     5,

  setTheme:                t  => set({ theme: t }),
  setIsPremium:            v  => set({ isPremium: v }),
  setOnboardingComplete:   v  => set({ onboardingComplete: v }),
  setPinSkipped:           v  => set({ pinSkipped: v }),
  setNotificationsEnabled: v  => set({ notificationsEnabled: v }),
  setAvgCycleLength:       n  => set({ avgCycleLength: n }),
  setAvgPeriodLength:      n  => set({ avgPeriodLength: n }),
  hydrate:                 d  => set(d),
}))
