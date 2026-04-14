import React, { useState } from 'react'
import {
  Stack, StyledText, StyledScrollView, StyledPage,
  StyledHeader, StyledPressable, TabBar,
} from 'fluent-styles'
import { useColors }          from '../../src/hooks/useColors'
import { useCycles }          from '../../src/hooks/useCycles'
import { usePrediction }      from '../../src/hooks/usePrediction'
import { CycleTrendsCard }    from '../../src/components/insights/CycleTrendsCard'
import { CycleRhythmChart }   from '../../src/components/insights/CycleRhythmChart'
import { CyclePhasePillBar }  from '../../src/components/shared/CyclePhasePillBar'
import { PatternSummary }     from '../../src/components/insights/PatternSummary'
import { VelaIcon }           from '../../src/components/shared/VelaIcon'
import type { VelaIconName }  from '../../src/components/shared/VelaIcon'
import { phaseName, phaseDescription } from '../../src/algorithm/prediction'
import { formatShortDate, parseISO, differenceInDays } from '../../src/utils/date'
import { format } from 'date-fns'

type InsightTab = 'overview' | 'cycles' | 'patterns'

// Motivational feedback based on cycle regularity
function getMotivationMessage(cycles: any[], prediction: any): string {
  if (!prediction || cycles.length < 2) return ''
  const lengths = cycles.filter(c => c.cycleLength).map((c: any) => c.cycleLength!)
  if (lengths.length < 2) return ''
  const range = Math.max(...lengths) - Math.min(...lengths)
  if (range <= 2) return '✨ Excellent! Your menstrual rhythm is perfectly stable.'
  if (range <= 5) return '👍 Your cycle is mostly regular. Keep tracking!'
  return '🌊 Your cycle shows some variation — this is common and normal.'
}

