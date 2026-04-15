import { useEffect, useState, useCallback } from 'react'
import { settingsService } from '../services/settings.service'
import { ALL_SYMPTOMS, SYMPTOM_SETTING_PREFIX } from '../constants/symptoms'
import type { SymptomDef } from '../constants/symptoms'
import { useRecordsStore } from '../stores/records.store'

// ─── Load all symptom visibility states from DB ───────────────────────────────
// Values are stored as the integer 1 (visible) or 0 (hidden) to avoid
// the Boolean("false") === true trap with JSON-serialised strings.
async function loadSymptomVisibility(): Promise<Record<string, boolean>> {
  const all = await settingsService.getAll()
  const result: Record<string, boolean> = {}

  for (const symptom of ALL_SYMPTOMS) {
    const key = `${SYMPTOM_SETTING_PREFIX}${symptom.key}`
    if (key in all) {
      // Stored as 1 or 0 — strict equality check
      result[symptom.key] = all[key] === 1 || all[key] === true
    } else {
      // Never been saved yet — use the compiled default
      result[symptom.key] = symptom.defaultVisible
    }
  }
  return result
}

// ─── Save a single symptom's visibility to DB ─────────────────────────────────
export async function setSymptomVisible(symptomKey: string, visible: boolean): Promise<void> {
  // Store as integer 1/0 so JSON.parse returns a number, not a string
  await settingsService.set(`${SYMPTOM_SETTING_PREFIX}${symptomKey}`, visible ? 1 : 0)
}

// ─── Reset all symptoms back to defaults ────────────────────────────────────
export async function resetSymptomsToDefault(): Promise<void> {
  for (const symptom of ALL_SYMPTOMS) {
    await settingsService.set(`${SYMPTOM_SETTING_PREFIX}${symptom.key}`, symptom.defaultVisible ? 1 : 0)
  }
}

// ─── Hook: returns only the symptoms the user has enabled ──────────────────────
export function useSymptoms() {
  const version = useRecordsStore(s => s.version)
  const [visibleSymptoms, setVisibleSymptoms] = useState<SymptomDef[]>([])
  const [visibility,      setVisibility]     = useState<Record<string, boolean>>({})
  const [loading,         setLoading]        = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const vis = await loadSymptomVisibility()
      setVisibility(vis)
      const filtered = ALL_SYMPTOMS.filter(s => vis[s.key])
      setVisibleSymptoms(filtered)
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload when store version changes (after invalidateData() is called)
  useEffect(() => {
    load()
  }, [version, load])

  // Also reload on mount to ensure fresh data
  useEffect(() => {
    load()
  }, [load])

  return { visibleSymptoms, visibility, loading, reload: load }
}
