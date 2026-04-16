import { useEffect, useState, useCallback } from 'react'
import { desc } from 'drizzle-orm'
import { db } from '../db/client'
import { dailyLogs, symptomLogs } from '../db/schema'
import { useRecordsStore } from '../stores/records.store'
import type { DailyLog, SymptomLog } from '../db/schema'

export interface DailyLogWithSymptoms extends DailyLog {
  symptoms: SymptomLog[]
}

export function useDailyLogs() {
  const version = useRecordsStore(s => s.version)
  const [data, setData] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const logs = await db
        .select()
        .from(dailyLogs)
        .orderBy(desc(dailyLogs.date))
      setData(logs || [])
    } catch (err) {
      console.error('[useDailyLogs] Failed to load logs:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [version, load])

  return { data, loading, refresh: load }
}
