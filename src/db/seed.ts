import { db } from './client'
import { cycles, dailyLogs, symptomLogs, settings } from './schema'
import { format, subDays } from 'date-fns'

const now = () => new Date().toISOString()
const dateStr = (d: Date) => format(d, 'yyyy-MM-dd')

export async function seedDatabase(): Promise<void> {
  try {
    // CRITICAL: Only seed if the database is completely empty.
    // This preserves user's persisted onboarding state, cycle data, and settings.
    //
    // IMPORTANT: In development, do NOT force-reset on boot — that breaks onboarding
    // testing and makes dev behavior non-representative of production.
    //
    // If you need to manually reset your dev data, use the dev-reset utility:
    //   import { resetAndReseedDatabase } from '@/src/db/dev-reset'
    //   await resetAndReseedDatabase()
    //
    // Check if already seeded
    const existing = await db.select().from(cycles).limit(1)
    if (existing.length > 0) {
      console.log('[Vela Seed] Database already seeded, skipping...')
      return
    }

    const today = new Date()

    // ─── CLEAN REALISTIC CYCLE DATA ───────────────────────────────────
    // 7 completed cycles with realistic spacing (26-30 days each)
    // + 1 active cycle (currently ongoing at day 12)
    // ───────────────────────────────────────────────────────────────

    const completedCycles = [
      // Working backward from today
      { startOffset: 268, cycleLength: 28, periodLength: 5 },  // ~9 months ago
      { startOffset: 240, cycleLength: 29, periodLength: 5 },  // ~8 months ago
      { startOffset: 211, cycleLength: 28, periodLength: 6 },  // ~7 months ago
      { startOffset: 183, cycleLength: 30, periodLength: 4 },  // ~6 months ago
      { startOffset: 153, cycleLength: 27, periodLength: 5 },  // ~5 months ago
      { startOffset: 126, cycleLength: 28, periodLength: 5 },  // ~4 months ago
      { startOffset: 98,  cycleLength: 29, periodLength: 6 },  // ~3 months ago
    ]

    for (const cycle of completedCycles) {
      const startDate = subDays(today, cycle.startOffset)
      const endDate = subDays(startDate, -cycle.periodLength + 1)
      
      await db.insert(cycles).values({
        startDate: dateStr(startDate),
        endDate: dateStr(endDate),
        periodLength: cycle.periodLength,
        cycleLength: cycle.cycleLength,
        isActive: 0,
        createdAt: now(),
        updatedAt: now(),
      })
    }
    
    console.log('[Vela Seed] ✓ Seeded 7 completed cycles')

    // Active cycle (started ~12 days ago, still ongoing)
    const activeCycleStart = subDays(today, 12)
    const activeCycleId = await db
      .insert(cycles)
      .values({
        startDate: dateStr(activeCycleStart),
        endDate: null,
        periodLength: null,
        cycleLength: null,
        isActive: 1,
        createdAt: now(),
        updatedAt: now(),
      })
      .returning()
    
    console.log('[Vela Seed] ✓ Seeded 1 active cycle (day 12)')

    // ─── SAMPLE DAILY LOG DATA ───────────────────────────────────────

    // Today's log (active cycle)
    if (activeCycleId.length > 0) {
      const todayLog = await db
        .insert(dailyLogs)
        .values({
          date: dateStr(today),
          cycleId: activeCycleId[0].id,
          flow: 'light',
          mood: 'neutral',
          energyLevel: 3,
          notes: 'Regular day',
          createdAt: now(),
          updatedAt: now(),
        })
        .returning()

      if (todayLog.length > 0) {
        await db.insert(symptomLogs).values([
          { date: dateStr(today), dailyLogId: todayLog[0].id, symptomKey: 'breast_tenderness', intensity: 1, createdAt: now() },
        ])
      }
    }

    console.log('[Vela Seed] ✓ Seeded sample daily logs')

    // ─── DEFAULT SETTINGS ────────────────────────────────────────────
    // Only seed default settings if the table is completely empty.
    // This ensures:
    // 1. First-time users start with onboarding_complete = false
    // 2. Existing users' settings are never overridden
    const existingSettings = await db.select().from(settings).limit(1)
    if (existingSettings.length === 0) {
      const defaultSettings = [
        { key: 'theme', value: '"rose"' },
        { key: 'biometric_enabled', value: 'false' },
        { key: 'average_cycle_length', value: '28' },
        { key: 'average_period_length', value: '5' },
        { key: 'notifications_enabled', value: 'true' },
        { key: 'notify_period_days_before', value: '2' },
        { key: 'notify_fertile_window', value: 'true' },
        { key: 'notify_ovulation', value: 'true' },
        { key: 'onboarding_complete', value: 'false' }, // ← MUST be false on first boot
        { key: 'is_premium', value: 'false' },
        { key: 'first_day_of_week', value: '"monday"' },
        { key: 'temperature_unit', value: '"celsius"' },
      ]

      for (const s of defaultSettings) {
        await db.insert(settings).values({ ...s, updatedAt: now() }).onConflictDoNothing()
      }

      console.log('[Vela Seed] ✓ Seeded default settings (first-time boot)')
    }
    console.log('[Vela Seed] ✓ Seed complete - realistic test data ready')
    
  } catch (err) {
    console.error('[Vela Seed] Error:', err)
  }
}
