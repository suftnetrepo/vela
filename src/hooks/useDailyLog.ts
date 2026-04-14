import { useEffect, useState, useCallback } from 'react'
import { logService } from '../services/log.service'
import type { DailyLogWithSymptoms } from '../services/log.service'
import { useRecordsStore } from '../stores/records.store'
import { todayStr } from '../utils/date'

export function useDailyLog(date: string = todayStr()) {
  const version        = useRecordsStore(s => s.version)
  const invalidateData = useRecordsStore(s => s.invalidateData)
  const [log, setLog]       = useState<DailyLogWithSymptoms | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await logService.getByDateWithSymptoms(date)
      setLog(result)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { load() }, [version, load])

  const saveLog = useCallback(async (data: {
    flow?:         string
    mood?:         string
    energyLevel?:  number
    notes?:        string
    symptoms?:     { key: string; intensity?: number }[]
    cycleId?:      number
  }) => {
    const saved = await logService.upsertLog(date, {
      flow:        data.flow,
      mood:        data.mood,
      energyLevel: data.energyLevel,
      notes:       data.notes,
      cycleId:     data.cycleId,
    })
    if (data.symptoms !== undefined) {
      await logService.setSymptoms(date, saved.id, data.symptoms)
    }
    invalidateData()
  }, [date, invalidateData])

  return { log, loading, saveLog, refresh: load }
}
