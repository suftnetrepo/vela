import React, { useMemo } from 'react'
import { Stack, StyledText, StyledScrollView, StyledPressable } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { CyclePrediction, CyclePhase } from '../../algorithm/prediction'

interface CycleInfoRowProps {
  prediction: CyclePrediction | null
}

/**
 * Horizontal scrollable row of 4 compact info cards showing cycle data
 * and quick links to educational articles
 */
export function CycleInfoRow({ prediction }: CycleInfoRowProps) {
  const Colors = useColors()

  // Determine pregnancy chance based on cycle phase
  const pregnancyChance = useMemo(() => {
    if (!prediction) return 'Low'
    if (prediction.currentPhase === 'fertile' || prediction.currentPhase === 'ovulation') return 'High'
    if (prediction.currentPhase === 'follicular') return 'Medium'
    return 'Low'
  }, [prediction])

  // Get phase display name and associated article
  const phaseInfo = useMemo(() => {
    if (!prediction) return { display: 'Unknown', article: 'menstrual-cycle' }
    
    const phaseMap: Record<CyclePhase, { display: string; article: string }> = {
      'menstrual': { display: 'Menstrual phase', article: 'menstrual-cycle' },
      'follicular': { display: 'Follicular phase', article: 'menstrual-cycle' },
      'ovulation': { display: 'Ovulation', article: 'fertile-window' },
      'fertile': { display: 'Fertile window', article: 'fertile-window' },
      'luteal': { display: 'Luteal phase', article: 'pms-symptoms' },
      'predicted_period': { display: 'Predicted period', article: 'menstrual-cycle' },
    }
    
    return phaseMap[prediction.currentPhase] || { display: 'Unknown', article: 'menstrual-cycle' }
  }, [prediction])

  // Get phase icon based on phase
  const phaseIcon = useMemo(() => {
    if (!prediction) return 'cycle'
    
    const iconMap: Record<CyclePhase, string> = {
      'menstrual': 'drop',
      'follicular': 'flower',
      'ovulation': 'heart',
      'fertile': 'activity',
      'luteal': 'moon',
      'predicted_period': 'drop',
    }
    
    return iconMap[prediction.currentPhase] || 'cycle'
  }, [prediction])

  const handleArticleNavigation = (articleId: string) => {
    router.push({
      pathname: '/(app)/(settings)/article',
      params: { id: articleId }
    })
  }

  const handleArticlesHubNavigation = () => {
    router.push('/(app)/(settings)/articles')
  }

  // Fallback values when no prediction
  const cycleDay = prediction?.currentCycleDay ?? 0
  const dayDisplay = cycleDay > 0 ? cycleDay.toString() : '—'

  return (
    <Stack paddingHorizontal={20} paddingVertical={12}>
      <StyledScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        scrollEventThrottle={16}
      >
        {/* Card 1: Day of cycle */}
        <StyledPressable
          onPress={() => handleArticleNavigation('menstrual-cycle')}
          minWidth={90}
          height={100}
          backgroundColor={Colors.surface}
          borderRadius={16}
          borderWidth={1}
          borderColor={Colors.border}
          padding={12}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack alignItems="center" gap={4}>
            <VelaIcon name="cycle" size={20} color={Colors.primary} />
            <StyledText fontSize={18} fontWeight="800" color={Colors.textPrimary}>
              {dayDisplay}
            </StyledText>
          </Stack>
          <StyledText fontSize={11} fontWeight="600" color={Colors.textSecondary}>
            Day of cycle
          </StyledText>
        </StyledPressable>

        {/* Card 2: Current phase */}
        <StyledPressable
          onPress={() => handleArticleNavigation(phaseInfo.article)}
          minWidth={110}
          height={100}
          backgroundColor={Colors.surface}
          borderRadius={16}
          borderWidth={1}
          borderColor={Colors.border}
          padding={12}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack alignItems="center" gap={4}>
            <VelaIcon name={phaseIcon as any} size={20} color={Colors.primary} />
            <StyledText fontSize={13} fontWeight="600" color={Colors.textPrimary} textAlign="center">
              {phaseInfo.display.split(' ')[0]}
            </StyledText>
          </Stack>
          <StyledText fontSize={10} fontWeight="600" color={Colors.textSecondary} textAlign="center">
            {phaseInfo.display.split(' ').slice(1).join(' ')}
          </StyledText>
        </StyledPressable>

        {/* Card 3: Pregnancy chance */}
        <StyledPressable
          onPress={() => handleArticleNavigation('fertile-window')}
          minWidth={100}
          height={100}
          backgroundColor={Colors.surface}
          borderRadius={16}
          borderWidth={1}
          borderColor={Colors.border}
          padding={12}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack alignItems="center" gap={4}>
            <VelaIcon name={pregnancyChance === 'High' ? 'heart' : 'activity'} size={20} color={Colors.primary} />
            <StyledText fontSize={16} fontWeight="700" color={Colors.textPrimary}>
              {pregnancyChance}
            </StyledText>
          </Stack>
          <StyledText fontSize={10} fontWeight="600" color={Colors.textSecondary} textAlign="center">
            Based on cycle{'\n'}phase
          </StyledText>
        </StyledPressable>

        {/* Card 4: Learn */}
        <StyledPressable
          onPress={handleArticlesHubNavigation}
          minWidth={90}
          height={100}
          backgroundColor={Colors.surface}
          borderRadius={16}
          borderWidth={1}
          borderColor={Colors.border}
          padding={12}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack alignItems="center" gap={4}>
            <VelaIcon name="help" size={20} color={Colors.primary} />
            <StyledText fontSize={16} fontWeight="800" color={Colors.textPrimary}>
              Learn
            </StyledText>
          </Stack>
          <StyledText fontSize={10} fontWeight="600" color={Colors.textSecondary}>
            Articles & tips
          </StyledText>
        </StyledPressable>
      </StyledScrollView>
    </Stack>
  )
}
