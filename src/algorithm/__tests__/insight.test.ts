/**
 * Pure-logic tests for generateVelaInsight — the deterministic, local
 * "Vela Insight" card generator. No expo-sqlite/drizzle import anywhere in
 * this file or in insight.ts itself.
 *
 *   node --experimental-strip-types scripts/run-pure-tests.mjs src/algorithm/__tests__/insight.test.ts
 */
import assert from 'node:assert/strict'
import { generateVelaInsight } from '../insight.ts'
import type { Cycle } from '../../db/schema.ts'
import type { ClassifiedLog } from '../cycleHistory.ts'
import type { CyclePrediction } from '../prediction.ts'

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

function makePrediction(currentPhase: CyclePrediction['currentPhase']): CyclePrediction {
  return {
    nextPeriodStart: new Date('2026-02-01'),
    nextPeriodEnd: new Date('2026-02-05'),
    ovulationDay: new Date('2026-01-18'),
    fertileWindowStart: new Date('2026-01-13'),
    fertileWindowEnd: new Date('2026-01-19'),
    averageCycleLength: 28,
    averagePeriodLength: 5,
    confidenceDays: 2,
    currentPhase,
    daysUntilNextPeriod: 10,
    currentCycleDay: 20,
  }
}

function log(overrides: Partial<ClassifiedLog>): ClassifiedLog {
  return {
    date: '2026-01-01',
    cycleId: 1,
    cycleDay: 20,
    cycleLength: 28,
    phase: 'luteal',
    energyLevel: null,
    symptomKeys: [],
    ...overrides,
  }
}

const cycles: Cycle[] = [] // generateVelaInsight never actually reads `cycles` itself

test('no prediction yields no insight', () => {
  assert.equal(generateVelaInsight(null, cycles, [log({})]), null)
})

test('no classified logs yields no insight, even with a valid prediction', () => {
  assert.equal(generateVelaInsight(makePrediction('luteal'), cycles, []), null)
})

test('predicted_period phase is treated as menstrual for phase-matching purposes', () => {
  const logs = [
    log({ cycleId: 1, phase: 'menstrual', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'menstrual', energyLevel: 1 }),
    log({ cycleId: 2, phase: 'menstrual', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'follicular', energyLevel: 5 }),
    log({ cycleId: 2, phase: 'follicular', energyLevel: 5 }),
  ]
  const result = generateVelaInsight(makePrediction('predicted_period'), cycles, logs)
  assert.ok(result)
  assert.match(result!.message, /energy tends to dip during this phase/)
})

test('an energy dip is reported only once it spans 2+ cycles and clears the 0.4 threshold', () => {
  // Same cycle repeated 3x with a real dip, but only 1 distinct cycleId —
  // must NOT fire the energy-trend branch (falls through to the symptom
  // fallback, which also has no data here, so the result is null).
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'follicular', energyLevel: 5 }),
    log({ cycleId: 1, phase: 'follicular', energyLevel: 5 }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  assert.equal(result, null)
})

test('an energy diff just under the 0.4 threshold does not trigger the energy-trend message', () => {
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: 4 }),
    log({ cycleId: 1, phase: 'luteal', energyLevel: 4 }),
    log({ cycleId: 2, phase: 'luteal', energyLevel: 4 }),
    log({ cycleId: 1, phase: 'follicular', energyLevel: 4.3 }),
    log({ cycleId: 2, phase: 'follicular', energyLevel: 4.3 }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  // diff = |4 - 4.12| ≈ 0.12, well under 0.4 — either null or the symptom
  // fallback, but never the energy-trend wording.
  if (result) assert.doesNotMatch(result.message, /energy tends to/)
})

test('a diff clearly over the 0.4 threshold triggers the energy-trend message', () => {
  // overallAvg is the mean of ALL energy logs (current phase included), not
  // just the "other" phases — [1,1,1,5,5] → 2.6. phaseAvg(luteal) = 1.
  // diff = 1 - 2.6 = -1.6, well past the 0.4 threshold in the "dip" direction.
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 2, phase: 'luteal', energyLevel: 1 }),
    log({ cycleId: 1, phase: 'follicular', energyLevel: 5 }),
    log({ cycleId: 2, phase: 'follicular', energyLevel: 5 }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  assert.ok(result)
  assert.match(result!.message, /energy tends to dip during this phase/)
})

test('with no energy data at all, falls back to the most common symptom for the current phase', () => {
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: null, symptomKeys: ['bloating'] }),
    log({ cycleId: 2, phase: 'luteal', energyLevel: null, symptomKeys: ['bloating'] }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  assert.ok(result)
  assert.match(result!.message, /bloating/i)
  assert.match(result!.message, /luteal/i)
})

test('the symptom fallback needs 2+ cycles worth of data for the current phase, not just 1', () => {
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: null, symptomKeys: ['bloating'] }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  assert.equal(result, null)
})

test('a symptom present in fewer than half of eligible cycles is not surfaced as the fallback insight', () => {
  const logs = [
    log({ cycleId: 1, phase: 'luteal', energyLevel: null, symptomKeys: ['bloating'] }),
    log({ cycleId: 2, phase: 'luteal', energyLevel: null, symptomKeys: [] }),
    log({ cycleId: 3, phase: 'luteal', energyLevel: null, symptomKeys: [] }),
  ]
  const result = generateVelaInsight(makePrediction('luteal'), cycles, logs)
  assert.equal(result, null)
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
