/**
 * Pure-logic tests for detectPatterns/getHomePatterns — deterministic
 * symptom/mood/energy pattern detection. No expo-sqlite/drizzle import
 * anywhere in this file or in patterns.ts itself.
 *
 *   node --experimental-strip-types scripts/run-pure-tests.mjs src/algorithm/__tests__/patterns.test.ts
 */
import assert from 'node:assert/strict'
import { detectPatterns, getHomePatterns } from '../patterns.ts'
import type { Cycle } from '../../db/schema.ts'
import type { ClassifiedLog } from '../cycleHistory.ts'

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

let nextCycleId = 1
function makeCycle(startDate: string): Cycle {
  return {
    id: nextCycleId++,
    startDate,
    endDate: null,
    periodLength: 5,
    cycleLength: 28,
    isActive: 0,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function log(overrides: Partial<ClassifiedLog>): ClassifiedLog {
  return {
    date: '2026-01-01',
    cycleId: 1,
    cycleDay: 1,
    cycleLength: 28,
    phase: 'menstrual',
    energyLevel: null,
    symptomKeys: [],
    ...overrides,
  }
}

test('no cycles or no classified logs yields no patterns', () => {
  assert.deepEqual(detectPatterns([], []), [])
  assert.deepEqual(detectPatterns([makeCycle('2026-01-01')], []), [])
})

test('fewer than 3 cycles never triggers the pre-menstrual pattern rule (needs 2 period starts to compare)', () => {
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29')]
  const logs = [
    log({ date: '2026-01-27', cycleId: 1, symptomKeys: ['headache'] }),
    log({ date: '2026-01-28', cycleId: 1, symptomKeys: ['headache'] }),
  ]
  const patterns = detectPatterns(cycles, logs)
  assert.equal(patterns.some(p => p.key.startsWith('pre_period_')), false)
})

test('a symptom consistently logged 1-2 days before period start is detected once the 60% threshold is cleared', () => {
  // 3 cycles → 2 comparison windows. Headache logged in both windows = 100%.
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29'), makeCycle('2026-02-26')]
  const logs = [
    log({ date: '2026-01-27', symptomKeys: ['headache'] }), // 2 days before cycle 2 starts
    log({ date: '2026-01-28', symptomKeys: ['headache'] }), // 1 day before cycle 2 starts
    log({ date: '2026-02-24', symptomKeys: ['headache'] }), // 2 days before cycle 3 starts
    log({ date: '2026-02-25', symptomKeys: ['headache'] }), // 1 day before cycle 3 starts
  ]
  const patterns = detectPatterns(cycles, logs)
  const found = patterns.find(p => p.key === 'pre_period_headache')
  assert.ok(found, 'expected a pre_period_headache pattern')
  assert.equal(found!.confidencePct, 100)
})

test('a symptom logged in fewer than 60% of eligible pre-period windows is not surfaced', () => {
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29'), makeCycle('2026-02-26'), makeCycle('2026-03-26')]
  const logs = [
    // Present ahead of cycle 2 only; windows before cycle 3 and 4 have data
    // logged for a *different* key, so headache is eligible but absent there.
    log({ date: '2026-01-27', symptomKeys: ['headache'] }),
    log({ date: '2026-02-24', symptomKeys: ['bloating'] }),
    log({ date: '2026-03-24', symptomKeys: ['bloating'] }),
  ]
  const patterns = detectPatterns(cycles, logs)
  assert.equal(patterns.some(p => p.key === 'pre_period_headache'), false)
})

test('late-luteal energy dip requires at least 2 distinct cycles worth of low-energy data, not just 1', () => {
  const cycles = [makeCycle('2026-01-01')]
  // All late-luteal low-energy logs come from a single cycle — must not fire.
  const logs: ClassifiedLog[] = [
    log({ date: '2026-01-25', cycleId: 1, phase: 'luteal', cycleDay: 25, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-01-26', cycleId: 1, phase: 'luteal', cycleDay: 26, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-01-27', cycleId: 1, phase: 'luteal', cycleDay: 27, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-01-05', cycleId: 1, phase: 'menstrual', cycleDay: 5, cycleLength: 28, energyLevel: 5 }),
    log({ date: '2026-01-06', cycleId: 1, phase: 'follicular', cycleDay: 6, cycleLength: 28, energyLevel: 5 }),
    log({ date: '2026-01-07', cycleId: 1, phase: 'follicular', cycleDay: 7, cycleLength: 28, energyLevel: 5 }),
  ]
  const patterns = detectPatterns(cycles, logs)
  assert.equal(patterns.some(p => p.key === 'late_luteal_low_energy'), false)
})

test('late-luteal energy dip fires once 2+ cycles show a real energy drop in the late-luteal window', () => {
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29')]
  const logs: ClassifiedLog[] = [
    log({ date: '2026-01-25', cycleId: 1, phase: 'luteal', cycleDay: 25, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-01-26', cycleId: 1, phase: 'luteal', cycleDay: 26, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-02-22', cycleId: 2, phase: 'luteal', cycleDay: 25, cycleLength: 28, energyLevel: 1 }),
    log({ date: '2026-01-05', cycleId: 1, phase: 'menstrual', cycleDay: 5, cycleLength: 28, energyLevel: 5 }),
    log({ date: '2026-01-06', cycleId: 1, phase: 'follicular', cycleDay: 6, cycleLength: 28, energyLevel: 5 }),
    log({ date: '2026-02-01', cycleId: 2, phase: 'follicular', cycleDay: 4, cycleLength: 28, energyLevel: 5 }),
  ]
  const patterns = detectPatterns(cycles, logs)
  const found = patterns.find(p => p.key === 'late_luteal_low_energy')
  assert.ok(found, 'expected a late_luteal_low_energy pattern')
  assert.equal(found!.sampleSize, 2)
})

test('day-one pain pattern requires at least 2 cycles with a day-1 log, not just 1', () => {
  const cycles = [makeCycle('2026-01-01')]
  const logs = [log({ date: '2026-01-01', cycleId: 1, cycleDay: 1, symptomKeys: ['cramps'] })]
  const patterns = detectPatterns(cycles, logs)
  assert.equal(patterns.some(p => p.key === 'day_one_pain'), false)
})

test('day-one pain pattern fires once pain shows up on cycle day 1 in >=60% of cycles', () => {
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29'), makeCycle('2026-02-26')]
  const logs = [
    log({ date: '2026-01-01', cycleId: 1, cycleDay: 1, symptomKeys: ['cramps'] }),
    log({ date: '2026-01-29', cycleId: 2, cycleDay: 1, symptomKeys: ['cramps'] }),
    log({ date: '2026-02-26', cycleId: 3, cycleDay: 1, symptomKeys: ['bloating'] }), // no pain this cycle
  ]
  const patterns = detectPatterns(cycles, logs)
  const found = patterns.find(p => p.key === 'day_one_pain')
  assert.ok(found, 'expected a day_one_pain pattern')
  assert.equal(found!.confidencePct, 67)
})

test('getHomePatterns respects the limit and returns the highest-confidence patterns first', () => {
  const cycles = [makeCycle('2026-01-01'), makeCycle('2026-01-29'), makeCycle('2026-02-26')]
  const logs = [
    log({ date: '2026-01-01', cycleId: 1, cycleDay: 1, symptomKeys: ['cramps'] }),
    log({ date: '2026-01-29', cycleId: 2, cycleDay: 1, symptomKeys: ['cramps'] }),
    log({ date: '2026-02-26', cycleId: 3, cycleDay: 1, symptomKeys: ['cramps'] }),
    log({ date: '2026-01-27', cycleId: 1, symptomKeys: ['headache'] }),
    log({ date: '2026-01-28', cycleId: 1, symptomKeys: ['headache'] }),
    log({ date: '2026-02-24', cycleId: 2, symptomKeys: ['headache'] }),
    log({ date: '2026-02-25', cycleId: 2, symptomKeys: ['bloating'] }), // breaks headache's 2nd-window streak
  ]
  const all = detectPatterns(cycles, logs)
  const limited = getHomePatterns(cycles, logs, 1)
  assert.equal(limited.length, 1)
  assert.equal(limited[0].key, all[0].key)
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
