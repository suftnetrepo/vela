export function formatCycleLength(days: number): string {
  return `${days} days`
}

export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    return `${((temp * 9) / 5 + 32).toFixed(1)}°F`
  }
  return `${temp.toFixed(1)}°C`
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs'): string {
  if (unit === 'lbs') {
    return `${(kg * 2.20462).toFixed(1)} lbs`
  }
  return `${kg.toFixed(1)} kg`
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
