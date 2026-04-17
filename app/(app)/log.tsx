import React, { useState, useEffect } from 'react'
import {
  Stack, StyledText, StyledScrollView, StyledPage,
  StyledHeader, StyledPressable, TabBar,
  theme,
  StyledSpacer,
} from 'fluent-styles'
import { router, useLocalSearchParams } from 'expo-router'
import { Text } from '@/components/text'
import { useColors } from '../../src/hooks/useColors'
import { useDailyLog } from '../../src/hooks/useDailyLog'
import { useCycles } from '../../src/hooks/useCycles'
import { FlowTab }     from '../../src/components/log/FlowTab'
import { SymptomsTab } from '../../src/components/log/SymptomsTab'
import { JournalTab }  from '../../src/components/log/JournalTab'
import type { FlowData }    from '../../src/components/log/FlowTab'
import type { JournalData } from '../../src/components/log/JournalTab'
import { VelaIcon }    from '../../src/components/shared/VelaIcon'
import { formatDisplayDate, todayStr, fromDateStr } from '../../src/utils/date'
import { toastService, loaderService, dialogueService } from 'fluent-styles'
import { logService }  from '../../src/services/log.service'
import { useRecordsStore } from '../../src/stores/records.store'

// Mood keys are stored with this prefix in the symptoms table for persistence
const MOOD_KEY_PREFIX = 'mood_'

type LogTab = 'flow' | 'symptoms' | 'journal'

