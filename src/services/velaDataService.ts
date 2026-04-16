/**
 * velaDataService
 *
 * Encodes cycle data, daily logs, and settings into a compact shareable payload.
 * Format: base64(JSON) — works as a copy-paste code or embedded in a QR.
 *
 * Three export levels:
 * - SETTINGS: Only user preferences (theme, temperature unit, first day of week)
 * - BACKUP: Settings + all cycles + daily logs + symptoms
 * - SELECTIVE: User-chosen data (specific date ranges, cycle ranges)
 *
 * Privacy-first: Personal sensitive data (PIN hash, biometric, premium status) never exported.
 */
import type { Cycle, DailyLog, SymptomLog, Setting } from '../db/schema'

// ─── Payload Shapes ───────────────────────────────────────────────────────────

export interface ExportableSettings {
  theme?: string                    // 'light' | 'dark'
  tempUnit?: string                 // 'C' | 'F'
  firstDayOfWeek?: string            // 'MON' | 'SUN'
  cycleNotificiations?: boolean     // notify_period_days_before
}

export interface ExportableCycle {
  sd: string                         // startDate (YYYY-MM-DD)
  ed: string | null                  // endDate
  pl: number | null                  // periodLength
  cl: number | null                  // cycleLength
  n:  string | null                  // notes
}

export interface ExportableDailyLog {
  d:  string                         // date (YYYY-MM-DD)
  f:  string | null                  // flow
  m:  string | null                  // mood
  el: number | null                  // energyLevel (1-10)
  sd: number | null                  // sexualDesire (1-10)
  tm: number | null                  // temperature
  w:  number | null                  // weight
  n:  string | null                  // notes
  sy: ExportableSymptom[] | null     // symptoms
}

export interface ExportableSymptom {
  k:  string                         // symptomKey
  i:  number                         // intensity (1-5)
}

export type ExportLevel = 'settings' | 'backup' | 'selective'

export interface VelaExportPayload {
  v:  number                          // schema version
  l:  ExportLevel                     // export level
  ts: number                          // timestamp (ms) — when exported
  st: ExportableSettings | null       // settings (if included)
  cy: ExportableCycle[] | null        // cycles (if included)
  dl: ExportableDailyLog[] | null     // daily logs (if included)
}

const SCHEMA_VERSION = 1

// ─── Export Functions ─────────────────────────────────────────────────────────

/**
 * Export user preferences only (safe to share)
 */
export function exportSettings(settings: Setting[]): string {
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  const payload: VelaExportPayload = {
    v:  SCHEMA_VERSION,
    l:  'settings',
    ts: Date.now(),
    st: {
      theme:               settingsMap['theme'],
      tempUnit:           settingsMap['temperature_unit'],
      firstDayOfWeek:     settingsMap['first_day_of_week'],
      cycleNotificiations: settingsMap['notify_fertile_window'] === '1',
    },
    cy: null,
    dl: null,
  }

  return encodePayload(payload)
}

/**
 * Export complete cycle history + daily logs for full backup
 */
export function exportBackup(
  cycles: Cycle[],
  dailyLogs: DailyLog[],
  symptomLogs: SymptomLog[],
  settings: Setting[]
): string {
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  // Group symptoms by date
  const symptomsByDate = symptomLogs.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {} as Record<string, SymptomLog[]>)

  const payload: VelaExportPayload = {
    v:  SCHEMA_VERSION,
    l:  'backup',
    ts: Date.now(),
    st: {
      theme:              settingsMap['theme'],
      tempUnit:          settingsMap['temperature_unit'],
      firstDayOfWeek:    settingsMap['first_day_of_week'],
    },
    cy: cycles.map(c => ({
      sd: c.startDate,
      ed: c.endDate ?? null,
      pl: c.periodLength ?? null,
      cl: c.cycleLength ?? null,
      n:  c.notes ?? null,
    })),
    dl: dailyLogs.map(log => ({
      d:  log.date,
      f:  log.flow ?? null,
      m:  log.mood ?? null,
      el: log.energyLevel ?? null,
      sd: log.sexualDesire ?? null,
      tm: log.temperature ?? null,
      w:  log.weight ?? null,
      n:  log.notes ?? null,
      sy: symptomsByDate[log.date]?.map(s => ({ k: s.symptomKey, i: s.intensity })) ?? null,
    })),
  }

  return encodePayload(payload)
}

/**
 * Export selected date range (e.g., 3 months of data)
 */
