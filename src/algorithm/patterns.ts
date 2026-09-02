/**
 * patterns
 *
 * Deterministic, local pattern detection for Home's "Your Patterns" card.
 * Every pattern below is only surfaced once real logged data clears an
 * explicit threshold — nothing is inferred or fabricated. Separate from
 * PatternSummary.tsx (Insights screen), which reports cycle-length
 * regularity; this module correlates symptoms/mood/energy with cycle
 * timing, a different signal.
 */

import { parseISO, format, subDays } from 'date-fns'
import type { Cycle } from '../db/schema'
import type { ClassifiedLog } from './cycleHistory'
import { SYMPTOM_MAP } from '../constants/symptoms'
import { MOOD_MAP, MOOD_KEY_PREFIX } from '../constants/moods'
import { getSymptomIcon } from '../constants/symptomIconMap'

export interface DetectedPattern {
  key:           string
  icon:          string
  title:         string
  description:   string
  confidencePct: number
  sampleSize:    number
  // Per-cycle occurrence (1 = seen, 0 = not seen), oldest→newest, for the
  // optional sparkline. Always real, never padded with guesses.
  trend:         number[]
}

function labelFor(key: string): string {
  if (key.startsWith(MOOD_KEY_PREFIX)) {
    const moodKey = key.slice(MOOD_KEY_PREFIX.length)
    return MOOD_MAP[moodKey]?.label ?? moodKey
  }
  return SYMPTOM_MAP[key]?.label ?? key
}

function iconFor(key: string): string {
  if (key.startsWith(MOOD_KEY_PREFIX)) return 'heart'
  return getSymptomIcon(key)
}

// ─── Rule 1: symptom/mood recurring 1–2 days before the period starts ───────
function detectPreMenstrualPatterns(
  cycles: Cycle[],
  logsByDate: Map<string, ClassifiedLog>,
): DetectedPattern[] {
  const sorted = [...cycles]
    .filter(c => !!c.startDate)
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())

  if (sorted.length < 3) return [] // need at least 2 period starts to compare against

  const keyStats = new Map<string, { eligible: number; occurrences: number; trend: number[] }>()

  for (let i = 1; i < sorted.length; i++) {
    const periodStart = parseISO(sorted[i].startDate)
    const windowDates = [1, 2].map(n => format(subDays(periodStart, n), 'yyyy-MM-dd'))
    const windowLogs = windowDates
      .map(d => logsByDate.get(d))
      .filter((l): l is ClassifiedLog => !!l)

    if (windowLogs.length === 0) continue // no data logged in this window — can't judge

    const keysSeen = new Set(windowLogs.flatMap(l => l.symptomKeys))

    // Every key ever logged anywhere gets an "eligible" tick for this window
    // (so absence counts against it), then an "occurrence" tick if present.
    for (const [key, stat] of keyStats) {
      stat.eligible++
      if (keysSeen.has(key)) {
        stat.occurrences++
        stat.trend.push(1)
      } else {
        stat.trend.push(0)
      }
    }
    for (const key of keysSeen) {
      if (!keyStats.has(key)) {
        // Backfill: this key hasn't been tracked before this window — it's
        // eligible starting now (we don't know about earlier windows since
        // it wasn't a candidate yet, so start its count from here).
        keyStats.set(key, { eligible: 1, occurrences: 1, trend: [1] })
      }
    }
  }

  const results: DetectedPattern[] = []
  for (const [key, stat] of keyStats) {
    if (stat.eligible < 2) continue
    const pct = stat.occurrences / stat.eligible
    if (pct < 0.6) continue

    results.push({
      key:           `pre_period_${key}`,
      icon:          iconFor(key),
      title:         labelFor(key),
      description:   'Usually appears 1–2 days before your period.',
      confidencePct: Math.round(pct * 100),
      sampleSize:    stat.eligible,
      trend:         stat.trend,
    })
  }

  return results
}

