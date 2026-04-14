import React, { useState, useRef, useCallback } from 'react'
import { Stack, StyledText, StyledPressable, StyledPage, StyledSlider } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../src/hooks/useColors'
import { useSettings } from '../../src/hooks/useSettings'
import { cycleService } from '../../src/services/cycle.service'
import { VelaIcon } from '../../src/components/shared/VelaIcon'
import type { VelaIconName } from '../../src/components/shared/VelaIcon'
import { loaderService, toastService } from 'fluent-styles'
import { subDays } from '../../src/utils/date'

type Step = 'cycle_length' | 'period_length' | 'last_period' | 'pin'

const STEP_ICONS: Record<Step, VelaIconName> = {
  cycle_length:  'calendar',
  period_length: 'phase-menstrual',
  last_period:   'cycle',
  pin:           'shield',
}

// ─── Slider step screens are PROPER COMPONENTS not inline functions ──────────
// This is critical. If stepContent() is called as a plain function, React
// recreates the entire JSX tree on every parent render — including the
// StyledSlider — causing it to remount and snap back every time
// onSlidingComplete triggers a parent setState.
// As proper components they have stable identity across re-renders.

interface SliderStepProps {
  Colors:          any
  icon:            VelaIconName
  title:           string
  subtitle:        string
  displayValue:    number
  displayLabel:    string
  initialValue:    number
  min:             number
  max:             number
  minLabel:        string
  maxLabel:        string
  onComplete:      (v: number) => void
}

const SliderStep = React.memo(({
  Colors, icon, title, subtitle,
  displayValue, displayLabel,
  initialValue, min, max,
  minLabel, maxLabel, onComplete,
}: SliderStepProps) => (
  <Stack gap={24}>
    <Stack gap={8}>
      <Stack horizontal alignItems="center" gap={12}>
        <Stack width={40} height={40} borderRadius={12} backgroundColor={Colors.primaryFaint}
          alignItems="center" justifyContent="center">
          <VelaIcon name={icon} size={22} color={Colors.primary} />
        </Stack>
        <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} flex={1}>
          {title}
        </StyledText>
      </Stack>
      <StyledText fontSize={15} color={Colors.textSecondary} lineHeight={22}>
        {subtitle}
      </StyledText>
    </Stack>

    {/* Big value display */}
    <Stack backgroundColor={Colors.primaryFaint} borderRadius={20} padding={24}
      alignItems="center" gap={4}>
      <StyledText fontSize={52} fontWeight="800" color={Colors.primary}>
        {displayValue}
      </StyledText>
      <StyledText fontSize={15} color={Colors.textSecondary}>{displayLabel}</StyledText>
    </Stack>

    {/* Slider — receives a stable initialValue prop that never changes,
        so StyledSlider's internal useEffect never fires mid-drag */}
    <StyledSlider
      value={initialValue}
      min={min}
      max={max}
      step={1}
      onSlidingComplete={onComplete}
      formatLabel={v => `${v}`}
      colors={{
        fill:       Colors.primary,
        track:      Colors.border,
        thumbBorder:Colors.primary,
        tooltipBg:  Colors.primaryDark,
      }}
      size="lg"
      alwaysShowTooltip
    />

    <Stack horizontal justifyContent="space-between">
      <StyledText fontSize={12} color={Colors.textTertiary}>{minLabel}</StyledText>
      <StyledText fontSize={12} color={Colors.textTertiary}>{maxLabel}</StyledText>
    </Stack>
  </Stack>
))

interface LastPeriodStepProps {
  Colors:       any
  displayValue: number
  initialValue: number
  onComplete:   (v: number) => void
}

