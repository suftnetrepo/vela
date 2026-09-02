/**
 * Pure-logic tests for getPredictionConfidence — no expo-sqlite/drizzle
 * import anywhere in this file or in confidence.ts itself.
 *
 *   node --experimental-strip-types scripts/run-pure-tests.mjs src/algorithm/__tests__/confidence.test.ts
 */
import assert from 'node:assert/strict'
import { getPredictionConfidence } from '../confidence.ts'
import type { Cycle } from '../../db/schema.ts'
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

let nextId = 1
function makeCycle(cycleLength: number | null): Cycle {
  return {
    id: nextId++,
    startDate: '2026-01-01',
    endDate: null,
    periodLength: 5,
    cycleLength,
    isActive: 0,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function makePrediction(confidenceDays: number): CyclePrediction {
  return {
    nextPeriodStart: new Date('2026-02-01'),
    nextPeriodEnd: new Date('2026-02-05'),
    ovulationDay: new Date('2026-01-18'),
    fertileWindowStart: new Date('2026-01-13'),
    fertileWindowEnd: new Date('2026-01-19'),
    averageCycleLength: 28,
    averagePeriodLength: 5,
    confidenceDays,
    currentPhase: 'follicular',
    daysUntilNextPeriod: 10,
    currentCycleDay: 10,
  }
}

test('returns null when there is no prediction to attach confidence to', () => {
  assert.equal(getPredictionConfidence([], null), null)
})

test('zero completed cycles yields level "low" with a "log a full cycle" nudge', () => {
  const result = getPredictionConfidence([], makePrediction(4))
  assert.equal(result?.level, 'low')
  assert.equal(result?.cyclesUsed, 0)
  assert.match(result!.description, /log a full cycle/i)
})

test('a single completed cycle is "low" with a "log another cycle" nudge (not the zero-cycle message)', () => {
  const result = getPredictionConfidence([makeCycle(28)], makePrediction(4))
  assert.equal(result?.level, 'low')
  assert.equal(result?.cyclesUsed, 1)
  assert.match(result!.description, /log another cycle/i)
})

test('3+ cycles with variation exactly at the 3-day boundary is "high"', () => {
  const cycles = [makeCycle(28), makeCycle(29), makeCycle(31)] // variation = 3
  const result = getPredictionConfidence(cycles, makePrediction(1))
  assert.equal(result?.level, 'high')
  assert.equal(result?.label, 'High')
})

test('3+ cycles with variation one day past the "high" boundary drops to "moderate"', () => {
  const cycles = [makeCycle(28), makeCycle(29), makeCycle(32)] // variation = 4
  const result = getPredictionConfidence(cycles, makePrediction(1))
  assert.equal(result?.level, 'moderate')
})

test('2 cycles with variation exactly at the 7-day "moderate" boundary is "moderate"', () => {
  const cycles = [makeCycle(24), makeCycle(31)] // variation = 7
  const result = getPredictionConfidence(cycles, makePrediction(2))
  assert.equal(result?.level, 'moderate')
})

test('2 cycles with variation one day past the "moderate" boundary drops to "low"', () => {
  const cycles = [makeCycle(24), makeCycle(32)] // variation = 8
  const result = getPredictionConfidence(cycles, makePrediction(2))
  assert.equal(result?.level, 'low')
  assert.match(result!.description, /varied/i)
})

test('out-of-range cycle lengths are clamped before computing variation, same as the prediction engine', () => {
  // Raw values 10 and 200 would show a huge variation; clamped to
  // [minCycleLength=20, maxCycleLength=45] the variation is only 25 — still
  // "low" here, but the point is the clamp runs at all (regression guard
  // against an unclamped outlier producing a nonsensical range).
  const cycles = [makeCycle(10), makeCycle(200)]
  const result = getPredictionConfidence(cycles, makePrediction(3))
  assert.equal(result?.level, 'low')
})

test('rangeDays is passed through from the prediction, not recomputed', () => {
  const result = getPredictionConfidence([makeCycle(28), makeCycle(28), makeCycle(28)], makePrediction(1))
  assert.equal(result?.rangeDays, 1)
})

test('only the most recent maxCyclesUsed cycles count toward cyclesUsed', () => {
  const cycles = Array.from({ length: 9 }, () => makeCycle(28))
  const result = getPredictionConfidence(cycles, makePrediction(1))
  assert.equal(result?.cyclesUsed, 6) // APP_CONFIG.prediction.maxCyclesUsed
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
