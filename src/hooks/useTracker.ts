import { useEffect, useState, useCallback } from 'react'
import { logService } from '../services/log.service'
import { useRecordsStore } from '../stores/records.store'
import { todayStr } from '../utils/date'
import type { DailyLog } from '../db/schema'

export interface TrackerDataPoint {
  date:  string
  value: number
}

export interface TrackerData {
  todayLog:     DailyLog | null
  weightData:   TrackerDataPoint[]
  tempData:     TrackerDataPoint[]
  loading:      boolean
}

export function useTracker(): TrackerData & {
  saveWeight:      (kg: number)   => Promise<void>
  saveTemperature: (c: number)    => Promise<void>
  saveNotes:       (notes: string) => Promise<void>
  refresh:         () => void
} {
  const version        = useRecordsStore(s => s.version)
  const invalidateData = useRecordsStore(s => s.invalidateData)

  const [todayLog, setTodayLog]       = useState<DailyLog | null>(null)
  const [weightData, setWeightData]   = useState<TrackerDataPoint[]>([])
  const [tempData, setTempData]       = useState<TrackerDataPoint[]>([])
  const [loading, setLoading]         = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const logs = await logService.getRecentLogs(60)
      setWeightData(
        logs
          .filter(l => l.weight != null)
          .map(l => ({ date: l.date, value: l.weight! }))
          .reverse()
      )
      setTempData(
        logs
          .filter(l => l.temperature != null)
          .map(l => ({ date: l.date, value: l.temperature! }))
          .reverse()
      )
      const today = logs.find(l => l.date === todayStr()) ?? null
      setTodayLog(today)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [version, load])

  const saveWeight = useCallback(async (kg: number) => {
    await logService.upsertLog(todayStr(), { weight: kg })
    invalidateData()
  }, [invalidateData])

  const saveTemperature = useCallback(async (celsius: number) => {
    await logService.upsertLog(todayStr(), { temperature: celsius })
    invalidateData()
  }, [invalidateData])

  const saveNotes = useCallback(async (notes: string) => {
    await logService.upsertLog(todayStr(), { notes })
    invalidateData()
  }, [invalidateData])

  return {
    todayLog,
    weightData,
    tempData,
    loading,
    saveWeight,
    saveTemperature,
    saveNotes,
    refresh: load,
  }
}