const LastPeriodStep = React.memo(({
  Colors, displayValue, initialValue, onComplete,
}: LastPeriodStepProps) => {
  const label = displayValue === 0 ? 'Today'
    : displayValue === 1 ? 'Yesterday'
    : `${displayValue} days ago`

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Stack horizontal alignItems="center" gap={12}>
          <Stack width={40} height={40} borderRadius={12} backgroundColor={Colors.primaryFaint}
            alignItems="center" justifyContent="center">
            <VelaIcon name="cycle" size={22} color={Colors.primary} />
          </Stack>
          <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} flex={1}>
            When did your last period start?
          </StyledText>
        </Stack>
        <StyledText fontSize={15} color={Colors.textSecondary} lineHeight={22}>
          This helps Vela calculate where you are in your cycle right now.
        </StyledText>
      </Stack>

      <Stack backgroundColor={Colors.primaryFaint} borderRadius={20} padding={24}
        alignItems="center" gap={4}>
        <StyledText fontSize={40} fontWeight="800" color={Colors.primary}>
          {label}
        </StyledText>
      </Stack>

      <StyledSlider
        value={initialValue}
        min={0}
        max={60}
        step={1}
        onSlidingComplete={onComplete}
        formatLabel={v => v === 0 ? 'Today' : `${v}d ago`}
        colors={{
          fill:       Colors.primary,
          track:      Colors.border,
          thumbBorder:Colors.primary,
          tooltipBg:  Colors.primaryDark,
        }}
        size="lg"
        alwaysShowTooltip
      />
    </Stack>
  )
})

