import { addDays, differenceInDays, parseISO, format, startOfDay } from 'date-fns'
import type { Cycle } from '../db/schema'
import { APP_CONFIG } from '../constants/config'

export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulation'
  | 'fertile'
  | 'luteal'
  | 'predicted_period'

export interface CyclePrediction {
  nextPeriodStart:      Date
  nextPeriodEnd:        Date
  ovulationDay:         Date
  fertileWindowStart:   Date
  fertileWindowEnd:     Date
  averageCycleLength:   number
  averagePeriodLength:  number
  confidenceDays:       number
  currentPhase:         CyclePhase
  daysUntilNextPeriod:  number
  currentCycleDay:      number
}

export interface DayMeta {
  phase:        CyclePhase | 'period' | null
  isToday:      boolean
  isPeriod:     boolean
  isFertile:    boolean
  isOvulation:  boolean
  isPredicted:  boolean
  confidence:   number
}

export interface PredictionInput {
  confirmedCycles:    Cycle[]
  today:              Date
  defaultCycleLength?: number
  defaultPeriodLength?: number
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

// Weighted average — most recent cycle gets highest weight
function weightedAverage(values: number[]): number {
  const capped = values.slice(-APP_CONFIG.prediction.maxCyclesUsed)
  const n = capped.length
  let weightSum = 0
  let valueSum = 0
  capped.forEach((v, i) => {
    const w = i + 1
    weightSum += w
    valueSum += v * w
  })
  return Math.round(valueSum / weightSum)
}

function getConfidenceDays(sampleSize: number): number {
  if (sampleSize <= 1) return 4
  if (sampleSize === 2) return 3
  if (sampleSize === 3) return 2
  return 1
}

export function predictNextCycle(input: PredictionInput): CyclePrediction {
  const {
    confirmedCycles,
    today,
    defaultCycleLength = APP_CONFIG.prediction.defaultCycleLength,
    defaultPeriodLength = APP_CONFIG.prediction.defaultPeriodLength,
  } = input

  const todayStart = startOfDay(today)

  // Extract valid historical lengths
  const cycleLengths: number[] = []
  const periodLengths: number[] = []
  for (const c of confirmedCycles) {
    if (c.cycleLength)  cycleLengths.push(clamp(c.cycleLength, APP_CONFIG.prediction.minCycleLength, APP_CONFIG.prediction.maxCycleLength))
    if (c.periodLength) periodLengths.push(clamp(c.periodLength, APP_CONFIG.prediction.minPeriodLength, APP_CONFIG.prediction.maxPeriodLength))
  }

  const avgCycle  = cycleLengths.length  > 0 ? weightedAverage(cycleLengths)  : defaultCycleLength
  const avgPeriod = periodLengths.length > 0 ? weightedAverage(periodLengths) : defaultPeriodLength

  // Most recent cycle start — guard against missing/invalid startDate
  const lastCycle = confirmedCycles[confirmedCycles.length - 1]
  if (!lastCycle?.startDate) {
    throw new Error('Last cycle has no startDate')
  }
  const lastStart = startOfDay(parseISO(lastCycle.startDate))

  // Project forward
  const nextPeriodStart   = addDays(lastStart, avgCycle)
  const nextPeriodEnd     = addDays(nextPeriodStart, avgPeriod - 1)
  const ovulationDay      = addDays(nextPeriodStart, -APP_CONFIG.prediction.lutealPhaseLength)
  const fertileWindowStart = addDays(ovulationDay, -5)
  const fertileWindowEnd  = addDays(ovulationDay, 1)

  const daysUntilNextPeriod = differenceInDays(nextPeriodStart, todayStart)
  const currentCycleDay     = differenceInDays(todayStart, lastStart) + 1

  const currentPhase = resolvePhase({
    today: todayStart,
    lastStart,
    avgPeriod,
    ovulationDay,
    fertileWindowStart,
    fertileWindowEnd,
    nextPeriodStart,
  })

  return {
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDay,
    fertileWindowStart,
    fertileWindowEnd,
    averageCycleLength:  avgCycle,
    averagePeriodLength: avgPeriod,
    confidenceDays:      getConfidenceDays(confirmedCycles.length),
    currentPhase,
    daysUntilNextPeriod,
    currentCycleDay,
  }
}

function resolvePhase(p: {
  today:              Date
  lastStart:          Date
  avgPeriod:          number
  ovulationDay:       Date
  fertileWindowStart: Date
  fertileWindowEnd:   Date
  nextPeriodStart:    Date
}): CyclePhase {
  const dayOfCycle = differenceInDays(p.today, p.lastStart) + 1

  if (p.today >= p.nextPeriodStart) return 'predicted_period'
  if (dayOfCycle >= 1 && dayOfCycle <= p.avgPeriod) return 'menstrual'
  if (differenceInDays(p.ovulationDay, p.today) === 0) return 'ovulation'
  if (p.today >= p.fertileWindowStart && p.today <= p.fertileWindowEnd) return 'fertile'
  if (p.today < p.fertileWindowStart) return 'follicular'
  return 'luteal'
}

// Build a date → DayMeta map for calendar rendering
export function buildCalendarMap(
  prediction:       CyclePrediction,
  confirmedCycles:  Cycle[],
  today:            Date,
  monthStart:       Date,
  monthEnd:         Date,
): Map<string, DayMeta> {
  const map    = new Map<string, DayMeta>()
  const todayS = startOfDay(today)
  let cursor   = startOfDay(monthStart)
  const end    = startOfDay(monthEnd)

  while (cursor <= end) {
    const key     = format(cursor, 'yyyy-MM-dd')
    const isToday = differenceInDays(cursor, todayS) === 0
    const isFuture = cursor > todayS

    let isPeriod = false
    for (const c of confirmedCycles) {
      const start = startOfDay(parseISO(c.startDate))
      const end   = c.endDate
        ? startOfDay(parseISO(c.endDate))
        : addDays(start, (c.periodLength ?? 5) - 1)
      if (cursor >= start && cursor <= end) { isPeriod = true; break }
    }

    const isFertile   = isFuture && cursor >= prediction.fertileWindowStart && cursor <= prediction.fertileWindowEnd
    const isOvulation = isFuture && differenceInDays(prediction.ovulationDay, cursor) === 0
    const isPredicted = isFuture && cursor >= prediction.nextPeriodStart && cursor <= prediction.nextPeriodEnd

    map.set(key, {
      phase:       isPeriod ? 'period' : null,
      isToday,
      isPeriod,
      isFertile,
      isOvulation,
      isPredicted,
      confidence:  prediction.confidenceDays,
    })

    cursor = addDays(cursor, 1)
  }

  return map
}

// Human-readable phase label
export function phaseName(phase: CyclePhase): string {
  const names: Record<CyclePhase, string> = {
    menstrual:        'Period',
    follicular:       'Follicular',
    ovulation:        'Ovulation',
    fertile:          'Fertile Window',
    luteal:           'Luteal',
    predicted_period: 'Period Due',
  }
  return names[phase] ?? 'Unknown'
}

export function phaseDescription(phase: CyclePhase): string {
  const desc: Record<CyclePhase, string> = {
    menstrual:        'Your period is here. Rest and take care of yourself. 💗',
    follicular:       'Energy is building. Great time for new projects.',
    ovulation:        'Peak fertility day. You may feel your best today. ✨',
    fertile:          'Your fertile window is open. High chance of conception.',
    luteal:           'Winding down. Some PMS symptoms may appear.',
    predicted_period: 'Your period is due soon. It\'s on its way.',
  }
  return desc[phase] ?? ''
}
