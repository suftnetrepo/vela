/**
 * Pure-logic tests for the backup restore pipeline — version gating and the
 * cycle/log import planners. No expo-sqlite/drizzle import anywhere in this
 * file or in velaDataService.ts itself, so this runs under plain Node with
 * zero project dependencies added:
 *
 *   node --experimental-strip-types src/services/__tests__/velaDataService.test.ts
 *
 * What this does NOT cover (needs a real SQLite instance, out of scope for
 * this P0 pass per the approved plan — see the final report's manual-QA
 * checklist instead): the actual transaction/rollback behavior in
 * restore.service.ts, and anything native/boot-related.
 */
import assert from 'node:assert/strict'
import {
  decodeVelaData,
  planCycleImport,
  planLogImport,
  type ExportableCycle,
  type ExportableDailyLog,
  type VelaExportPayload,
} from '../velaDataService.ts'

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

function encode(payload: VelaExportPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64')
}

const baseCycle: ExportableCycle = {
  sd: '2026-01-01',
  ed: '2026-01-05',
  pl: 5,
  cl: 28,
  n: 'felt fine',
}

const baseLog: ExportableDailyLog = {
  d: '2026-02-01',
  f: 'medium',
  m: 'happy',
  el: 4,
  sd: 2,
  tm: 36.6,
  w: 60,
  n: 'note',
  sy: [{ k: 'headache', i: 2 }],
}

console.log('velaDataService — pure restore logic')

// ── Version gating ─────────────────────────────────────────────────────────

test('v1 backup (no ac field) decodes fine', () => {
  const payload: any = { v: 1, l: 'backup', ts: Date.now(), st: null, cy: [{ ...baseCycle }], dl: null }
  delete payload.cy[0].ac
  const decoded = decodeVelaData(encode(payload))
  assert.equal(decoded.v, 1)
  assert.equal((decoded.cy![0] as any).ac, undefined)
})

test('v2 backup (with ac field) decodes fine', () => {
  const payload: VelaExportPayload = { v: 2, l: 'backup', ts: Date.now(), st: null, cy: [{ ...baseCycle, ac: 1 }], dl: null }
  const decoded = decodeVelaData(encode(payload))
  assert.equal(decoded.v, 2)
  assert.equal(decoded.cy![0].ac, 1)
})

test('a future backup version is rejected', () => {
  const payload: any = { v: 99, l: 'backup', ts: Date.now(), st: null, cy: null, dl: null }
  assert.throws(() => decodeVelaData(encode(payload)), /newer version of Vela/)
})

// ── Cycle import planning ───────────────────────────────────────────────────

test('historical cycle fields are preserved on import', () => {
  const plan = planCycleImport([baseCycle], new Set(), true)
  assert.equal(plan.toInsert.length, 1)
  const c = plan.toInsert[0]
  assert.equal(c.startDate, baseCycle.sd)
  assert.equal(c.endDate, baseCycle.ed)
  assert.equal(c.periodLength, baseCycle.pl)
  assert.equal(c.cycleLength, baseCycle.cl)
  assert.equal(c.notes, baseCycle.n)
})

test('an existing active cycle is never touched: imported cycles land inactive when the DB is non-empty', () => {
  const plan = planCycleImport([{ ...baseCycle, ac: 1 }], new Set(), /* hasExistingCycles */ true)
  assert.equal(plan.toInsert[0].isActive, 0)
})

test('a cycle IS restored active only into a genuinely empty cycle table', () => {
  const plan = planCycleImport([{ ...baseCycle, ac: 1 }], new Set(), /* hasExistingCycles */ false)
  assert.equal(plan.toInsert[0].isActive, 1)
})

test('at most one restored cycle is ever marked active, even if the payload claims more than one', () => {
  const plan = planCycleImport(
    [{ ...baseCycle, sd: '2026-01-01', ac: 1 }, { ...baseCycle, sd: '2026-02-01', ac: 1 }],
    new Set(),
    false,
  )
  const activeCount = plan.toInsert.filter(c => c.isActive === 1).length
  assert.equal(activeCount, 1)
})

test('a cycle whose startDate already exists is skipped and counted, not duplicated', () => {
  const plan = planCycleImport(
    [baseCycle, { ...baseCycle, sd: '2026-03-01' }],
    new Set([baseCycle.sd]),
    true,
  )
  assert.equal(plan.toInsert.length, 1)
  assert.equal(plan.toInsert[0].startDate, '2026-03-01')
  assert.equal(plan.skipped, 1)
})

