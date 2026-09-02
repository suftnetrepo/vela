import { useMemo } from 'react'
import { getHomePatterns } from '../algorithm/patterns'
import type { DetectedPattern } from '../algorithm/patterns'
import type { CyclePrediction } from '../algorithm/prediction'
import type { Cycle } from '../db/schema'
import type { DailyLogWithSymptoms } from '../services/log.service'
import { useClassifiedLogs } from './useClassifiedLogs'

export function usePatterns(
  cycles:     Cycle[],
  logs:       DailyLogWithSymptoms[],
  prediction: CyclePrediction | null,
  limit = 2,
): DetectedPattern[] {
  const classified = useClassifiedLogs(cycles, logs, prediction)

  return useMemo(
    () => getHomePatterns(cycles, classified, limit),
    [cycles, classified, limit],
  )
}
