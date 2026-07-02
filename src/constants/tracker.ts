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
export type WeightUnit = 'kg' | 'lbs'
export type TempUnitPref = 'celsius' | 'fahrenheit'

// Data is always STORED canonically as kg / °C (see useTracker.ts). Everything
// below converts between that canonical storage unit and whatever unit the
// user picked in Profile settings, purely for display/input purposes.

export function kgToLbs(kg: number): number {
  return kg * 2.20462
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462
}

export function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9
}

export function getWeightDisplayUnit(pref: WeightUnit): string {
  return pref === 'lbs' ? 'lbs' : 'kg'
}

export function getTempDisplayUnit(pref: TempUnitPref): string {
  return pref === 'fahrenheit' ? '°F' : '°C'
}

// Converts a canonical stored value (kg or °C) to the user's display unit
export function toDisplayValue(
  canonicalValue: number,
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): number {
  if (measurement === 'weight') {
    return weightUnit === 'lbs' ? kgToLbs(canonicalValue) : canonicalValue
  }
  return tempUnit === 'fahrenheit' ? celsiusToFahrenheit(canonicalValue) : canonicalValue
}

// Converts a value entered in the user's display unit back to canonical
// storage units (kg or °C) before saving
export function fromDisplayValue(
  displayValue: number,
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): number {
  if (measurement === 'weight') {
    return weightUnit === 'lbs' ? lbsToKg(displayValue) : displayValue
  }
  return tempUnit === 'fahrenheit' ? fahrenheitToCelsius(displayValue) : displayValue
}

// Min/max validation range, converted into the user's display unit
export function getDisplayRange(
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): { min: number; max: number; unit: string; precision: number; step: number } {
  const canonical = TRACKER_UNITS[measurement]
  if (measurement === 'weight') {
    if (weightUnit === 'lbs') {
      return {
        min: Math.round(kgToLbs(canonical.min)),
        max: Math.round(kgToLbs(canonical.max)),
        unit: 'lbs',
        precision: canonical.precision,
        step: canonical.step,
      }
    }
    return { min: canonical.min, max: canonical.max, unit: 'kg', precision: canonical.precision, step: canonical.step }
  }
  if (tempUnit === 'fahrenheit') {
    return {
      min: Math.round(celsiusToFahrenheit(canonical.min)),
      max: Math.round(celsiusToFahrenheit(canonical.max)),
      unit: '°F',
      precision: canonical.precision,
      step: canonical.step,
    }
  }
  return { min: canonical.min, max: canonical.max, unit: '°C', precision: canonical.precision, step: canonical.step }
}

/**
 * Format a measurement value in the user's chosen display unit (kg/lbs, °C/°F)
 * @param canonicalValue value as stored (kg or °C)
 */
export function formatMeasurementDisplay(
  canonicalValue: number | null | undefined,
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): string {
  if (canonicalValue === null || canonicalValue === undefined || isNaN(canonicalValue)) {
    return '—'
  }
  const range = getDisplayRange(measurement, weightUnit, tempUnit)
  const displayValue = toDisplayValue(canonicalValue, measurement, weightUnit, tempUnit)
  return `${displayValue.toFixed(range.precision)}${range.unit}`
}

/**
 * Validate a raw string input already expressed in the user's display unit
 * @returns the value converted to canonical storage units (kg/°C) if valid, null if invalid
 */
export function validateDisplayMeasurement(
  raw: string,
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): number | null {
  const n = parseFloat(raw)
  if (isNaN(n)) return null

  const range = getDisplayRange(measurement, weightUnit, tempUnit)
  if (n < range.min || n > range.max) return null

  return fromDisplayValue(n, measurement, weightUnit, tempUnit)
}

export function getMeasurementErrorMessageDisplay(
  measurement: TrackerMeasurement,
  weightUnit: WeightUnit,
  tempUnit: TempUnitPref,
): string {
  const range = getDisplayRange(measurement, weightUnit, tempUnit)
  if (measurement === 'weight') {
    return `Enter a valid weight (${range.min}–${range.max}${range.unit})`
  }
  return `Enter a valid temperature (${range.min}–${range.max}${range.unit})`
}

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