test('two cycles sharing a startDate WITHIN the same payload: only the first is kept, never both', () => {
  // A malformed/duplicated backup — nothing in the destination DB yet.
  const plan = planCycleImport(
    [{ ...baseCycle, sd: '2026-04-01', n: 'first' }, { ...baseCycle, sd: '2026-04-01', n: 'second' }],
    new Set(),
    true,
  )
  assert.equal(plan.toInsert.length, 1)
  assert.equal(plan.toInsert[0].notes, 'first')
  assert.equal(plan.skipped, 1)
})

test('an in-payload duplicate startDate is still rejected even when an unrelated existing cycle is also present', () => {
  const plan = planCycleImport(
    [
      { ...baseCycle, sd: '2026-05-01' },
      { ...baseCycle, sd: '2026-05-01' },
      { ...baseCycle, sd: '2026-06-01' },
    ],
    new Set(['2025-01-01']), // an existing cycle unrelated to either duplicate date
    true,
  )
  assert.equal(plan.toInsert.length, 2)
  assert.deepEqual(plan.toInsert.map(c => c.startDate), ['2026-05-01', '2026-06-01'])
  assert.equal(plan.skipped, 1)
})

// ── Daily log import planning ───────────────────────────────────────────────

test('a same-date existing log wins: the imported log is skipped, not overwritten', () => {
  const plan = planLogImport([baseLog], new Set([baseLog.d]))
  assert.equal(plan.toInsert.length, 0)
  assert.equal(plan.skipped, 1)
})

test('symptoms are not imported for a skipped (conflicting) log', () => {
  const plan = planLogImport([baseLog], new Set([baseLog.d]))
  const stillPresent = plan.toInsert.some(l => l.date === baseLog.d)
  assert.equal(stillPresent, false)
})

test('a new-date log is inserted with its symptoms intact', () => {
  const plan = planLogImport([baseLog], new Set())
  assert.equal(plan.toInsert.length, 1)
  assert.equal(plan.skipped, 0)
  assert.deepEqual(plan.toInsert[0].symptoms, baseLog.sy)
})

test('mixed conflicting/new logs: only the new one is planned, the conflict is counted', () => {
  const otherLog: ExportableDailyLog = { ...baseLog, d: '2026-02-02' }
  const plan = planLogImport([baseLog, otherLog], new Set([baseLog.d]))
  assert.equal(plan.toInsert.length, 1)
  assert.equal(plan.toInsert[0].date, otherLog.d)
  assert.equal(plan.skipped, 1)
})

// ── Round-trip ───────────────────────────────────────────────────────────────

test('export → decode → plan round-trip preserves cycle and log content into an empty DB', () => {
  const payload: VelaExportPayload = {
    v: 2,
    l: 'backup',
    ts: Date.now(),
    st: null,
    cy: [{ ...baseCycle, ac: 1 }],
    dl: [baseLog],
  }
  const decoded = decodeVelaData(encode(payload))
  const cyclePlan = planCycleImport(decoded.cy ?? [], new Set(), false)
  const logPlan = planLogImport(decoded.dl ?? [], new Set())

  assert.equal(cyclePlan.toInsert.length, 1)
  assert.equal(cyclePlan.skipped, 0)
  assert.deepEqual(
    { startDate: cyclePlan.toInsert[0].startDate, endDate: cyclePlan.toInsert[0].endDate, periodLength: cyclePlan.toInsert[0].periodLength, cycleLength: cyclePlan.toInsert[0].cycleLength, notes: cyclePlan.toInsert[0].notes },
    { startDate: baseCycle.sd, endDate: baseCycle.ed, periodLength: baseCycle.pl, cycleLength: baseCycle.cl, notes: baseCycle.n },
  )
  assert.equal(cyclePlan.toInsert[0].isActive, 1)

  assert.equal(logPlan.toInsert.length, 1)
  assert.equal(logPlan.skipped, 0)
  assert.deepEqual(logPlan.toInsert[0].symptoms, baseLog.sy)
})

console.log(`\n${passed} test(s) passed`)
if (process.exitCode) {
  console.error('SOME TESTS FAILED')
} else {
  console.log('ALL TESTS PASSED')
}