export default function InsightsScreen() {
  const Colors     = useColors()
  const { cycles, loading } = useCycles()
  const prediction = usePrediction(cycles)
  const [tab, setTab] = useState<InsightTab>('overview')

  const safeDate = (d: Date | undefined) => {
    try { return d ? formatShortDate(d) : '—' } catch { return '—' }
  }

  const motivationMsg = getMotivationMessage(cycles, prediction)

  const activeCycle = cycles.find(c => c.isActive === 1) ?? null

  const TABS = [
    { value: 'overview'  as InsightTab, label: 'Overview' },
    { value: 'cycles'    as InsightTab, label: 'History'  },
    { value: 'patterns'  as InsightTab, label: 'Patterns' },
  ]

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledHeader title="Insights" titleAlignment="left" showStatusBar
        backgroundColor={Colors.background}
        titleProps={{ fontSize: 22, fontWeight: '800', color: Colors.textPrimary }} />

      <Stack paddingHorizontal={20} paddingBottom={4}>
        <TabBar
          options={TABS}
          value={tab}
          onChange={setTab}
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

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            {/* Cycle trends card — 2 tiles + phase pill bar */}
            {prediction ? (
              <CycleTrendsCard
                prediction={prediction}
                activeCycle={activeCycle}
              />
            ) : (
              <Stack backgroundColor={Colors.primaryFaint} borderRadius={20}
                padding={24} alignItems="center" gap={10} borderWidth={1} borderColor={Colors.border}>
                <VelaIcon name="flower" size={32} color={Colors.primary} />
                <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                  Start tracking your cycle
                </StyledText>
                <StyledText fontSize={13} color={Colors.textSecondary} textAlign="center">
                  Log your first period to see insights here.
                </StyledText>
              </Stack>
            )}

            {/* Current phase banner */}
            {prediction && (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20}
                gap={8} shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.05} shadowRadius={8} elevation={1}>
                <StyledText fontSize={12} fontWeight="700" color={Colors.textTertiary} letterSpacing={0.5}>
                  CURRENT PHASE
                </StyledText>
                <StyledText fontSize={20} fontWeight="800" color={Colors.textPrimary}>
                  {phaseName(prediction.currentPhase)}
                </StyledText>
                <StyledText fontSize={14} color={Colors.textSecondary} lineHeight={21}>
                  {phaseDescription(prediction.currentPhase)}
                </StyledText>
              </Stack>
            )}

            {/* Upcoming events */}
            {prediction && (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20} gap={14}
                shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.06} shadowRadius={10} elevation={2}>
                <StyledText fontSize={17} fontWeight="700" color={Colors.textPrimary}>
                  Upcoming
                </StyledText>
                {([
                  { icon: 'phase-fertile'   as VelaIconName, label: 'Fertile window',
                    date: `${safeDate(prediction.fertileWindowStart)} – ${safeDate(prediction.fertileWindowEnd)}`,
                    bg: Colors.fertileLight,  color: Colors.ovulation },
                  { icon: 'phase-ovulation' as VelaIconName, label: 'Ovulation',
                    date: safeDate(prediction.ovulationDay),
                    bg: Colors.ovulationLight, color: Colors.ovulation },
                  { icon: 'phase-menstrual' as VelaIconName, label: 'Next period',
                    date: `${safeDate(prediction.nextPeriodStart)} · ±${prediction.confidenceDays}d`,
                    bg: Colors.primaryFaint,  color: Colors.primary },
                ]).map(item => (
                  <Stack key={item.label} flexDirection="row" alignItems="center" gap={14}
                    backgroundColor={item.bg} borderRadius={14} padding={14}>
                    <Stack width={40} height={40} borderRadius={20} backgroundColor={Colors.surface}
                      alignItems="center" justifyContent="center">
                      <VelaIcon name={item.icon} size={22} color={item.color} />
                    </Stack>
                    <Stack flex={1} gap={2}>
                      <StyledText fontSize={14} fontWeight="700" color={Colors.textPrimary}>
                        {item.label}
                      </StyledText>
                      <StyledText fontSize={13} color={item.color} fontWeight="600">
                        {item.date}
                      </StyledText>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}

            {/* Dual line rhythm chart */}
            <CycleRhythmChart cycles={cycles} />

            {/* Feedback message */}
            {motivationMsg && (
              <Stack backgroundColor={Colors.successLight} borderRadius={16}
                padding={16} flexDirection="row" gap={10} alignItems="center">
                <VelaIcon name="star-filled" size={18} color={Colors.success} />
                <StyledText fontSize={13} fontWeight="600" color={Colors.textPrimary}
                  flex={1} lineHeight={20}>
                  {motivationMsg}
                </StyledText>
              </Stack>
            )}
          </>
        )}

        {/* ── HISTORY TAB ───────────────────────────────────────────────── */}
        {tab === 'cycles' && (
          <>
            <StyledText fontSize={12} fontWeight="700" color={Colors.textTertiary}
              letterSpacing={0.4} paddingHorizontal={4}>
              {cycles.length} CYCLE{cycles.length !== 1 ? 'S' : ''} TRACKED
            </StyledText>

            {cycles.length === 0 && (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={32}
                alignItems="center" gap={12}>
                <VelaIcon name="calendar" size={32} color={Colors.textTertiary} />
                <StyledText fontSize={15} color={Colors.textSecondary} textAlign="center">
                  No cycles logged yet.
                </StyledText>
              </Stack>
            )}

            {[...cycles].reverse().map((cycle, i) => {
              const start    = parseISO(cycle.startDate)
              const isActive = cycle.isActive === 1
              const days     = isActive
                ? differenceInDays(new Date(), start) + 1
                : cycle.cycleLength ?? null

              return (
                <Stack key={cycle.id} backgroundColor={Colors.surface} borderRadius={20}
                  padding={18} gap={14}
                  shadowColor="#000" shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.05} shadowRadius={6} elevation={1}>

                  {/* Title row */}
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                    <Stack flexDirection="row" alignItems="center" gap={10}>
                      <Stack width={38} height={38} borderRadius={19}
                        backgroundColor={isActive ? Colors.primaryFaint : Colors.surfaceAlt}
                        alignItems="center" justifyContent="center">
                        <VelaIcon
                          name={isActive ? 'phase-menstrual' : 'check-circle'}
                          size={18}
                          color={isActive ? Colors.primary : Colors.textTertiary}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <StyledText fontSize={15} fontWeight="700" color={Colors.textPrimary}>
                          {format(start, 'MMMM yyyy')}
                        </StyledText>
                        <StyledText fontSize={12} color={Colors.textTertiary}>
                          {`${days ?? '?'} days · Started ${format(start, 'MMM d')}`}
                        </StyledText>
                      </Stack>
                    </Stack>
                    {isActive && (
                      <Stack backgroundColor={Colors.primaryFaint} borderRadius={10}
                        paddingHorizontal={10} paddingVertical={4}>
                        <StyledText fontSize={11} fontWeight="700" color={Colors.primaryDark}>
                          Active
                        </StyledText>
                      </Stack>
                    )}
                  </Stack>

                  {/* Phase pill bar for this cycle */}
                  {prediction && isActive && (
                    <CyclePhasePillBar
                      prediction={prediction}
                      currentDay={prediction.currentCycleDay}
                      compact
                    />
                  )}

                  {/* Stats */}
                  <Stack flexDirection="row" gap={8}>
                    {[
                      { label: 'Cycle', value: days ? `${days}d` : '—', icon: 'cycle' as VelaIconName },
                      { label: 'Period', value: cycle.periodLength ? `${cycle.periodLength}d` : '—', icon: 'drop' as VelaIconName },
                    ].map(s => (
                      <Stack key={s.label} flex={1} backgroundColor={Colors.surfaceAlt}
                        borderRadius={12} padding={10} flexDirection="row"
                        alignItems="center" gap={8}>
                        <VelaIcon name={s.icon} size={14} color={Colors.primary} />
                        <Stack gap={1}>
                          <StyledText fontSize={15} fontWeight="800" color={Colors.textPrimary}>
                            {s.value}
                          </StyledText>
                          <StyledText fontSize={10} color={Colors.textTertiary} fontWeight="600">
                            {s.label.toUpperCase()}
                          </StyledText>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )
            })}
          </>
        )}

        {/* ── PATTERNS TAB ──────────────────────────────────────────────── */}
        {tab === 'patterns' && (
          <>
            <PatternSummary cycles={cycles} />

            {prediction && (
              <Stack backgroundColor={Colors.surface} borderRadius={20} padding={20} gap={14}
                shadowColor="#000" shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.06} shadowRadius={10} elevation={2}>
                <StyledText fontSize={17} fontWeight="700" color={Colors.textPrimary}>
                  Cycle regularity
                </StyledText>
                <Stack flexDirection="row" gap={8}>
                  {[
                    { label: 'Avg length',  value: `${prediction.averageCycleLength}d`,  color: '#818CF8' },
                    { label: 'Avg period',  value: `${prediction.averagePeriodLength}d`,  color: '#FB7185' },
                    { label: 'Confidence',  value: `±${prediction.confidenceDays}d`,      color: Colors.success },
                  ].map(s => (
                    <Stack key={s.label} flex={1} backgroundColor={Colors.surfaceAlt}
                      borderRadius={14} padding={12} alignItems="center" gap={4}>
                      <StyledText fontSize={20} fontWeight="800" color={s.color}>
                        {s.value}
                      </StyledText>
                      <StyledText fontSize={10} color={Colors.textTertiary} fontWeight="600">
                        {s.label.toUpperCase()}
                      </StyledText>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Symptom patterns coming soon */}
            <Stack backgroundColor={Colors.primaryFaint} borderRadius={20} padding={24}
              alignItems="center" gap={12} borderWidth={1} borderColor={Colors.border}>
              <Stack width={56} height={56} borderRadius={28} backgroundColor={Colors.surface}
                alignItems="center" justifyContent="center">
                <VelaIcon name="activity" size={28} color={Colors.primary} />
              </Stack>
              <StyledText fontSize={16} fontWeight="700" color={Colors.textPrimary} textAlign="center">
                Symptom patterns
              </StyledText>
              <StyledText fontSize={13} color={Colors.textSecondary} textAlign="center" lineHeight={20}>
                After logging symptoms for 2+ cycles, Vela will show you which symptoms appear most often and when.
              </StyledText>
              <Stack backgroundColor={Colors.primary} borderRadius={20}
                paddingHorizontal={16} paddingVertical={8}>
                <StyledText fontSize={12} fontWeight="700" color={Colors.textInverse}>
                  Keep logging to unlock
                </StyledText>
              </Stack>
            </Stack>
          </>
        )}
      </StyledScrollView>
    </StyledPage>
  )
}
