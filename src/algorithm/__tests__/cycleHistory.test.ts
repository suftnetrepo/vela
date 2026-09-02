/**
 * Pure-logic tests for classifyLogs — the shared "which cycle/day/phase does
 * this historical log belong to?" classifier used by both patterns.ts and
 * insight.ts. No expo-sqlite/drizzle import anywhere in this file or in
 * cycleHistory.ts itself.
 *
 *   node --experimental-strip-types scripts/run-pure-tests.mjs src/algorithm/__tests__/cycleHistory.test.ts
 *
 * These cases matter beyond the happy path because this is exactly the
 * function that has to keep working correctly now that restored backups can
 * leave dailyLogs.cycleId as NULL (Phase 2: date-based fallback is the
 * safety net for that, by design — see the cycle.service.ts deleteCycle
 * comment and the Phase 2 report).
 */
import assert from 'node:assert/strict'
import { classifyLogs } from '../cycleHistory.ts'
import type { Cycle } from '../../db/schema.ts'
import type { DailyLogWithSymptoms } from '../../services/log.service.ts'

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
function makeCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id: nextCycleId++,
    startDate: '2026-01-01',
    endDate: null,
    periodLength: 5,
    cycleLength: 28,
    isActive: 0,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

let nextLogId = 1
function makeLog(overrides: Partial<DailyLogWithSymptoms> = {}): DailyLogWithSymptoms {
  return {
    id: nextLogId++,
    date: '2026-01-01',
    cycleId: null,
    flow: null,
    mood: null,
    energyLevel: null,
    sexualDesire: null,
    temperature: null,
    weight: null,
    notes: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    symptoms: [],
    ...overrides,
  }
}

test('no cycles or no logs returns an empty list rather than throwing', () => {
  assert.deepEqual(classifyLogs([], [makeLog()]), [])
  assert.deepEqual(classifyLogs([makeCycle()], []), [])
})

test('a log dated before the earliest known cycle is dropped, not guessed at', () => {
  const cycle = makeCycle({ startDate: '2026-02-01' })
  const log = makeLog({ date: '2026-01-15', cycleId: null })
  assert.deepEqual(classifyLogs([cycle], [log]), [])
})

test('a log with a null cycleId falls back to date-based ownership (the P0/P2 backup-restore safety net)', () => {
  const cycle = makeCycle({ startDate: '2026-01-01', id: 7 })
  const log = makeLog({ date: '2026-01-10', cycleId: null })
  const [result] = classifyLogs([cycle], [log])
  assert.equal(result.cycleId, 7)
  assert.equal(result.cycleDay, 10)
})

test('an explicit cycleId is honoured even when the log date would resolve to a different cycle', () => {
  const early = makeCycle({ startDate: '2026-01-01', id: 1 })
  const late  = makeCycle({ startDate: '2026-02-01', id: 2 })
  // Dated inside `late`'s span, but explicitly tagged as belonging to `early`.
  const log = makeLog({ date: '2026-02-10', cycleId: 1 })
  const [result] = classifyLogs([early, late], [log])
  assert.equal(result.cycleId, 1)
})

test('a log dated exactly on a cycle start date is cycle day 1', () => {
  const cycle = makeCycle({ startDate: '2026-01-01' })
  const log = makeLog({ date: '2026-01-01' })
  const [result] = classifyLogs([cycle], [log])
  assert.equal(result.cycleDay, 1)
})

test('date-based fallback assigns a log to the correct cycle among several, by nearest prior start', () => {
  const c1 = makeCycle({ startDate: '2026-01-01', id: 1 })
  const c2 = makeCycle({ startDate: '2026-02-01', id: 2 })
  const c3 = makeCycle({ startDate: '2026-03-01', id: 3 })
  const log = makeLog({ date: '2026-02-15', cycleId: null })
  const [result] = classifyLogs([c1, c2, c3], [log])
  assert.equal(result.cycleId, 2)
})

test('cycles out of chronological order in the input array are still sorted before matching', () => {
  const c2 = makeCycle({ startDate: '2026-02-01', id: 2 })
  const c1 = makeCycle({ startDate: '2026-01-01', id: 1 })
  const log = makeLog({ date: '2026-01-15', cycleId: null })
  const [result] = classifyLogs([c2, c1], [log]) // deliberately reversed
  assert.equal(result.cycleId, 1)
})

test('a cycle missing its own periodLength/cycleLength uses the provided defaults for phase classification', () => {
  const cycle = makeCycle({ startDate: '2026-01-01', periodLength: null, cycleLength: null })
  const log = makeLog({ date: '2026-01-01' })
  const [result] = classifyLogs([cycle], [log], { defaultPeriodLength: 5, defaultCycleLength: 28 })
  assert.equal(result.cycleLength, 28)
  assert.equal(result.phase, 'menstrual')
})

test('a log with an empty/falsy date string is skipped', () => {
  const cycle = makeCycle({ startDate: '2026-01-01' })
  const log = makeLog({ date: '' as any })
  assert.deepEqual(classifyLogs([cycle], [log]), [])
})

test('symptom keys are carried through from the log symptoms array', () => {
  const cycle = makeCycle({ startDate: '2026-01-01' })
  const log = makeLog({
    date: '2026-01-01',
    symptoms: [
      { id: 1, date: '2026-01-01', dailyLogId: 1, symptomKey: 'headache', intensity: 2, createdAt: '2026-01-01T00:00:00.000Z' },
    ],
  })
  const [result] = classifyLogs([cycle], [log])
  assert.deepEqual(result.symptomKeys, ['headache'])
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
