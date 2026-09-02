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
  // v2+: whether this cycle was the active cycle at export time (1) or not
  // (0). Optional so v1 backups (which never had this field) still decode
  // and import fine — see planCycleImport for how it's used.
  ac?: number
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

const SCHEMA_VERSION = 2
// Highest payload version this build knows how to import. v1 (no `ac` field
// on cycles) and v2 are both supported — see decodeVelaData.
const MAX_SUPPORTED_SCHEMA_VERSION = 2

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
      ac: c.isActive ? 1 : 0,
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
      // The symptom_logs.intensity column is nullable at the schema level
      // (defaults to 1 on insert) but should never actually be exported as
      // null — fall back to the same default the DB itself uses.
      sy: symptomsByDate[log.date]?.map(s => ({ k: s.symptomKey, i: s.intensity ?? 1 })) ?? null,
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
      // The symptom_logs.intensity column is nullable at the schema level
      // (defaults to 1 on insert) but should never actually be exported as
      // null — fall back to the same default the DB itself uses.
      sy: symptomsByDate[log.date]?.map(s => ({ k: s.symptomKey, i: s.intensity ?? 1 })) ?? null,
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

    // Version gate: v1 (pre-`ac` field) and v2 are both understood. A
    // version newer than this build knows about is rejected outright
    // rather than silently importing it with unknown fields ignored —
    // existing v1 backups remain fully importable.
    if (payload.v < 1) {
      throw new Error('Invalid payload structure')
    }
    if (payload.v > MAX_SUPPORTED_SCHEMA_VERSION) {
      throw new Error(
        'NEWER_VERSION: This backup was created by a newer version of Vela. Update the app before importing it.',
      )
    }

    return payload
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('NEWER_VERSION: ')) {
      throw new Error(err.message.slice('NEWER_VERSION: '.length))
    }
    if (err instanceof Error && err.message.startsWith('Invalid')) {
      throw err
    }
    throw new Error('Invalid Vela export code. Make sure you copied it correctly.')
  }
}

// ─── Restore planning (pure — no DB import, safe to unit test in isolation) ───
//
// These functions decide *what* to do with each backup record given the
// destination's current state; they never touch the database themselves.
// `restore.service.ts` reads the existing state, calls these, then executes
// the resulting plan inside a transaction. Keeping the decision logic pure
// like this means it can be tested with plain `tsc` + `node`, with zero
// dependency on expo-sqlite/drizzle.

export interface CycleImportPlanItem {
  startDate:    string
  endDate:      string | null
  periodLength: number | null
  cycleLength:  number | null
  notes:        string | null
  isActive:     0 | 1
}

export interface CycleImportPlan {
  toInsert: CycleImportPlanItem[]
  skipped:  number
}

/**
 * Decide which backed-up cycles to insert and which to skip.
 *
 * - A cycle whose startDate already exists in the destination — OR whose
 *   startDate was already accepted earlier in this same payload — is
 *   skipped (counted, not inserted). The second half matters because a
 *   malformed/duplicated backup can otherwise contain two cycles with the
 *   same startDate; inserting both would leave two cycle rows for one date,
 *   and which one a given log's date resolves to (via findOwningCycle)
 *   would depend on undefined row-return order — this makes that
 *   impossible by construction instead of leaving it as a latent ambiguity.
 * - An imported cycle is only ever restored *active* when the destination
 *   has NO existing cycles at all (a genuinely empty cycle table) — this is
 *   what makes it structurally impossible for a restore to touch the user's
 *   real current active cycle: there is never an existing active cycle to
 *   conflict with in that case. At most one restored cycle is ever marked
 *   active, regardless of how many the payload claims were active.
 */
export function planCycleImport(
  cycles: ExportableCycle[],
  existingStartDates: ReadonlySet<string>,
  hasExistingCycles: boolean,
): CycleImportPlan {
  let skipped = 0
  let activeAssigned = false
  const toInsert: CycleImportPlanItem[] = []
  const acceptedStartDates = new Set<string>()

  for (const c of cycles) {
    if (existingStartDates.has(c.sd) || acceptedStartDates.has(c.sd)) {
      skipped++
      continue
    }
    acceptedStartDates.add(c.sd)

    const restoreActive = !hasExistingCycles && !activeAssigned && c.ac === 1
    if (restoreActive) activeAssigned = true

    toInsert.push({
      startDate:    c.sd,
      endDate:      c.ed,
      periodLength: c.pl,
      cycleLength:  c.cl,
      notes:        c.n,
      isActive:     restoreActive ? 1 : 0,
    })
  }

  return { toInsert, skipped }
}

export interface DailyLogImportPlanItem {
  date:         string
  flow:         string | null
  mood:         string | null
  energyLevel:  number | null
  sexualDesire: number | null
  temperature:  number | null
  weight:       number | null
  notes:        string | null
  symptoms:     ExportableSymptom[]
}

export interface DailyLogImportPlan {
  toInsert: DailyLogImportPlanItem[]
  skipped:  number
}

/**
 * Decide which backed-up daily logs to insert and which to skip.
 *
 * Preserve-existing-and-skip is the safe default: a log already present for
 * a given date is left untouched and the conflict is counted, rather than
 * overwritten. A log's symptoms only ever travel with it — if the log is
 * skipped, its symptoms are skipped too (the existing day's data, symptoms
 * included, is what's preserved).
 */
export function planLogImport(
  logs: ExportableDailyLog[],
  existingDates: ReadonlySet<string>,
): DailyLogImportPlan {
  let skipped = 0
  const toInsert: DailyLogImportPlanItem[] = []

  for (const log of logs) {
    if (existingDates.has(log.d)) {
      skipped++
      continue
    }

    toInsert.push({
      date:         log.d,
      flow:         log.f,
      mood:         log.m,
      energyLevel:  log.el,
      sexualDesire: log.sd,
      temperature:  log.tm,
      weight:       log.w,
      notes:        log.n,
      symptoms:     log.sy ?? [],
    })
  }

  return { toInsert, skipped }
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
