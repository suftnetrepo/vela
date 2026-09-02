/**
 * cycleHistory
 *
 * Shared "which cycle/day/phase does this historical daily log belong to?"
 * classifier. Used by both insight.ts (Vela Insight) and patterns.ts
 * (Your Patterns) so the two features agree on phase bucketing instead of
 * each reimplementing it.
 */

import { parseISO, differenceInDays } from 'date-fns'
import { phaseForCycleDay } from './prediction'
import type { CyclePhase } from './prediction'
import type { Cycle } from '../db/schema'
import type { DailyLogWithSymptoms } from '../services/log.service'
import { APP_CONFIG } from '../constants/config'

export interface ClassifiedLog {
  date:         string
  cycleId:      number
  cycleDay:     number
  cycleLength:  number  // the length used to classify this log (real or estimated)
  phase:        CyclePhase
  energyLevel:  number | null
  symptomKeys:  string[]
}

export interface ClassifyOptions {
  // Fallback lengths for cycles that don't have a confirmed periodLength /
  // cycleLength yet (i.e. the still-open active cycle). Callers should pass
  // the prediction engine's own weighted averages here so classification
  // stays consistent with the rest of the app instead of inventing a
  // separate estimate.
  defaultPeriodLength?: number
  defaultCycleLength?:  number
}

/**
 * Classifies a list of daily logs against the user's real cycle history.
 * Logs whose date doesn't fall within any known cycle (e.g. logged before
 * the very first tracked cycle) are dropped — we never guess a cycle that
 * doesn't exist in the data.
 */
export function classifyLogs(
  cycles:  Cycle[],
  logs:    DailyLogWithSymptoms[],
  options: ClassifyOptions = {},
): ClassifiedLog[] {
  const {
    defaultPeriodLength = APP_CONFIG.prediction.defaultPeriodLength,
    defaultCycleLength  = APP_CONFIG.prediction.defaultCycleLength,
  } = options

  if (cycles.length === 0 || logs.length === 0) return []

  const cyclesById = new Map(cycles.map(c => [c.id, c]))
  const sortedCycles = [...cycles].sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
  )

  const findOwningCycle = (logDate: Date): Cycle | null => {
    let owner: Cycle | null = null
    for (const c of sortedCycles) {
      const start = parseISO(c.startDate)
      if (start <= logDate) owner = c
      else break
    }
    return owner
  }

  const results: ClassifiedLog[] = []

  for (const log of logs) {
    if (!log.date) continue
    const logDate = parseISO(log.date)

    const cycle = (log.cycleId != null ? cyclesById.get(log.cycleId) : null)
      ?? findOwningCycle(logDate)
    if (!cycle) continue

    const cycleStart = parseISO(cycle.startDate)
    const cycleDay = differenceInDays(logDate, cycleStart) + 1
    if (cycleDay < 1) continue

    const periodLength = cycle.periodLength ?? defaultPeriodLength
    const cycleLength  = cycle.cycleLength  ?? defaultCycleLength
    const phase = phaseForCycleDay(cycleDay, periodLength, cycleLength)

    const symptomKeys = (log.symptoms ?? []).map(s => s.symptomKey)

    results.push({
      date:        log.date,
      cycleId:     cycle.id,
      cycleDay,
      cycleLength,
      phase,
      energyLevel: log.energyLevel ?? null,
      symptomKeys,
    })
  }

  return results
}
