import React, { useMemo } from 'react'
import {
  Stack, StyledText, StyledScrollView, StyledPage,
  StyledHeader, StyledPressable,
} from 'fluent-styles'
import { router } from 'expo-router'
import { useColors }          from '../../src/hooks/useColors'
import { useCycles }          from '../../src/hooks/useCycles'
import { usePrediction }      from '../../src/hooks/usePrediction'
import { CycleCalendar }      from '../../src/components/calendar/CycleCalendar'
import { TodayCard }          from '../../src/components/home/TodayCard'
import { CycleTrendsCard }    from '../../src/components/insights/CycleTrendsCard'
import { VelaIcon }           from '../../src/components/shared/VelaIcon'
import { todayStr, formatShortDate } from '../../src/utils/date'
import { dialogueService, toastService, loaderService } from 'fluent-styles'
import { cycleService }       from '../../src/services/cycle.service'
import { useRecordsStore }    from '../../src/stores/records.store'
import type { VelaIconName }  from '../../src/components/shared/VelaIcon'

export default function HomeScreen() {
  const Colors         = useColors()
  const { cycles }     = useCycles()
  const prediction     = usePrediction(cycles)
  const invalidateData = useRecordsStore(s => s.invalidateData)
  const activeCycle    = cycles.find(c => c.isActive === 1) ?? null

  const handleDayPress = (date: string) => {
    router.push({ pathname: '/(app)/log', params: { date } })
  }

  const handleStartPeriod = async () => {
    const ok = await dialogueService.confirm({
      title:        'Start period today?',
      message:      'This will log today as the start of your new cycle.',
      icon:         '🌸',
      confirmLabel: 'Yes, start',
      cancelLabel:  'Cancel',
    })
    if (!ok) return
    const id = loaderService.show({ label: 'Logging…', variant: 'dots' })
    try {
      await cycleService.startNewCycle(new Date())
      invalidateData()
      loaderService.hide(id)
      toastService.success('Period started', 'New cycle logged.')
    } catch {
      loaderService.hide(id)
      toastService.error('Something went wrong')
    }
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledHeader
        title="Vela"
        titleAlignment="left"
        showStatusBar
        backgroundColor={Colors.background}
        titleProps={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}
        rightIcon={
          <StyledPressable
            onPress={handleStartPeriod}
            backgroundColor={Colors.primaryFaint}
            borderRadius={20}
            paddingHorizontal={14}
            paddingVertical={8}
            borderWidth={1}
            borderColor={Colors.border}
            flexDirection="row"
            alignItems="center"
            gap={6}
          >
            <VelaIcon name="drop" size={14} color={Colors.primary} />
            <StyledText fontSize={13} fontWeight="700" color={Colors.primaryDark}>
              Period
            </StyledText>
          </StyledPressable>
        }
      />

      <StyledScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today hero card */}
        <Stack paddingHorizontal={20} paddingTop={4} paddingBottom={16}>
          <TodayCard
            prediction={prediction}
            onLogPress={() =>
              router.push({ pathname: '/(app)/log', params: { date: todayStr() } })
            }
          />
        </Stack>

        {/* Cycle trends card — 2 tiles + phase bar */}
        {prediction && (
          <Stack paddingHorizontal={20} paddingBottom={16}>
            <CycleTrendsCard
              prediction={prediction}
              activeCycle={activeCycle}
              onPress={() => router.push('/(app)/insights')}
            />
          </Stack>
        )}

        {/* Calendar */}
        <Stack paddingHorizontal={20} paddingBottom={16}>
          <Stack
            backgroundColor={Colors.surface}
            borderRadius={24}
            padding={20}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.06}
            shadowRadius={12}
            elevation={3}
          >
            <CycleCalendar
              prediction={prediction}
              cycles={cycles}
              onDayPress={handleDayPress}
            />
          </Stack>
        </Stack>

        {/* Quick log CTA */}
        <Stack paddingHorizontal={20}>
          <StyledPressable
            onPress={() =>
              router.push({ pathname: '/(app)/log', params: { date: todayStr() } })
            }
            backgroundColor={Colors.primary}
            borderRadius={20}
            padding={18}
            flexDirection="row"
            alignItems="center"
            gap={14}
            shadowColor={Colors.primary}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.28}
            shadowRadius={12}
            elevation={5}
          >
            <Stack
              width={44}
              height={44}
              borderRadius={22}
              backgroundColor="rgba(255,255,255,0.22)"
              alignItems="center"
              justifyContent="center"
            >
              <VelaIcon name="edit" size={22} color={Colors.textInverse} />
            </Stack>
            <Stack flex={1} gap={3}>
              <StyledText fontSize={16} fontWeight="800" color={Colors.textInverse}>
                Log today
              </StyledText>
              <StyledText fontSize={12} color="rgba(255,255,255,0.75)">
                Flow, mood, symptoms & notes
              </StyledText>
            </Stack>
            <VelaIcon name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
          </StyledPressable>
        </Stack>
      </StyledScrollView>
    </StyledPage>
  )
}
