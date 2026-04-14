import { useEffect, useState, useCallback } from 'react'
import { cycleService } from '../services/cycle.service'
import { useRecordsStore } from '../stores/records.store'
import type { Cycle } from '../db/schema'

export function useCycles() {
  const version          = useRecordsStore(s => s.version)
  const invalidateData   = useRecordsStore(s => s.invalidateData)
  const [cycles, setCycles]   = useState<Cycle[]>([])
  const [active, setActive]   = useState<Cycle | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, act] = await Promise.all([
        cycleService.getConfirmedCycles(),
        cycleService.getActive(),
      ])
      setCycles(all)
      setActive(act)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [version, load])

  const startCycle = useCallback(async (date: Date) => {
    await cycleService.startNewCycle(date)
    invalidateData()
  }, [invalidateData])

  const endCycle = useCallback(async (endDate: Date, periodLength: number) => {
    await cycleService.endCurrentCycle(endDate, periodLength)
    invalidateData()
  }, [invalidateData])

  return { cycles, active, loading, startCycle, endCycle, refresh: load }
}
