/**
 * Pure-logic tests for the prediction engine — no expo-sqlite/drizzle import
 * anywhere in this file or in prediction.ts itself (the only schema
 * reference is `import type { Cycle }`, fully erased at runtime), so this
 * runs under plain Node with zero project dependencies added:
 *
 *   node --experimental-strip-types src/algorithm/__tests__/prediction.test.ts
 *
 * Focus: phase-boundary transitions (the exact day a prediction flips from
 * one phase to the next) rather than only "happy path" mid-phase days,
 * since off-by-one errors there are the most common regression risk.
 */
import assert from 'node:assert/strict'
import {
  predictNextCycle,
  phaseForCycleDay,
  phaseName,
  phaseDescription,
  buildCalendarMap,
  type PredictionInput,
} from '../prediction.ts'
import type { Cycle } from '../../db/schema.ts'

let passed = 0
function test(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok — ${name}`)
  } catch (err) {
    console.error(`  FAIL — ${name}`)
    console.error(err)
    process.exitCode = 1
  }
}

let nextId = 1
function makeCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id:           nextId++,
    startDate:    '2026-01-01',
    endDate:      null,
    periodLength: null,
    cycleLength:  null,
    isActive:     0,
    notes:        null,
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─── predictNextCycle: guards & defaults ────────────────────────────────────

test('throws when there are no confirmed cycles (nothing to project from)', () => {
  assert.throws(() =>
    predictNextCycle({ confirmedCycles: [], today: new Date('2026-01-15') }),
  )
})

test('falls back to defaultCycleLength/defaultPeriodLength when the only cycle has no lengths logged yet', () => {
  const prediction = predictNextCycle({
    confirmedCycles: [makeCycle({ startDate: '2026-01-01', cycleLength: null, periodLength: null })],
    today: new Date('2026-01-02'),
  })
  assert.equal(prediction.averageCycleLength, 28)
  assert.equal(prediction.averagePeriodLength, 5)
})

test('weighted average favours the most recent cycle over older ones', () => {
  // lengths 28, 30, 32 (oldest → newest), weights 1,2,3:
  // (28*1 + 30*2 + 32*3) / 6 = 184/6 = 30.67 -> rounds to 31
  const prediction = predictNextCycle({
    confirmedCycles: [
      makeCycle({ startDate: '2025-11-01', cycleLength: 28 }),
      makeCycle({ startDate: '2025-12-01', cycleLength: 30 }),
      makeCycle({ startDate: '2025-12-31', cycleLength: 32 }),
    ],
    today: new Date('2026-01-01'),
  })
  assert.equal(prediction.averageCycleLength, 31)
})

test('out-of-range cycle/period lengths are clamped before averaging, not used raw', () => {
  const prediction = predictNextCycle({
    confirmedCycles: [makeCycle({ startDate: '2026-01-01', cycleLength: 200, periodLength: 90 })],
    today: new Date('2026-01-02'),
  })
  assert.equal(prediction.averageCycleLength, 45)  // maxCycleLength
  assert.equal(prediction.averagePeriodLength, 9)  // maxPeriodLength
})

test('confidenceDays narrows as sample size grows: 1→4, 2→3, 3→2, 4+→1', () => {
  const base: Omit<PredictionInput, 'confirmedCycles'> = { today: new Date('2026-05-01') }
  const withN = (n: number) =>
    predictNextCycle({
      ...base,
      confirmedCycles: Array.from({ length: n }, (_, i) =>
        makeCycle({ startDate: `2026-0${i + 1}-01`, cycleLength: 28, periodLength: 5 }),
      ),
    }).confidenceDays
  assert.equal(withN(1), 4)
  assert.equal(withN(2), 3)
  assert.equal(withN(3), 2)
  assert.equal(withN(4), 1)
})

// ─── phase transitions: exact boundary days ─────────────────────────────────
// Single cycle starting 2026-01-01, default 28-day cycle / 5-day period /
// 14-day luteal phase:
//   nextPeriodStart = 2026-01-29, ovulationDay = 2026-01-15,
//   fertileWindowStart = 2026-01-10, fertileWindowEnd = 2026-01-16

function phaseOn(dateStr: string): string {
  return predictNextCycle({
    confirmedCycles: [makeCycle({ startDate: '2026-01-01', cycleLength: 28, periodLength: 5 })],
    today: new Date(dateStr),
  }).currentPhase
}

test('last day of menstrual phase (day 5) is still menstrual', () => {
  assert.equal(phaseOn('2026-01-05'), 'menstrual')
})

test('day immediately after the period ends (day 6) is follicular', () => {
  assert.equal(phaseOn('2026-01-06'), 'follicular')
})

test('day immediately before the fertile window opens is still follicular', () => {
  assert.equal(phaseOn('2026-01-09'), 'follicular')
})

test('the first day of the fertile window is fertile', () => {
  assert.equal(phaseOn('2026-01-10'), 'fertile')
})

test('the day before ovulation is fertile, not yet ovulation', () => {
  assert.equal(phaseOn('2026-01-14'), 'fertile')
})

test('the predicted ovulation day itself is reported as ovulation', () => {
  assert.equal(phaseOn('2026-01-15'), 'ovulation')
})

test('the day after ovulation, still inside the fertile window, is fertile again', () => {
  assert.equal(phaseOn('2026-01-16'), 'fertile')
})

test('the day the fertile window closes (day 17) is luteal', () => {
  assert.equal(phaseOn('2026-01-17'), 'luteal')
})

test('the last day before the predicted period is still luteal', () => {
  assert.equal(phaseOn('2026-01-28'), 'luteal')
})

test('the predicted period start date itself flips the phase to predicted_period', () => {
  assert.equal(phaseOn('2026-01-29'), 'predicted_period')
})

test('well past the predicted period start date is still predicted_period (never reverts)', () => {
  assert.equal(phaseOn('2026-02-10'), 'predicted_period')
})

// ─── phaseForCycleDay: fixed-day classification (used for historical logs) ──

test('phaseForCycleDay: day equal to periodLength is menstrual, day after is not', () => {
  assert.equal(phaseForCycleDay(5, 5, 28), 'menstrual')
  assert.equal(phaseForCycleDay(6, 5, 28), 'follicular')
})

test('phaseForCycleDay: exact ovulation day (cycleLength - lutealPhaseLength) is ovulation', () => {
  // cycleLength 28, lutealPhaseLength 14 -> ovulation on day 14
  assert.equal(phaseForCycleDay(14, 5, 28), 'ovulation')
})

test('phaseForCycleDay: fertile window edges are inclusive', () => {
  // ovulationDay 14 -> fertileStart 9, fertileEnd 15
  assert.equal(phaseForCycleDay(9, 5, 28), 'fertile')
  assert.equal(phaseForCycleDay(15, 5, 28), 'fertile')
  assert.equal(phaseForCycleDay(8, 5, 28), 'follicular')
  assert.equal(phaseForCycleDay(16, 5, 28), 'luteal')
})

test('phaseForCycleDay: a day beyond the known cycle length still classifies as luteal, never throws', () => {
  assert.equal(phaseForCycleDay(40, 5, 28), 'luteal')
})

// ─── phaseName / phaseDescription: exhaustive + unknown fallback ────────────

test('phaseName and phaseDescription return non-empty text for every known phase', () => {
  const phases = ['menstrual', 'follicular', 'ovulation', 'fertile', 'luteal', 'predicted_period'] as const
  for (const p of phases) {
    assert.ok(phaseName(p).length > 0, `phaseName(${p})`)
    assert.ok(phaseDescription(p).length > 0, `phaseDescription(${p})`)
  }
})

test('phaseName falls back to "Unknown" for an unrecognised phase value', () => {
  assert.equal(phaseName('not_a_real_phase' as any), 'Unknown')
})

test('the ovulation/follicular descriptions are hedged, not asserted as fact', () => {
  // Regression guard for the Phase 2 wellness-copy fix: these must not read
  // as unconditional claims about the user's actual state.
  assert.match(phaseDescription('follicular'), /often/i)
  assert.match(phaseDescription('ovulation'), /often/i)
})

// ─── buildCalendarMap: boundary flags on a small window ─────────────────────

test('buildCalendarMap marks isPeriod only for real logged period days, not the whole cycle span', () => {
  const cycle = makeCycle({ startDate: '2026-01-01', periodLength: 3, cycleLength: 28 })
  const prediction = predictNextCycle({ confirmedCycles: [cycle], today: new Date('2026-01-10') })
  const map = buildCalendarMap(
    prediction, [cycle], new Date('2026-01-10'),
    new Date('2026-01-01'), new Date('2026-01-10'),
  )
  assert.equal(map.get('2026-01-01')!.isPeriod, true)
  assert.equal(map.get('2026-01-03')!.isPeriod, true)
  assert.equal(map.get('2026-01-04')!.isPeriod, false)
})

test('buildCalendarMap never marks past dates as predicted/fertile/ovulation, only future ones', () => {
  const cycle = makeCycle({ startDate: '2026-01-01', periodLength: 5, cycleLength: 28 })
  const prediction = predictNextCycle({ confirmedCycles: [cycle], today: new Date('2026-01-20') })
  const map = buildCalendarMap(
    prediction, [cycle], new Date('2026-01-20'),
    new Date('2026-01-01'), new Date('2026-01-20'),
  )
  // Jan 15 was the (now past) ovulation day — must not be flagged as ovulation
  // once it's in the past, even though the date itself matches.
  assert.equal(map.get('2026-01-15')!.isOvulation, false)
  assert.equal(map.get('2026-01-20')!.isToday, true)
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
