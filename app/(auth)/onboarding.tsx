import React, { useState, useCallback } from 'react'
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

interface SliderStepProps {
  icon: VelaIconName
  title: string
  subtitle: string
  value: number
  displayLabel: string
  min: number
  max: number
  minLabel: string
  maxLabel: string
  formatTip?: (v: number) => string
  onChange: (v: number) => void
}

function SliderStep({
  icon,
  title,
  subtitle,
  value,
  displayLabel,
  min,
  max,
  minLabel,
  maxLabel,
  formatTip,
  onChange,
}: SliderStepProps) {
  const Colors = useColors()

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Stack horizontal alignItems="center" gap={12}>
          <Stack
            width={40}
            height={40}
            borderRadius={12}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
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

      <Stack
        backgroundColor={Colors.primaryFaint}
        borderRadius={20}
        padding={24}
        alignItems="center"
        gap={4}
      >
        <StyledText fontSize={52} fontWeight="800" color={Colors.primary}>
          {value}
        </StyledText>
        <StyledText fontSize={15} color={Colors.textSecondary}>
          {displayLabel}
        </StyledText>
      </Stack>

      <StyledSlider
        value={value}
        min={min}
        max={max}
        step={1}
        onValueChange={onChange}
        onSlidingComplete={onChange}
        formatLabel={formatTip ?? ((v) => `${v}`)}
        colors={{
          fill: Colors.primary,
          track: Colors.border,
          thumbBorder: Colors.primary,
          tooltipBg: Colors.primaryDark,
        }}
        size="lg"
        alwaysShowTooltip
      />

      <Stack horizontal justifyContent="space-between">
        <StyledText fontSize={12} color={Colors.textTertiary}>
          {minLabel}
        </StyledText>
        <StyledText fontSize={12} color={Colors.textTertiary}>
          {maxLabel}
        </StyledText>
      </Stack>
    </Stack>
  )
}

interface LastPeriodStepProps {
  value: number
  onChange: (v: number) => void
}

function LastPeriodStep({ value, onChange }: LastPeriodStepProps) {
  const Colors = useColors()

  const label =
    value === 0
      ? 'Today'
      : value === 1
        ? 'Yesterday'
        : `${value} days ago`

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <Stack horizontal alignItems="center" gap={12}>
          <Stack
            width={40}
            height={40}
            borderRadius={12}
            backgroundColor={Colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
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

      <Stack
        backgroundColor={Colors.primaryFaint}
        borderRadius={20}
        padding={24}
        alignItems="center"
        justifyContent="center"
        gap={4}
      >
        <StyledText fontSize={40} fontWeight="800" color={Colors.primary}>
          {label}
        </StyledText>
      </Stack>

      <StyledSlider
        value={value}
        min={0}
        max={60}
        step={1}
        onValueChange={onChange}
        onSlidingComplete={onChange}
        formatLabel={(v) => (v === 0 ? 'Today' : `${v}d ago`)}
        colors={{
          fill: Colors.primary,
          track: Colors.border,
          thumbBorder: Colors.primary,
          tooltipBg: Colors.primaryDark,
        }}
        size="lg"
        alwaysShowTooltip
      />
    </Stack>
  )
}

