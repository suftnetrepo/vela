import { eq, desc, asc } from 'drizzle-orm'
import { db } from '../db/client'
import { cycles, dailyLogs } from '../db/schema'
import type { Cycle, NewCycle } from '../db/schema'
import { nowISO, toDateStr } from '../utils/date'

export const cycleService = {
  async getAll(): Promise<Cycle[]> {
    return db.select().from(cycles).orderBy(asc(cycles.startDate))
  },

  async getActive(): Promise<Cycle | null> {
    const rows = await db
      .select()
      .from(cycles)
      .where(eq(cycles.isActive, 1))
      .orderBy(desc(cycles.startDate))
      .limit(1)
    return rows[0] ?? null
  },

  async getRecent(limit = 6): Promise<Cycle[]> {
    return db
      .select()
      .from(cycles)
      .orderBy(desc(cycles.startDate))
      .limit(limit)
  },

  async getById(id: number): Promise<Cycle | null> {
    const rows = await db.select().from(cycles).where(eq(cycles.id, id)).limit(1)
    return rows[0] ?? null
  },

  async startNewCycle(startDate: Date): Promise<Cycle> {
    const dateStr = toDateStr(startDate)

    // Close any active cycle
    const active = await cycleService.getActive()
    if (active) {
      const start  = new Date(active.startDate)
      const length = Math.round((startDate.getTime() - start.getTime()) / 86400000)
      await db
        .update(cycles)
        .set({
          isActive:    0,
          cycleLength: length,
          updatedAt:   nowISO(),
        })
        .where(eq(cycles.id, active.id))
    }

    const inserted = await db
      .insert(cycles)
      .values({
        startDate:  dateStr,
        isActive:   1,
        createdAt:  nowISO(),
        updatedAt:  nowISO(),
      })
      .returning()

    return inserted[0]
  },

  async endCurrentCycle(endDate: Date, periodLength: number): Promise<void> {
    const active = await cycleService.getActive()
    if (!active) return
    await db
      .update(cycles)
      .set({
        endDate:      toDateStr(endDate),
        periodLength,
        updatedAt:    nowISO(),
      })
      .where(eq(cycles.id, active.id))
  },

  async updateCycle(id: number, data: Partial<NewCycle>): Promise<void> {
    await db
      .update(cycles)
      .set({ ...data, updatedAt: nowISO() })
      .where(eq(cycles.id, id))
  },

  // Deleting a cycle must keep the promise the Insights confirm-dialog
  // already makes to the user — "your daily logs are kept, only the cycle
  // record is removed." Because dailyLogs.cycle_id is a foreign key to
  // cycles.id with foreign_keys=ON and no ON DELETE clause, SQLite's default
  // NO ACTION would reject the delete outright if any log still references
  // this cycle. So: null out the references first, then delete the cycle,
  // both inside one transaction — if either step fails, neither happens.
  // classifyLogs() (src/algorithm/cycleHistory.ts) already resolves a log's
  // owning cycle by date whenever cycleId is null, so nulling these
  // references doesn't change how Insights/Patterns/Prediction see them.
  async deleteCycle(id: number): Promise<void> {
    await db.transaction(tx => {
      tx.update(dailyLogs)
        .set({ cycleId: null, updatedAt: nowISO() })
        .where(eq(dailyLogs.cycleId, id))
        .run()
      tx.delete(cycles).where(eq(cycles.id, id)).run()
    })
  },

  // Returns confirmed cycles (with a cycleLength) ordered oldest→newest
  async getConfirmedCycles(): Promise<Cycle[]> {
    const all = await db
      .select()
      .from(cycles)
      .orderBy(asc(cycles.startDate))

    // Include all cycles — active one may not have cycleLength yet
    return all
  },
}
