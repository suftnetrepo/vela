import { create } from 'zustand'

interface AuthState {
  isLocked:    boolean
  hasPin:      boolean
  attempts:    number
  lockedUntil: Date | null
  setLocked:   (locked: boolean) => void
  setHasPin:   (has: boolean) => void
  addAttempt:  () => void
  resetAttempts: () => void
  lockout:     (until: Date) => void
}

export const useAuthStore = create<AuthState>(set => ({
  isLocked:     false,
  hasPin:       false,
  attempts:     0,
  lockedUntil:  null,

  setLocked:   locked => set({ isLocked: locked }),
  setHasPin:   has    => set({ hasPin: has }),
  addAttempt:  ()     => set(s => ({ attempts: s.attempts + 1 })),
  resetAttempts: ()   => set({ attempts: 0, lockedUntil: null }),
  lockout:     until  => set({ lockedUntil: until }),
}))
