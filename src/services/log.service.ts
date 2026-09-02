import { eq, gte, lte, and, desc } from 'drizzle-orm'
import { parseISO, startOfDay } from 'date-fns'
import { db } from '../db/client'
import { dailyLogs, symptomLogs } from '../db/schema'
import type { DailyLog, NewDailyLog, SymptomLog, NewSymptomLog } from '../db/schema'
import { nowISO, toDateStr } from '../utils/date'

export interface DailyLogWithSymptoms extends DailyLog {
  symptoms: SymptomLog[]
}

export const logService = {
  // ── Daily logs ─────────────────────────────────────────────────────────────
  async getByDate(date: string): Promise<DailyLog | null> {
    const rows = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.date, date))
      .limit(1)
    return rows[0] ?? null
  },

  async getByDateWithSymptoms(date: string): Promise<DailyLogWithSymptoms | null> {
    const log = await logService.getByDate(date)
    if (!log) return null
    const symptoms = await db
      .select()
      .from(symptomLogs)
      .where(eq(symptomLogs.date, date))
    return { ...log, symptoms }
  },

  async getRange(startDate: string, endDate: string): Promise<DailyLog[]> {
    return db
      .select()
      .from(dailyLogs)
      .where(and(gte(dailyLogs.date, startDate), lte(dailyLogs.date, endDate)))
      .orderBy(desc(dailyLogs.date))
  },

  async upsertLog(date: string, data: Partial<NewDailyLog>): Promise<DailyLog> {
    // Validate date is not in the future
    const logDate = startOfDay(parseISO(date))
    const today = startOfDay(new Date())
    
    if (logDate > today) {
      throw new Error('Future dates cannot be logged.')
    }

    const existing = await logService.getByDate(date)

    if (existing) {
      const updated = await db
        .update(dailyLogs)
        .set({ ...data, updatedAt: nowISO() })
        .where(eq(dailyLogs.date, date))
        .returning()
      return updated[0]
    } else {
      const inserted = await db
        .insert(dailyLogs)
        .values({
          date,
          ...data,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        })
        .returning()
      return inserted[0]
    }
  },

  async deleteLog(date: string): Promise<void> {
    await db.delete(symptomLogs).where(eq(symptomLogs.date, date))
    await db.delete(dailyLogs).where(eq(dailyLogs.date, date))
  },

  // ── Symptoms ───────────────────────────────────────────────────────────────
  async getSymptomsForDate(date: string): Promise<SymptomLog[]> {
    return db
      .select()
      .from(symptomLogs)
      .where(eq(symptomLogs.date, date))
  },

  async setSymptoms(
    date: string,
    dailyLogId: number,
    symptoms: { key: string; intensity?: number }[]
  ): Promise<void> {
    // Replace all symptoms for this date
    await db.delete(symptomLogs).where(eq(symptomLogs.date, date))

    if (symptoms.length === 0) return

    await db.insert(symptomLogs).values(
      symptoms.map(s => ({
        date,
        dailyLogId,
        symptomKey: s.key,
        intensity:  s.intensity ?? 1,
        createdAt:  nowISO(),
      }))
    )
  },

  async getRecentLogs(limit = 30): Promise<DailyLog[]> {
    return db
      .select()
      .from(dailyLogs)
      .orderBy(desc(dailyLogs.date))
      .limit(limit)
  },

  // Full log history (with symptoms/moods joined in) for on-device analysis
  // such as Home's insight and pattern detection. `limit` bounds how many
  // daily_logs rows are considered — plenty for several years of daily
  // tracking on a personal-health dataset this size.
  async getHistoryWithSymptoms(limit = 400): Promise<DailyLogWithSymptoms[]> {
    const logs = await db
      .select()
      .from(dailyLogs)
      .orderBy(desc(dailyLogs.date))
      .limit(limit)

    if (logs.length === 0) return []

    const oldestDate = logs[logs.length - 1].date
    const symptomRows = await db
      .select()
      .from(symptomLogs)
      .where(gte(symptomLogs.date, oldestDate))

    const symptomsByDate = new Map<string, SymptomLog[]>()
    for (const row of symptomRows) {
      const existing = symptomsByDate.get(row.date) ?? []
      existing.push(row)
      symptomsByDate.set(row.date, existing)
    }

    return logs.map(log => ({
      ...log,
      symptoms: symptomsByDate.get(log.date) ?? [],
    }))
  },

  // Check if any period flow is logged for a date range
  async getFlowDates(startDate: string, endDate: string): Promise<string[]> {
    const logs = await db
      .select({ date: dailyLogs.date })
      .from(dailyLogs)
      .where(
        and(
          gte(dailyLogs.date, startDate),
          lte(dailyLogs.date, endDate)
        )
      )
    return logs
      .filter(l => l.date)
      .map(l => l.date)
  },
}
