import { create } from 'zustand'

interface RecordsState {
  version: number
  invalidateData: () => void
}

export const useRecordsStore = create<RecordsState>(set => ({
  version:        0,
  invalidateData: () => set(s => ({ version: s.version + 1 })),
}))