export function exportSelective(
  dailyLogs: DailyLog[],
  symptomLogs: SymptomLog[],
  startDate: string,
  endDate: string,
  settings: Setting[]
): string {
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  // Filter by date range
  const filtered = dailyLogs.filter(l => l.date >= startDate && l.date <= endDate)

  // Group symptoms by date
  const symptomsByDate = symptomLogs.reduce((acc, s) => {
    if (s.date >= startDate && s.date <= endDate) {
      if (!acc[s.date]) acc[s.date] = []
      acc[s.date].push(s)
    }
    return acc
  }, {} as Record<string, SymptomLog[]>)

  const payload: VelaExportPayload = {
    v:  SCHEMA_VERSION,
    l:  'selective',
    ts: Date.now(),
    st: {
      tempUnit:      settingsMap['temperature_unit'],
      firstDayOfWeek: settingsMap['first_day_of_week'],
    },
    cy: null,
    dl: filtered.map(log => ({
      d:  log.date,
      f:  log.flow ?? null,
      m:  log.mood ?? null,
      el: log.energyLevel ?? null,
      sd: log.sexualDesire ?? null,
      tm: log.temperature ?? null,
      w:  log.weight ?? null,
      n:  log.notes ?? null,
      sy: symptomsByDate[log.date]?.map(s => ({ k: s.symptomKey, i: s.intensity })) ?? null,
    })),
  }

  return encodePayload(payload)
}

// ─── Import Functions ─────────────────────────────────────────────────────────

/**
 * Decode and validate payload
 */
export function decodeVelaData(code: string): VelaExportPayload {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())))
    const payload = JSON.parse(json) as VelaExportPayload

    // Validate structure
    if (
      typeof payload.v  !== 'number' ||
      typeof payload.l  !== 'string' ||
      typeof payload.ts !== 'number'
    ) {
      throw new Error('Invalid payload structure')
    }

    if (!['settings', 'backup', 'selective'].includes(payload.l)) {
      throw new Error(`Invalid export level: ${payload.l}`)
    }

    return payload
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid')) {
      throw err
    }
    throw new Error('Invalid Vela export code. Make sure you copied it correctly.')
  }
}

/**
 * Transform payload to database insert format
 */
export function payloadToCycles(payload: VelaExportPayload): Omit<Cycle, 'id' | 'createdAt' | 'updatedAt'>[] {
  if (!payload.cy) return []

  return payload.cy.map(c => ({
    startDate:  c.sd,
    endDate:    c.ed,
    periodLength: c.pl,
    cycleLength: c.cl,
    isActive:   0, // Imported cycles are always inactive
    notes:      c.n,
  }))
}

export function payloadToDailyLogs(
  payload: VelaExportPayload
): Omit<DailyLog, 'id' | 'createdAt' | 'updatedAt'>[] {
  if (!payload.dl) return []

  return payload.dl.map(log => ({
    date:         log.d,
    cycleId:      null, // Will be linked after import, user choice
    flow:         log.f,
    mood:         log.m,
    energyLevel:  log.el,
    sexualDesire: log.sd,
    temperature:  log.tm,
    weight:       log.w,
    notes:        log.n,
  }))
}

export function payloadToSymptomLogs(
  payload: VelaExportPayload
): Omit<SymptomLog, 'id' | 'createdAt'>[] {
  if (!payload.dl) return []

  const symptoms: Omit<SymptomLog, 'id' | 'createdAt'>[] = []

  payload.dl.forEach(log => {
    if (log.sy && Array.isArray(log.sy)) {
      log.sy.forEach(sym => {
        symptoms.push({
          date:       log.d,
          dailyLogId: null, // Will be linked after daily log inserted
          symptomKey: sym.k,
          intensity:  sym.i,
        })
      })
    }
  })

  return symptoms
}

export function payloadToSettings(payload: VelaExportPayload): Record<string, string> {
  const result: Record<string, string> = {}

  if (payload.st) {
    if (payload.st.theme) result['theme'] = payload.st.theme
    if (payload.st.tempUnit) result['temperature_unit'] = payload.st.tempUnit
    if (payload.st.firstDayOfWeek) result['first_day_of_week'] = payload.st.firstDayOfWeek
  }

  return result
}

// ─── Encoding/Decoding Utilities ──────────────────────────────────────────────

/**
 * Encode payload to base64
 */
function encodePayload(payload: VelaExportPayload): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

/**
 * Get human-readable summary of export
 */
export function getPayloadSummary(payload: VelaExportPayload): {
  cycles: number
  logs: number
  symptoms: number
  dateRange?: string
} {
  const cycleCount = payload.cy?.length ?? 0
  const logCount = payload.dl?.length ?? 0
  const symptomCount = payload.dl?.reduce((sum, log) => sum + (log.sy?.length ?? 0), 0) ?? 0

  let dateRange: string | undefined
  if (payload.dl && payload.dl.length > 0) {
    const dates = payload.dl.map(l => l.d).sort()
    if (dates.length > 1) {
      dateRange = `${dates[0]} to ${dates[dates.length - 1]}`
    } else {
      dateRange = dates[0]
    }
  }

  return {
    cycles: cycleCount,
    logs: logCount,
    symptoms: symptomCount,
    dateRange,
  }
}
