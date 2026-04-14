import { useMemo } from 'react'
import { predictNextCycle } from '../algorithm/prediction'
import type { CyclePrediction } from '../algorithm/prediction'
import type { Cycle } from '../db/schema'
import { useSettingsStore } from '../stores/settings.store'

export function usePrediction(cycles: Cycle[]): CyclePrediction | null {
  const avgCycleLength  = useSettingsStore(s => s.avgCycleLength)
  const avgPeriodLength = useSettingsStore(s => s.avgPeriodLength)

  return useMemo(() => {
    if (!cycles || cycles.length === 0) return null
    try {
      return predictNextCycle({
        confirmedCycles:     cycles,
        today:               new Date(),
        defaultCycleLength:  avgCycleLength,
        defaultPeriodLength: avgPeriodLength,
      })
    } catch (err) {
      console.warn('[Vela] Prediction error:', err)
      return null
    }
  }, [cycles, avgCycleLength, avgPeriodLength])
}
