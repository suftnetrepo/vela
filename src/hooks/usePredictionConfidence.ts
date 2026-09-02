import { useMemo } from 'react'
import { getPredictionConfidence } from '../algorithm/confidence'
import type { PredictionConfidence } from '../algorithm/confidence'
import type { CyclePrediction } from '../algorithm/prediction'
import type { Cycle } from '../db/schema'

export function usePredictionConfidence(
  cycles:     Cycle[],
  prediction: CyclePrediction | null,
): PredictionConfidence | null {
  return useMemo(
    () => getPredictionConfidence(cycles, prediction),
    [cycles, prediction],
  )
}
