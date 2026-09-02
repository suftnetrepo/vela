/**
 * restore.service
 *
 * Dedicated backup-restore pathway — deliberately separate from
 * cycle.service/log.service's normal user-facing functions. Restoring
 * historical data is not the same operation as a user logging today:
 * `cycleService.startNewCycle()` closes whatever cycle is currently active
 * and always marks the new one active, which is exactly wrong for
 * reconstructing a backup (see planCycleImport's doc comment for the
 * conflict rule that replaces it).
 *
 * The whole restore runs inside one `db.transaction(...)` against the
 * transaction-scoped `tx` — not the module-level `db` that
 * cycle.service/log.service use — because a call through those services
 * from inside a transaction callback would silently execute outside it
 * (drizzle-orm/expo-sqlite's transaction is a synchronous BEGIN → callback →
 * COMMIT/ROLLBACK wrapper around the same underlying connection; a query
 * issued via the top-level `db` handle bypasses that wrapper entirely).
 * That's why this file talks to the schema tables directly instead of going
 * through those services.
 */
import { db } from '../db/client'
import { cycles, dailyLogs, symptomLogs, settings } from '../db/schema'
import { nowISO } from '../utils/date'
import {
  planCycleImport,
  planLogImport,
  payloadToSettings,
} from './velaDataService'
import type { VelaExportPayload } from './velaDataService'

export interface RestoreResult {
  importedCycles: number
  skippedCycles:  number
  importedLogs:   number
  skippedLogs:    number
}

export async function restoreBackup(payload: VelaExportPayload): Promise<RestoreResult> {
  // Reads happen before the transaction opens — planning only needs a
  // snapshot of what already exists, and expo-sqlite's connection is
  // single-threaded/synchronous under drizzle here, so nothing can race
  // between this read and the write below.
  const existingCycles = await db.select({ startDate: cycles.startDate, isActive: cycles.isActive }).from(cycles)
  const existingStartDates = new Set(existingCycles.map(c => c.startDate))
  const hasExistingCycles = existingCycles.length > 0

  const existingLogs = await db.select({ date: dailyLogs.date }).from(dailyLogs)
  const existingLogDates = new Set(existingLogs.map(l => l.date))

  const cyclePlan = planCycleImport(payload.cy ?? [], existingStartDates, hasExistingCycles)
  const logPlan = planLogImport(payload.dl ?? [], existingLogDates)
  const settingsMap = payload.st ? payloadToSettings(payload) : {}

  const result: RestoreResult = {
    importedCycles: 0,
    skippedCycles:  cyclePlan.skipped,
    importedLogs:   0,
    skippedLogs:    logPlan.skipped,
  }

  // Nothing to write — skip opening a transaction at all.
  if (cyclePlan.toInsert.length === 0 && logPlan.toInsert.length === 0 && Object.keys(settingsMap).length === 0) {
    return result
  }

  await db.transaction(tx => {
    for (const [key, value] of Object.entries(settingsMap)) {
      const serialised = JSON.stringify(value)
      tx.insert(settings)
        .values({ key, value: serialised, updatedAt: nowISO() })
        .onConflictDoUpdate({ target: settings.key, set: { value: serialised, updatedAt: nowISO() } })
        .run()
    }

    for (const c of cyclePlan.toInsert) {
      tx.insert(cycles)
        .values({
          startDate:    c.startDate,
          endDate:      c.endDate,
          periodLength: c.periodLength,
          cycleLength:  c.cycleLength,
          notes:        c.notes,
          isActive:     c.isActive,
          createdAt:    nowISO(),
          updatedAt:    nowISO(),
        })
        .run()
      result.importedCycles++
    }

    for (const log of logPlan.toInsert) {
      const inserted = tx
        .insert(dailyLogs)
        .values({
          date:         log.date,
          flow:         log.flow,
          mood:         log.mood,
          energyLevel:  log.energyLevel,
          sexualDesire: log.sexualDesire,
          temperature:  log.temperature,
          weight:       log.weight,
          notes:        log.notes,
          createdAt:    nowISO(),
          updatedAt:    nowISO(),
        })
        .returning({ id: dailyLogs.id })
        .get()

      result.importedLogs++

      if (log.symptoms.length > 0) {
        tx.insert(symptomLogs)
          .values(
            log.symptoms.map(s => ({
              date:       log.date,
              dailyLogId: inserted.id,
              symptomKey: s.k,
              intensity:  s.i,
              createdAt:  nowISO(),
            })),
          )
          .run()
      }
    }
  })

  return result
}
