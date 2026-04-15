import { db } from './client'
import { cycles, dailyLogs, symptomLogs, settings } from './schema'
import { format, subDays } from 'date-fns'

const now = () => new Date().toISOString()
const dateStr = (d: Date) => format(d, 'yyyy-MM-dd')

export async function seedDatabase(): Promise<void> {
  try {
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('[🌱 VELA BOOT] Starting seed check')
    console.log('═══════════════════════════════════════════════════════════════\n')

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
      console.log('[🌱 VELA BOOT] ✓ Database already seeded (preserving user state)')
      console.log('[🌱 VELA BOOT] ✓ No forced reset on this boot\n')
      return
    }

    console.log('[🌱 VELA BOOT] → Database empty, initializing first-boot data')

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
    
    console.log('[🌱 VELA BOOT] ✓ Cycles: Seeded 7 completed + 1 active')

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
    
    console.log('[🌱 VELA BOOT] ✓ Logs: Seeded sample daily logs and symptoms')

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

      console.log('[🌱 VELA BOOT] ✓ Settings: Seeded defaults (onboarding_complete=FALSE)')
    } else {
      console.log('[🌱 VELA BOOT] ✓ Settings: Table exists, preserving user settings')
    }
    console.log('[🌱 VELA BOOT] ✓ SUCCESS: First-boot data initialized\n')
    
  } catch (err) {
    console.error('[Vela Seed] Error:', err)
  }
}