export default function LogScreen() {
  const Colors  = useColors()
  const params  = useLocalSearchParams<{ date?: string; tab?: string }>()
  const date    = params.date ?? todayStr()
  const isToday = date === todayStr()

  const { log, loading, saveLog } = useDailyLog(date)
  const { active }                = useCycles()
  const invalidateData            = useRecordsStore(s => s.invalidateData)

  const [activeTab, setActiveTab] = useState<LogTab>(
    (params.tab as LogTab) ?? 'flow'
  )
  const [dirty,   setDirty]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  // Flow state
  const [flowData, setFlowData] = useState<FlowData>({
    hasFlow:   null,
    level:     null,
    discharge: null,
  })

  // All selected symptom keys (does NOT include moods — moods are in journalData.moods)
  const [symptoms, setSymptoms] = useState<string[]>([])

  // Journal (moods, energy level, and notes)
  const [journalData, setJournalData] = useState<JournalData>({
    moods:       [],
    energyLevel: 3,
    notes:       '',
  })

  // Reset all log state to defaults (used after delete)
  const resetLogState = () => {
    setFlowData({
      hasFlow:   null,
      level:     null,
      discharge: null,
    })
    setSymptoms([])
    setJournalData({
      moods:       [],
      energyLevel: 3,
      notes:       '',
    })
    setDirty(false)
  }

  // Hydrate from existing log
  useEffect(() => {
    if (!log) {
      // If log is null (deleted or empty day), reset to defaults
      resetLogState()
      return
    }
    const flow = log.flow ?? null
    setFlowData({
      hasFlow:   flow ? true : (log.flow === 'none' ? false : null),
      level:     (flow && flow !== 'none' && flow !== 'spotting')
                   ? flow as any : null,
      discharge: log.flow === 'spotting' ? 'spotting' : null,
    })

    // Separate symptom keys and mood keys from DB
    const allKeys     = log.symptoms.map(s => s.symptomKey)
    const symptomKeys = allKeys.filter(k => !k.startsWith(MOOD_KEY_PREFIX))
    const moodKeys    = allKeys
      .filter(k => k.startsWith(MOOD_KEY_PREFIX))
      .map(k => k.replace(MOOD_KEY_PREFIX, ''))

    // Also migrate legacy single mood from daily_logs.mood if present
    // and no mood_ keys exist yet
    if (log.mood && moodKeys.length === 0) {
      moodKeys.push(log.mood)
    }

    setSymptoms(symptomKeys)
    setJournalData({
      moods:       moodKeys,
      energyLevel: log.energyLevel ?? 3,
      notes:       log.notes ?? '',
    })
    setDirty(false)
  }, [log])

  const handleSave = async () => {
    setSaving(true)
    const id = loaderService.show({ label: 'Saving…', variant: 'dots' })
    try {
      // Resolve flow string
      let flowStr: string | undefined
      if (flowData.hasFlow === false) flowStr = 'none'
      else if (flowData.hasFlow === true) {
        if (flowData.discharge === 'spotting') flowStr = 'spotting'
        else flowStr = flowData.level ?? 'light'
      }

      // Combine symptoms and moods for persistence
      // Moods are stored with mood_ prefix in the symptoms array
      const allKeys = [
        ...symptoms,
        ...journalData.moods.map(k => `${MOOD_KEY_PREFIX}${k}`),
      ]

      // Extract first mood for legacy daily_logs.mood column
      const legacyMood = journalData.moods.length > 0
        ? journalData.moods[0]
        : undefined

      await saveLog({
        flow:        flowStr,
        mood:        legacyMood,
        energyLevel: journalData.energyLevel,
        notes:       journalData.notes || undefined,
        cycleId:     active?.id,
        symptoms:    allKeys.map(k => ({ key: k })),
      })
      loaderService.hide(id)
      toastService.success('Saved', `${formatDisplayDate(fromDateStr(date))} logged.`)
      setDirty(false)
    } catch {
      loaderService.hide(id)
      toastService.error('Could not save', 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!log) return
    const ok = await dialogueService.confirm({
      title:        'Delete this log?',
      message:      `Remove log for ${formatDisplayDate(fromDateStr(date))}?`,
      icon:         '🗑️',
      confirmLabel: 'Delete',
      cancelLabel:  'Cancel',
      destructive:  true,
    })
    if (!ok) return
    const id = loaderService.show({ label: 'Deleting…', variant: 'dots' })
    try {
      await logService.deleteLog(date)
      
      // Immediately reset all local UI state to defaults
      resetLogState()
      
      // Invalidate cached data so fresh query returns empty
      invalidateData()
      
      loaderService.hide(id)
      toastService.info('Log deleted')
    } catch {
      loaderService.hide(id)
      toastService.error('Could not delete')
    }
  }

  const TABS = [
    { value: 'flow'     as LogTab, label: 'Flow'     },
    { value: 'symptoms' as LogTab, label: 'Symptoms' },
    { value: 'journal'  as LogTab, label: 'Journal'  },
  ]

  const markDirty = () => setDirty(true)

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      {/* Header */}
      <StyledPage.Header
        title={formatDisplayDate(fromDateStr(date))}
        titleAlignment="center"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.surface,
        }}
        backArrowProps={{ color: Colors.primary }}
        showBackArrow
        onBackPress={() => router.back()}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: '700', color: Colors.textPrimary }}
        rightIcon={
          log ? (
            <StyledPressable onPress={handleDelete} padding={8}>
              <VelaIcon name="trash" size={18} color={Colors.error} />
            </StyledPressable>
          ) : null
        }
      />
      <StyledSpacer marginVertical={4} />

      {/* Tab bar */}
      <Stack paddingHorizontal={20} paddingBottom={4}>
        <TabBar
          options={TABS}
          value={activeTab}
          onChange={v => setActiveTab(v)}
          indicator="line"
          showBorder
          colors={{
            activeText: Colors.primary,
            indicator:  Colors.primary,
            text:       Colors.textTertiary,
            border:     Colors.border,
            background: Colors.background,
          }}
        />
      </Stack>

      {/* Scrollable content */}
      <StyledScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'flow' && (
          <FlowTab
            data={flowData}
            onChange={d => { setFlowData(d); markDirty() }}
          />
        )}
        {activeTab === 'symptoms' && (
          <SymptomsTab
            selected={symptoms}
            onChange={v => { setSymptoms(v); markDirty() }}
          />
        )}
        {activeTab === 'journal' && (
          <JournalTab
            data={journalData}
            onChange={d => { setJournalData(d); markDirty() }}
          />
        )}
      </StyledScrollView>

      {/* Sticky save button */}
      <Stack
        position="absolute"
        bottom={0} left={0} right={0}
        paddingHorizontal={20}
        paddingBottom={36}
        paddingTop={12}
        backgroundColor={Colors.background}
        style={{
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <StyledPressable
          onPress={handleSave}
          backgroundColor={Colors.primary}
          borderRadius={30}
          paddingVertical={18}
          alignItems="center"
          flexDirection="row"
          justifyContent="center"
          gap={10}
          shadowColor={Colors.primary}
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={12}
          elevation={5}
        >
          <VelaIcon name="check-circle" size={20} color={Colors.textInverse} />
          <Text fontSize={17} fontWeight="800" color={Colors.textInverse}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </StyledPressable>
      </Stack>
    </StyledPage>
  )
}

