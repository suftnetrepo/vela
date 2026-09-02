import { useMemo } from 'react'
import { classifyLogs } from '../algorithm/cycleHistory'
import type { ClassifiedLog } from '../algorithm/cycleHistory'
import type { CyclePrediction } from '../algorithm/prediction'
import type { Cycle } from '../db/schema'
import type { DailyLogWithSymptoms } from '../services/log.service'

/**
 * Shared "which cycle/day/phase does each historical log fall in" step used
 * by both useHomeInsight and usePatterns, so the two features are built on
 * the exact same classification of the user's history.
 */
export function useClassifiedLogs(
  cycles:     Cycle[],
  logs:       DailyLogWithSymptoms[],
  prediction: CyclePrediction | null,
): ClassifiedLog[] {
  return useMemo(
    () => classifyLogs(cycles, logs, {
      defaultPeriodLength: prediction?.averagePeriodLength,
      defaultCycleLength:  prediction?.averageCycleLength,
    }),
    [cycles, logs, prediction],
  )
}