function PinStep({ Colors }: { Colors: any }) {
  return (
    <Stack gap={20}>
      <Stack horizontal alignItems="center" gap={12}>
        <Stack
          width={40}
          height={40}
          borderRadius={12}
          backgroundColor={Colors.primaryFaint}
          alignItems="center"
          justifyContent="center"
        >
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
        {[
          { icon: 'key' as VelaIconName, label: 'Set a 4-digit PIN' },
          { icon: 'fingerprint' as VelaIconName, label: 'Enable biometric unlock' },
          { icon: 'shield-check' as VelaIconName, label: 'All data stays on device' },
        ].map((item) => (
          <Stack key={item.label} horizontal alignItems="center" gap={12}>
            <Stack
              width={34}
              height={34}
              borderRadius={10}
              backgroundColor={Colors.surface}
              alignItems="center"
              justifyContent="center"
            >
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
  )
}

export default function OnboardingScreen() {
  const Colors = useColors()
  const settings = useSettings()

  const [step, setStep] = useState<Step>('cycle_length')
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [lastPeriodDaysAgo, setLastPeriodDaysAgo] = useState(7)

  const steps: Step[] = ['cycle_length', 'period_length', 'last_period', 'pin']
  const stepIndex = steps.indexOf(step)
  const totalSteps = steps.length

  const handleFinish = async () => {
    console.log('\n[📝 ONBOARDING] Completing onboarding...')
    console.log(`[📝 ONBOARDING] → Cycle: ${cycleLength}d, Period: ${periodLength}d, Last period: ${lastPeriodDaysAgo}d ago`)
    
    const id = loaderService.show({ label: 'Setting up Vela…', variant: 'dots' })

    try {
      console.log('[📝 ONBOARDING] → Persisting cycle length...')
      await settings.setCycleLength(cycleLength)
      console.log('[📝 ONBOARDING] ✓ Cycle length saved')
      
      console.log('[📝 ONBOARDING] → Persisting period length...')
      await settings.setPeriodLength(periodLength)
      console.log('[📝 ONBOARDING] ✓ Period length saved')

      const lastPeriodStart = subDays(new Date(), lastPeriodDaysAgo)
      console.log('[📝 ONBOARDING] → Creating first cycle...')
      await cycleService.startNewCycle(lastPeriodStart)
      console.log('[📝 ONBOARDING] ✓ First cycle created')

      console.log('[📝 ONBOARDING] → Marking onboarding as complete...')
      await settings.completeOnboarding()
      console.log('[📝 ONBOARDING] ✓ onboarding_complete=true in database')
      
      loaderService.hide(id)
      console.log('[📝 ONBOARDING] ✓ SUCCESS: All data persisted → Going to PIN setup\n')

      router.replace('/(auth)/pin-setup')
    } catch (err) {
      loaderService.hide(id)
      console.log('[📝 ONBOARDING] ✗ ERROR during persistence:', err)
      toastService.error('Setup failed', 'Please try again.')
    }
  }

  const handleNext = useCallback(() => {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1])
    } else {
      handleFinish()
    }
  }, [step])

  const handleBack = useCallback(() => {
    const idx = steps.indexOf(step)
    if (idx > 0) {
      setStep(steps[idx - 1])
    }
  }, [step])

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <Stack paddingHorizontal={24} paddingTop={60} paddingBottom={8}>
        <Stack horizontal gap={6}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <Stack
              key={i}
              flex={1}
              height={4}
              borderRadius={2}
              backgroundColor={i <= stepIndex ? Colors.primary : Colors.border}
            />
          ))}
        </Stack>

        <StyledText fontSize={12} color={Colors.textTertiary} marginTop={8}>
          Step {stepIndex + 1} of {totalSteps}
        </StyledText>
      </Stack>

      <Stack flex={1} paddingHorizontal={24} paddingTop={24}>
        {step === 'cycle_length' && (
          <SliderStep
            icon="calendar"
            title="How long is your cycle?"
            subtitle="Days from the start of one period to the next. Average is 28 days."
            value={cycleLength}
            displayLabel="days"
            min={20}
            max={45}
            minLabel="20 days"
            maxLabel="45 days"
            onChange={setCycleLength}
          />
        )}

        {step === 'period_length' && (
          <SliderStep
            icon="phase-menstrual"
            title="How long is your period?"
            subtitle="How many days do you typically bleed? Most periods last 3–7 days."
            value={periodLength}
            displayLabel="days"
            min={2}
            max={9}
            minLabel="2 days"
            maxLabel="9 days"
            onChange={setPeriodLength}
          />
        )}

        {step === 'last_period' && (
          <LastPeriodStep
            value={lastPeriodDaysAgo}
            onChange={setLastPeriodDaysAgo}
          />
        )}

        {step === 'pin' && <PinStep Colors={Colors} />}
      </Stack>

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
            <StyledText fontSize={14} color={Colors.textTertiary}>
              Back
            </StyledText>
          </StyledPressable>
        )}
      </Stack>
    </StyledPage>
  )
}