const PinStep = React.memo(({ Colors }: { Colors: any }) => (
  <Stack gap={20}>
    <Stack horizontal alignItems="center" gap={12}>
      <Stack width={40} height={40} borderRadius={12} backgroundColor={Colors.primaryFaint}
        alignItems="center" justifyContent="center">
        <VelaIcon name="shield" size={22} color={Colors.primary} />
      </Stack>
      <StyledText fontSize={22} fontWeight="800" color={Colors.textPrimary} flex={1}>
        Protect your data
      </StyledText>
    </Stack>
    <StyledText fontSize={15} color={Colors.textSecondary} lineHeight={22}>
      Set up a PIN to keep your cycle data private. You can also enable Face ID or fingerprint in Settings.
    </StyledText>
    <Stack backgroundColor={Colors.primaryFaint} borderRadius={20} padding={20} gap={16}>
      {([
        { icon: 'key'          as VelaIconName, label: 'Set a 4-digit PIN' },
        { icon: 'fingerprint'  as VelaIconName, label: 'Enable biometric unlock' },
        { icon: 'shield-check' as VelaIconName, label: 'All data stays on device' },
      ]).map(item => (
        <Stack key={item.label} horizontal alignItems="center" gap={12}>
          <Stack width={34} height={34} borderRadius={10} backgroundColor={Colors.surface}
            alignItems="center" justifyContent="center">
            <VelaIcon name={item.icon} size={17} color={Colors.primary} />
          </Stack>
          <StyledText fontSize={14} fontWeight="600" color={Colors.textPrimary}>
            {item.label}
          </StyledText>
        </Stack>
      ))}
    </Stack>
    <StyledText fontSize={13} color={Colors.textTertiary}>
      You can set this up in Settings at any time.
    </StyledText>
  </Stack>
))

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const Colors   = useColors()
  const settings = useSettings()
  const [step, setStep] = useState<Step>('cycle_length')

  // Stable initial values — passed to SliderStep as `initialValue`.
  // They never change, so StyledSlider's useEffect([value]) never fires mid-drag.
  const CYCLE_INITIAL      = 28
  const PERIOD_INITIAL     = 5
  const LAST_PERIOD_INITIAL = 7

  // Refs hold the committed value (updated on sliding complete).
  // Using refs (not state) so updating them doesn't trigger a parent re-render,
  // which would cause the slider to remount.
  const cycleLenRef          = useRef(CYCLE_INITIAL)
  const periodLenRef         = useRef(PERIOD_INITIAL)
  const lastPeriodDaysAgoRef = useRef(LAST_PERIOD_INITIAL)

  // Display state — only for the big number above each slider.
  // These update on sliding complete, not during drag.
  const [cycleDisplay, setCycleDisplay]           = useState(CYCLE_INITIAL)
  const [periodDisplay, setPeriodDisplay]         = useState(PERIOD_INITIAL)
  const [lastPeriodDisplay, setLastPeriodDisplay] = useState(LAST_PERIOD_INITIAL)

  const stepIndex = ['cycle_length', 'period_length', 'last_period', 'pin'].indexOf(step)
  const totalSteps = 4

  const handleCycleComplete = useCallback((v: number) => {
    cycleLenRef.current = v
    setCycleDisplay(v)
  }, [])

  const handlePeriodComplete = useCallback((v: number) => {
    periodLenRef.current = v
    setPeriodDisplay(v)
  }, [])

  const handleLastPeriodComplete = useCallback((v: number) => {
    lastPeriodDaysAgoRef.current = v
    setLastPeriodDisplay(v)
  }, [])

  const handleFinish = async () => {
    const id = loaderService.show({ label: 'Setting up Vela…', variant: 'dots' })
    try {
      await settings.setCycleLength(cycleLenRef.current)
      await settings.setPeriodLength(periodLenRef.current)
      const lastPeriodStart = subDays(new Date(), lastPeriodDaysAgoRef.current)
      await cycleService.startNewCycle(lastPeriodStart)
      await settings.completeOnboarding()
      loaderService.hide(id)
      router.replace('/(auth)/pin-setup')
    } catch (err) {
      loaderService.hide(id)
      toastService.error('Setup failed', 'Please try again.')
    }
  }

  const handleNext = () => {
    const steps: Step[] = ['cycle_length', 'period_length', 'last_period', 'pin']
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
    else handleFinish()
  }

  const handleBack = () => {
    const steps: Step[] = ['cycle_length', 'period_length', 'last_period', 'pin']
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      {/* Progress bar */}
      <Stack paddingHorizontal={24} paddingTop={60} paddingBottom={8}>
        <Stack horizontal gap={6}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <Stack key={i} flex={1} height={4} borderRadius={2}
              backgroundColor={i <= stepIndex ? Colors.primary : Colors.border} />
          ))}
        </Stack>
        <StyledText fontSize={12} color={Colors.textTertiary} marginTop={8}>
          Step {stepIndex + 1} of {totalSteps}
        </StyledText>
      </Stack>

      {/* Step content — rendered as components, NOT called as functions */}
      <Stack flex={1} paddingHorizontal={24} paddingTop={24}>
        {step === 'cycle_length' && (
          <SliderStep
            Colors={Colors}
            icon="calendar"
            title="How long is your cycle?"
            subtitle="Days from the start of one period to the next. Average is 28 days."
            displayValue={cycleDisplay}
            displayLabel="days"
            initialValue={CYCLE_INITIAL}
            min={20}
            max={45}
            minLabel="20 days"
            maxLabel="45 days"
            onComplete={handleCycleComplete}
          />
        )}
        {step === 'period_length' && (
          <SliderStep
            Colors={Colors}
            icon="phase-menstrual"
            title="How long is your period?"
            subtitle="How many days do you typically bleed? Most periods last 3–7 days."
            displayValue={periodDisplay}
            displayLabel="days"
            initialValue={PERIOD_INITIAL}
            min={2}
            max={9}
            minLabel="2 days"
            maxLabel="9 days"
            onComplete={handlePeriodComplete}
          />
        )}
        {step === 'last_period' && (
          <LastPeriodStep
            Colors={Colors}
            displayValue={lastPeriodDisplay}
            initialValue={LAST_PERIOD_INITIAL}
            onComplete={handleLastPeriodComplete}
          />
        )}
        {step === 'pin' && (
          <PinStep Colors={Colors} />
        )}
      </Stack>

      {/* Actions */}
      <Stack paddingHorizontal={24} paddingBottom={48} gap={12}>
        <StyledPressable
          backgroundColor={Colors.primary}
          borderRadius={30}
          paddingVertical={18}
          alignItems="center"
          onPress={handleNext}
          shadowColor={Colors.primary}
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={12}
          elevation={5}
        >
          <StyledText fontSize={17} fontWeight="800" color={Colors.textInverse}>
            {step === 'pin' ? 'Start tracking' : 'Continue'}
          </StyledText>
        </StyledPressable>

        {stepIndex > 0 && (
          <StyledPressable alignItems="center" paddingVertical={10} onPress={handleBack}>
            <StyledText fontSize={14} color={Colors.textTertiary}>Back</StyledText>
          </StyledPressable>
        )}
      </Stack>
    </StyledPage>
  )
}
