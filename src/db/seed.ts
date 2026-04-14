import { db } from './client'
import { cycles, dailyLogs, symptomLogs, settings } from './schema'
import { format, subDays, subMonths } from 'date-fns'

const now = () => new Date().toISOString()
const dateStr = (d: Date) => format(d, 'yyyy-MM-dd')

export async function seedDatabase(): Promise<void> {
  try {
    // Check if already seeded
    const existing = await db.select().from(cycles).limit(1)
    if (existing.length > 0) return

    const today = new Date()

    // Seed 4 past cycles
    const cycleStarts = [
      subDays(today, 5),          // current period (active)
      subDays(today, 33),         // cycle 2
      subDays(today, 61),         // cycle 3
      subDays(today, 90),         // cycle 4
    ]

    const cycleLengths = [28, 29, 27, 28]
    const periodLengths = [5, 6, 5, 5]

    for (let i = 0; i < cycleStarts.length; i++) {
      const startDate = dateStr(cycleStarts[i])
      const isActive = i === 0 ? 1 : 0
      const cycleLength = i === 0 ? null : cycleLengths[i]
      const periodLength = periodLengths[i]

      await db.insert(cycles).values({
        startDate,
        endDate: i === 0 ? null : dateStr(subDays(cycleStarts[i], -periodLengths[i] + 1)),
        periodLength,
        cycleLength,
        isActive,
        createdAt: now(),
        updatedAt: now(),
      })
    }

    // Seed today's log
    await db.insert(dailyLogs).values({
      date: dateStr(today),
      cycleId: 1,
      flow: 'medium',
      mood: 'tired',
      energyLevel: 2,
      notes: 'Feeling a bit crampy today',
      createdAt: now(),
      updatedAt: now(),
    })

    await db.insert(symptomLogs).values([
      { date: dateStr(today), dailyLogId: 1, symptomKey: 'cramps', intensity: 2, createdAt: now() },
      { date: dateStr(today), dailyLogId: 1, symptomKey: 'bloating', intensity: 1, createdAt: now() },
    ])

    // Seed yesterday
    const yesterday = subDays(today, 1)
    await db.insert(dailyLogs).values({
      date: dateStr(yesterday),
      cycleId: 1,
      flow: 'heavy',
      mood: 'sad',
      energyLevel: 1,
      createdAt: now(),
      updatedAt: now(),
    })

    await db.insert(symptomLogs).values([
      { date: dateStr(yesterday), dailyLogId: 2, symptomKey: 'cramps', intensity: 3, createdAt: now() },
      { date: dateStr(yesterday), dailyLogId: 2, symptomKey: 'headache', intensity: 2, createdAt: now() },
      { date: dateStr(yesterday), dailyLogId: 2, symptomKey: 'fatigue', intensity: 2, createdAt: now() },
    ])

    // Seed default settings
    const defaultSettings = [
      { key: 'theme', value: '"rose"' },
      { key: 'biometric_enabled', value: 'false' },
      { key: 'average_cycle_length', value: '28' },
      { key: 'average_period_length', value: '5' },
      { key: 'notifications_enabled', value: 'true' },
      { key: 'notify_period_days_before', value: '2' },
      { key: 'notify_fertile_window', value: 'true' },
      { key: 'notify_ovulation', value: 'true' },
      { key: 'onboarding_complete', value: 'true' },
      { key: 'is_premium', value: 'false' },
      { key: 'first_day_of_week', value: '"monday"' },
      { key: 'temperature_unit', value: '"celsius"' },
    ]

    for (const s of defaultSettings) {
      await db.insert(settings).values({ ...s, updatedAt: now() }).onConflictDoNothing()
    }

    console.log('[Vela] Seed complete')
  } catch (err) {
    console.error('[Vela] Seed error:', err)
  }
}
