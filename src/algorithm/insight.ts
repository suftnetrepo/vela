/**
 * insight
 *
 * Deterministic, fully local "Vela Insight" generator for Home. No AI/LLM —
 * every message is a template filled in from numbers computed over the
 * user's own classified log history (see cycleHistory.ts). Returns null
 * whenever the data doesn't support a claim; the Home card is responsible
 * for rendering a "keep logging" learning state in that case.
 */

import type { Cycle } from '../db/schema'
import type { CyclePrediction } from './prediction'
import type { ClassifiedLog } from './cycleHistory'
import { phaseName } from './prediction'
import { SYMPTOM_MAP } from '../constants/symptoms'
import { MOOD_MAP, MOOD_KEY_PREFIX } from '../constants/moods'
import { APP_CONFIG } from '../constants/config'

export interface VelaInsight {
  title:    string
  message:  string
  context:  string | null
}

function labelForKey(key: string): string {
  if (key.startsWith(MOOD_KEY_PREFIX)) {
    const moodKey = key.slice(MOOD_KEY_PREFIX.length)
    return MOOD_MAP[moodKey]?.label ?? moodKey
  }
  return SYMPTOM_MAP[key]?.label ?? key
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function generateVelaInsight(
  prediction:     CyclePrediction | null,
  cycles:         Cycle[],
  classifiedLogs: ClassifiedLog[],
): VelaInsight | null {
  if (!prediction || classifiedLogs.length === 0) return null

  const currentPhase = prediction.currentPhase === 'predicted_period'
    ? 'menstrual'
    : prediction.currentPhase

  const maxCycles = APP_CONFIG.prediction.maxCyclesUsed

  // ── 1. Energy trend for the current phase ──────────────────────────────
  const currentPhaseLogs = classifiedLogs.filter(
    l => l.phase === currentPhase && l.energyLevel != null,
  )
  const currentPhaseCycles = new Set(currentPhaseLogs.map(l => l.cycleId))

  const allEnergyLogs = classifiedLogs.filter(l => l.energyLevel != null)

  if (currentPhaseLogs.length >= 3 && currentPhaseCycles.size >= 2 && allEnergyLogs.length >= 5) {
    const phaseAvg   = mean(currentPhaseLogs.map(l => l.energyLevel as number))
    const overallAvg = mean(allEnergyLogs.map(l => l.energyLevel as number))
    const diff = phaseAvg - overallAvg

    if (Math.abs(diff) >= 0.4) {
      const direction = diff > 0 ? 'increase' : 'dip'
      const cyclesUsed = Math.min(currentPhaseCycles.size, maxCycles)
      return {
        title:   'Vela Insight',
        message: `Your energy tends to ${direction} during this phase.`,
        context: `Based on your last ${cyclesUsed} cycle${cyclesUsed === 1 ? '' : 's'}.`,
      }
    }
  }

  // ── 2. Fallback: most common symptom/mood during the current phase ─────
  const phaseByCycle = new Map<number, string[]>()
  for (const log of classifiedLogs) {
    if (log.phase !== currentPhase) continue
    const existing = phaseByCycle.get(log.cycleId) ?? []
    phaseByCycle.set(log.cycleId, [...existing, ...log.symptomKeys])
  }

  const eligibleCycleCount = phaseByCycle.size
  if (eligibleCycleCount >= 2) {
    const cycleCountForKey = new Map<string, number>()
    for (const keys of phaseByCycle.values()) {
      for (const key of new Set(keys)) {
        cycleCountForKey.set(key, (cycleCountForKey.get(key) ?? 0) + 1)
      }
    }

    let bestKey: string | null = null
    let bestCount = 0
    for (const [key, count] of cycleCountForKey) {
      if (count > bestCount) {
        bestKey = key
        bestCount = count
      }
    }

    if (bestKey && bestCount / eligibleCycleCount >= 0.5) {
      const cyclesUsed = Math.min(eligibleCycleCount, maxCycles)
      return {
        title:   'Vela Insight',
        message: `You've often logged ${labelForKey(bestKey)} during your ${phaseName(currentPhase)} phase.`,
        context: `Based on your last ${cyclesUsed} cycle${cyclesUsed === 1 ? '' : 's'}.`,
      }
    }
  }

  return null
}