// ─── Rule 2: low energy during late luteal phase ────────────────────────────
function detectLateLutealEnergyDip(classifiedLogs: ClassifiedLog[]): DetectedPattern | null {
  const lateLuteal = classifiedLogs.filter(
    l => l.phase === 'luteal' && l.energyLevel != null && l.cycleDay >= l.cycleLength - 3,
  )
  const otherLogs = classifiedLogs.filter(
    l => l.energyLevel != null && !(l.phase === 'luteal' && l.cycleDay >= l.cycleLength - 3),
  )

  const cyclesInLateLuteal = new Set(lateLuteal.map(l => l.cycleId))
  if (lateLuteal.length < 3 || cyclesInLateLuteal.size < 2 || otherLogs.length < 3) return null

  const lateLutealAvg = lateLuteal.reduce((a, l) => a + (l.energyLevel as number), 0) / lateLuteal.length
  const otherAvg      = otherLogs.reduce((a, l) => a + (l.energyLevel as number), 0) / otherLogs.length

  if (otherAvg - lateLutealAvg < 0.4) return null

  // Trend: per contributing cycle (oldest→newest, cycle ids are assigned in
  // creation order), was energy in the late-luteal window below this user's
  // own overall average that cycle contributed to?
  const cycleIds = Array.from(cyclesInLateLuteal.values()).sort((a, b) => a - b)
  const trend = cycleIds.map(id => {
    const cycleLogs = lateLuteal.filter(l => l.cycleId === id)
    const avg = cycleLogs.reduce((a, l) => a + (l.energyLevel as number), 0) / cycleLogs.length
    return avg <= lateLutealAvg ? 1 : 0
  })

  const confidencePct = Math.round(
    (lateLuteal.filter(l => (l.energyLevel as number) <= lateLutealAvg).length / lateLuteal.length) * 100,
  )

  return {
    key:           'late_luteal_low_energy',
    icon:          'zap',
    title:         'Low energy',
    description:   'More common during late luteal phase.',
    confidencePct,
    sampleSize:    cyclesInLateLuteal.size,
    trend,
  }
}

// ─── Rule 3: pain-category symptom logged on cycle Day 1 ────────────────────
function detectDayOneSymptom(classifiedLogs: ClassifiedLog[]): DetectedPattern | null {
  const dayOneLogs = classifiedLogs.filter(l => l.cycleDay === 1)
  const cyclesWithDayOne = new Set(dayOneLogs.map(l => l.cycleId))
  if (cyclesWithDayOne.size < 2) return null

  const painKeys = new Set(
    Object.values(SYMPTOM_MAP)
      .filter(s => s.category === 'pain')
      .map(s => s.key),
  )

  const perCycleHasPain = new Map<number, boolean>()
  for (const log of dayOneLogs) {
    const hasPain = log.symptomKeys.some(k => painKeys.has(k))
    perCycleHasPain.set(log.cycleId, (perCycleHasPain.get(log.cycleId) ?? false) || hasPain)
  }

  const cycleIds = Array.from(perCycleHasPain.keys()).sort((a, b) => a - b)
  const occurrences = cycleIds.filter(id => perCycleHasPain.get(id)).length
  const pct = occurrences / cycleIds.length
  if (pct < 0.6) return null

  return {
    key:           'day_one_pain',
    icon:          'headache',
    title:         'Cramps on Day 1',
    description:   'Pain symptoms often show up on the first day of your period.',
    confidencePct: Math.round(pct * 100),
    sampleSize:    cycleIds.length,
    trend:         cycleIds.map(id => (perCycleHasPain.get(id) ? 1 : 0)),
  }
}

export function detectPatterns(
  cycles:         Cycle[],
  classifiedLogs: ClassifiedLog[],
): DetectedPattern[] {
  if (cycles.length === 0 || classifiedLogs.length === 0) return []

  const logsByDate = new Map(classifiedLogs.map(l => [l.date, l]))

  const patterns: DetectedPattern[] = [
    ...detectPreMenstrualPatterns(cycles, logsByDate),
    detectLateLutealEnergyDip(classifiedLogs),
    detectDayOneSymptom(classifiedLogs),
  ].filter((p): p is DetectedPattern => !!p)

  return patterns.sort((a, b) => b.confidencePct - a.confidencePct || b.sampleSize - a.sampleSize)
}

export function getHomePatterns(
  cycles:         Cycle[],
  classifiedLogs: ClassifiedLog[],
  limit = 2,
): DetectedPattern[] {
  return detectPatterns(cycles, classifiedLogs).slice(0, limit)
}
