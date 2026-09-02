import { useEffect, useState, useCallback } from 'react'
import { logService } from '../services/log.service'
import type { DailyLogWithSymptoms } from '../services/log.service'
import { useRecordsStore } from '../stores/records.store'

/**
 * Full daily-log + symptom history, reactive to the same invalidation the
 * rest of the app already uses (saving a log in app/(app)/log.tsx calls
 * invalidateData(), which bumps this automatically). Backs Home's Vela
 * Insight and Your Patterns sections.
 */
export function useLogHistory(limit = 400) {
  const version = useRecordsStore(s => s.version)
  const [logs, setLogs]       = useState<DailyLogWithSymptoms[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await logService.getHistoryWithSymptoms(limit)
      setLogs(result)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { load() }, [version, load])

  return { logs, loading, refresh: load }
}
