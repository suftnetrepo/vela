import { useMemo } from 'react'
import { generateVelaInsight } from '../algorithm/insight'
import type { VelaInsight } from '../algorithm/insight'
import type { CyclePrediction } from '../algorithm/prediction'
import type { Cycle } from '../db/schema'
import type { DailyLogWithSymptoms } from '../services/log.service'
import { useClassifiedLogs } from './useClassifiedLogs'

export function useHomeInsight(
  cycles:     Cycle[],
  logs:       DailyLogWithSymptoms[],
  prediction: CyclePrediction | null,
): VelaInsight | null {
  const classified = useClassifiedLogs(cycles, logs, prediction)

  return useMemo(
    () => generateVelaInsight(prediction, cycles, classified),
    [prediction, cycles, classified],
  )
}
