import { useEffect, useState, useCallback } from 'react'
import { settingsService } from '../services/settings.service'
import { ALL_MOODS, MOOD_SETTING_PREFIX } from '../constants/moods'
import type { MoodDef } from '../constants/moods'
import { useRecordsStore } from '../stores/records.store'

// ─── Load all mood visibility states from DB ──────────────────────────────────
// Values are stored as the integer 1 (visible) or 0 (hidden) to avoid
// the Boolean("false") === true trap with JSON-serialised strings.
async function loadMoodVisibility(): Promise<Record<string, boolean>> {
  const all = await settingsService.getAll()
  const result: Record<string, boolean> = {}

  for (const mood of ALL_MOODS) {
    const key = `${MOOD_SETTING_PREFIX}${mood.key}`
    if (key in all) {
      // Stored as 1 or 0 — strict equality check
      result[mood.key] = all[key] === 1 || all[key] === true
    } else {
      // Never been saved yet — use the compiled default
      result[mood.key] = mood.defaultVisible
    }
  }
  return result
}

// ─── Save a single mood's visibility to DB ────────────────────────────────────
export async function setMoodVisible(moodKey: string, visible: boolean): Promise<void> {
  // Store as integer 1/0 so JSON.parse returns a number, not a string
  await settingsService.set(`${MOOD_SETTING_PREFIX}${moodKey}`, visible ? 1 : 0)
}

// ─── Reset all moods back to defaults ────────────────────────────────────────
export async function resetMoodsToDefault(): Promise<void> {
  for (const mood of ALL_MOODS) {
    await settingsService.set(`${MOOD_SETTING_PREFIX}${mood.key}`, mood.defaultVisible ? 1 : 0)
  }
}

// ─── Hook: returns only the moods the user has enabled ───────────────────────
export function useMoods() {
  const version = useRecordsStore(s => s.version)
  const [visibleMoods, setVisibleMoods]   = useState<MoodDef[]>([])
  const [visibility,   setVisibility]     = useState<Record<string, boolean>>({})
  const [loading,      setLoading]        = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const vis = await loadMoodVisibility()
      setVisibility(vis)
      setVisibleMoods(ALL_MOODS.filter(m => vis[m.key]))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [version, load])

  return { visibleMoods, visibility, loading, reload: load }
}
