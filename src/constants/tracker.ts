// ─── Tracker units and formatting ────────────────────────────────────────────

export const TRACKER_UNITS = {
  weight: {
    display: 'kg',
    min: 30,
    max: 200,
    step: 0.1,
    precision: 1,
  },
  temperature: {
    display: '°C',
    min: 30,
    max: 45,
    step: 0.1,
    precision: 1,
  },
} as const

export type TrackerMeasurement = 'weight' | 'temperature'

/**
 * Format a measurement value with its unit
 * @param value numeric value
 * @param measurement type of measurement (weight or temperature)
 * @returns formatted string with unit
 */
export function formatMeasurement(
  value: number | null | undefined,
  measurement: TrackerMeasurement,
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }
  const unit = TRACKER_UNITS[measurement]
  return `${value.toFixed(unit.precision)}${unit.display}`
}

/**
 * Validate a raw string input for a measurement
 * @param raw user input string
 * @param measurement type of measurement
 * @returns parsed number if valid, null if invalid
 */
export function validateMeasurement(
  raw: string,
  measurement: TrackerMeasurement,
): number | null {
  const n = parseFloat(raw)
  if (isNaN(n)) return null

  const unit = TRACKER_UNITS[measurement]
  if (n < unit.min || n > unit.max) return null

  return n
}

/**
 * Get validation error message for a measurement
 * @param measurement type of measurement
 * @returns error message
 */
export function getMeasurementErrorMessage(
  measurement: TrackerMeasurement,
): string {
  const unit = TRACKER_UNITS[measurement]
  if (measurement === 'weight') {
    return `Enter a valid weight (${unit.min}–${unit.max}${unit.display})`
  }
  return `Enter a valid temperature (${unit.min}–${unit.max}${unit.display})`
}
