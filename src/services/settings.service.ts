import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { settings } from '../db/schema'
import { nowISO } from '../utils/date'

export const settingsService = {
  async get<T = string>(key: string): Promise<T | null> {
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
    if (!rows.length) return null
    try {
      return JSON.parse(rows[0].value) as T
    } catch {
      return rows[0].value as unknown as T
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    const serialised = JSON.stringify(value)
    await db
      .insert(settings)
      .values({ key, value: serialised, updatedAt: nowISO() })
      .onConflictDoUpdate({ target: settings.key, set: { value: serialised, updatedAt: nowISO() } })
  },

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await db.select().from(settings)
    return Object.fromEntries(
      rows.map(r => {
        try { return [r.key, JSON.parse(r.value)] }
        catch { return [r.key, r.value] }
      })
    )
  },

  async delete(key: string): Promise<void> {
    await db.delete(settings).where(eq(settings.key, key))
  },
}
