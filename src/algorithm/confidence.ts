/**
 * confidence
 *
 * Turns the prediction engine's real cycle history into a simple,
 * user-facing confidence level. Deliberately non-medical — this is a
 * statement about how consistent the user's *logged* data has been, not a
 * clinical claim.
 *
 * Reuses rather than reinvents:
 *  - `prediction.confidenceDays` (already derived from sample size in
 *    predictNextCycle/getConfidenceDays) is used as the "± N days" range,
 *    instead of computing a second, competing range.
 *  - The same "range ≤ 3 / ≤ 7 days = regular" thresholds PatternSummary.tsx
 *    already uses for cycle-length regularity, so "what counts as regular"
 *    is consistent across the app.
 *  - Cycle lengths are already clamped to sane bounds by predictNextCycle's
 *    clamp() calls before they ever reach here, so obvious outliers are
 *    already handled upstream.
 */

import type { Cycle } from '../db/schema'
import type { CyclePrediction } from './prediction'
import { APP_CONFIG } from '../constants/config'

export type ConfidenceLevel = 'low' | 'moderate' | 'high'

export interface PredictionConfidence {
  level:        ConfidenceLevel
  label:        string
  rangeDays:    number
  cyclesUsed:   number
  description:  string
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

export function getPredictionConfidence(
  cycles:     Cycle[],
  prediction: CyclePrediction | null,
): PredictionConfidence | null {
  if (!prediction) return null

  const { minCycleLength, maxCycleLength, maxCyclesUsed } = APP_CONFIG.prediction

  const completed = cycles.filter(c => c.cycleLength != null)
  const recentLengths = completed
    .slice(-maxCyclesUsed)
    .map(c => clamp(c.cycleLength!, minCycleLength, maxCycleLength))

  const cyclesUsed = recentLengths.length
  const rangeDays  = prediction.confidenceDays

  if (cyclesUsed === 0) {
    return {
      level: 'low',
      label: 'Low',
      rangeDays,
      cyclesUsed,
      description: 'Log a full cycle to start improving prediction accuracy.',
    }
  }

  const variation = Math.max(...recentLengths) - Math.min(...recentLengths)

  let level: ConfidenceLevel
  if (cyclesUsed >= 3 && variation <= 3) {
    level = 'high'
  } else if (cyclesUsed >= 2 && variation <= 7) {
    level = 'moderate'
  } else {
    level = 'low'
  }

  const description =
    level === 'high'
      ? 'Your logged cycles have been consistent.'
      : level === 'moderate'
        ? 'Your cycle length varies a little — predictions may shift.'
        : cyclesUsed === 1
          ? 'Log another cycle to improve prediction accuracy.'
          : 'Your cycle length has varied — treat this date as an estimate.'

  return {
    level,
    label: level === 'high' ? 'High' : level === 'moderate' ? 'Moderate' : 'Low',
    rangeDays,
    cyclesUsed,
    description,
  }
}
