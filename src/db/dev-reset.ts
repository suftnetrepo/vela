/**
 * dev-reset.ts
 * ────────────────────────────────────────────────────────────────────────
 * DEV-ONLY utility for resetting and reseeding database with clean test data.
 * This file should NEVER be used in production.
 * 
 * Usage (from store/auth or similar context):
 *   import { resetAndReseedDatabase } from '@/src/db/dev-reset'
 *   await resetAndReseedDatabase()
 */

import { db } from './client'
import { cycles, dailyLogs, symptomLogs } from './schema'
import { format, subDays } from 'date-fns'
import { sql } from 'drizzle-orm'

const now = () => new Date().toISOString()
const dateStr = (d: Date) => format(d, 'yyyy-MM-dd')

/**
 * Clear all cycles and related logging records
 */
async function clearAllCycles(): Promise<void> {
  console.log('[Vela DevReset] Clearing symptom logs...')
  await db.delete(symptomLogs)
  
  console.log('[Vela DevReset] Clearing daily logs...')
  await db.delete(dailyLogs)
  
  console.log('[Vela DevReset] Clearing cycles...')
  await db.delete(cycles)
  
  console.log('[Vela DevReset] Data cleared ✓')
}

/**
 * Reseed with realistic cycle data (7 completed + 1 active)
 */
async function reseedRealisticCycles(): Promise<void> {
  console.log('[Vela DevReset] Reseeding realistic cycle data...')
  
  const today = new Date()
  
  // Create 7 completed past cycles with realistic spacing
  // Each cycle is typically 26-32 days, spread backward from today
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
  
  console.log(`[Vela DevReset] ✓ Seeded ${completedCycles.length} completed cycles`)

  // Create current/active cycle (started ~30 days ago, still ongoing)
  const activeCycleStart = subDays(today, 12)
  await db.insert(cycles).values({
    startDate: dateStr(activeCycleStart),
    endDate: null,
    periodLength: null, // Not ended yet
    cycleLength: null, // Not closed yet
    isActive: 1,
    createdAt: now(),
    updatedAt: now(),
  })
  
  console.log('[Vela DevReset] ✓ Seeded 1 active cycle')
  console.log('[Vela DevReset] Reseed complete ✓')
}

/**
 * Main reset function - clears everything and reseeds
 */
export async function resetAndReseedDatabase(): Promise<void> {
  try {
    console.log('\n🔄 [Vela DevReset] Starting database reset...\n')
    
    await clearAllCycles()
    await reseedRealisticCycles()
    
    console.log('\n✅ [Vela DevReset] Database reset and reseed complete!\n')
    console.log('   → Cleared all cycles and logs')
    console.log('   → Seeded 7 completed cycles (26–30 day spans)')
    console.log('   → Seeded 1 active cycle (12 days in)')
    console.log('   → All data is realistic and valid\n')
    
  } catch (error) {
    console.error('[Vela DevReset] Error during reset:', error)
    throw error
  }
}

/**
 * Alternative: Just reseed without clearing (for fresh start)
 */
export async function reseedDatabase(): Promise<void> {
  try {
    const existing = await db.select().from(cycles).limit(1)
    if (existing.length > 0) {
      console.log('[Vela DevReset] Cycles already exist. Use resetAndReseedDatabase() to force reset.')
      return
    }
    
    await reseedRealisticCycles()
  } catch (error) {
    console.error('[Vela DevReset] Error during reseed:', error)
    throw error
  }
}
