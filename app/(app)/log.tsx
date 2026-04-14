import React, { useState, useEffect } from 'react'
import {
  Stack, StyledText, StyledScrollView, StyledPage,
  StyledHeader, StyledPressable, TabBar,
  theme,
  StyledSpacer,
} from 'fluent-styles'
import { router, useLocalSearchParams } from 'expo-router'
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

type LogTab = 'flow' | 'symptoms' | 'journal'

const FLOW_MAP: Record<string, string> = {
  light: 'light', medium: 'medium', heavy: 'heavy',
}

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

  // Symptoms
  const [symptoms, setSymptoms] = useState<string[]>([])

  // Journal
  const [journalData, setJournalData] = useState<JournalData>({
    mood:        '',
    energyLevel: 3,
    notes:       '',
  })

  // Hydrate from existing log
  useEffect(() => {
    if (!log) return
    const flow = log.flow ?? null
    setFlowData({
      hasFlow:   flow ? true : (log.flow === 'none' ? false : null),
      level:     (flow && flow !== 'none' && flow !== 'spotting')
                   ? flow as any : null,
      discharge: log.flow === 'spotting' ? 'spotting' : null,
    })
    setSymptoms(log.symptoms.map(s => s.symptomKey))
    setJournalData({
      mood:        log.mood ?? '',
      energyLevel: log.energyLevel ?? 3,
      notes:       log.notes ?? '',
    })
    setDirty(false)
  }, [log])

  const handleSave = async () => {
    setSaving(true)
    const id = loaderService.show({ label: 'Saving…', variant: 'dots' })
    try {
      // Resolve flow string from FlowData
      let flowStr: string | undefined
      if (flowData.hasFlow === false) flowStr = 'none'
      else if (flowData.hasFlow === true) {
        if (flowData.discharge === 'spotting') flowStr = 'spotting'
        else flowStr = flowData.level ?? 'light'
      }

      await saveLog({
        flow:        flowStr,
        mood:        journalData.mood || undefined,
        energyLevel: journalData.energyLevel,
        notes:       journalData.notes || undefined,
        cycleId:     active?.id,
        symptoms:    symptoms.map(k => ({ key: k })),
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
      invalidateData()
      loaderService.hide(id)
      toastService.info('Log deleted')
      router.back()
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
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size:48,
          backgroundColor: theme.colors.pink[50]
        }}
        backArrowProps={{
          color:theme.colors.pink[500]
        }}
        showBackArrow
        onBackPress={() => router.back()}
        showStatusBar
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
        bottom={0}
        left={0}
        right={0}
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
          <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
            {saving ? 'Saving…' : 'Save'}
          </StyledText>
        </StyledPressable>
      </Stack>
    </StyledPage>
  )
}
