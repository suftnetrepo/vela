import React from 'react'
import { View } from 'react-native'
import { Stack, StyledPressable } from 'fluent-styles'
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { Text } from '@/components/text'
import { useColors } from '../../hooks/useColors'
import { VelaIcon } from '../shared/VelaIcon'
import type { VelaInsight } from '../../algorithm/insight'

interface VelaInsightCardProps {
  insight: VelaInsight | null
  cyclesLogged: number
  onViewAll: () => void
}

function InsightArtwork({ primary, accent, soft }: { primary: string; accent: string; soft: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 300 170">
      <Defs>
        <LinearGradient id="petalA" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={soft} stopOpacity="0.12" />
          <Stop offset="1" stopColor={primary} stopOpacity="0.26" />
        </LinearGradient>
        <LinearGradient id="petalB" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={primary} stopOpacity="0.08" />
          <Stop offset="1" stopColor={accent} stopOpacity="0.22" />
        </LinearGradient>
      </Defs>
      <Path d="M250 172C207 136 205 76 248 24C276 77 275 132 250 172Z" fill="url(#petalA)" />
      <Path d="M247 170C194 166 163 127 168 70C216 87 249 124 247 170Z" fill="url(#petalB)" opacity="0.9" />
      <Path d="M252 170C261 119 287 92 306 90C306 133 286 161 252 170Z" fill="url(#petalA)" opacity="0.85" />
      <Path d="M244 169C205 144 197 109 214 76C243 101 256 137 244 169Z" fill="url(#petalA)" opacity="0.58" />
      <Path d="M18 151C58 150 76 123 107 131C137 139 149 162 180 147C205 135 220 142 246 155C263 164 278 157 294 143" fill="none" stroke={primary} strokeWidth="2.2" strokeLinecap="round" opacity="0.42" />
      <Path d="M18 153C56 153 78 139 106 141C139 144 151 155 181 151C210 147 224 151 247 158" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.36" />
      <Circle cx="246" cy="155" r="4.5" fill={primary} opacity="0.72" />
      <Circle cx="294" cy="143" r="3.2" fill={accent} opacity="0.72" />
    </Svg>
  )
}

export function VelaInsightCard({ insight, cyclesLogged, onViewAll }: VelaInsightCardProps) {
  const Colors = useColors()
  const historyLabel = cyclesLogged > 0
    ? `Based on your last ${cyclesLogged} cycle${cyclesLogged === 1 ? '' : 's'}.`
    : 'Keep logging to build your personal cycle history.'

  return (
    <Stack
      backgroundColor={Colors.surface}
      borderRadius={24}
      padding={18}
      minHeight={154}
      borderWidth={1}
      borderColor={Colors.border}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.04}
      shadowRadius={12}
      elevation={2}
      overflow="hidden"
    >
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', right: -20, bottom: -18, width: 330, height: 176, opacity: 0.92 }}
      >
        <InsightArtwork primary={Colors.primary} accent={Colors.ovulation} soft={Colors.primaryFaint} />
      </View>

      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" zIndex={2}>
        <Stack flexDirection="row" alignItems="center" gap={10}>
          <Stack width={38} height={38} borderRadius={11} alignItems="center" justifyContent="center" backgroundColor={Colors.ovulation}>
            <VelaIcon name="premium" size={19} color={Colors.textInverse} />
          </Stack>
          <Text fontSize={17} fontWeight="700" color={Colors.textPrimary}>Vela Insight</Text>
        </Stack>

        <StyledPressable
          onPress={onViewAll}
          flexDirection="row"
          alignItems="center"
          gap={3}
          paddingVertical={5}
          paddingLeft={8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all insights"
        >
          <Text fontSize={11.5} fontWeight="600" color={Colors.primaryDark}>View all</Text>
          <VelaIcon name="chevron-right" size={13} color={Colors.primaryDark} />
        </StyledPressable>
      </Stack>

      <Stack gap={7} zIndex={2} marginTop={18} width="100%" paddingRight={0}>
        <Text fontSize={15.5} fontWeight="600" color={Colors.textPrimary} lineHeight={22}>
          {insight ? insight.message : 'Keep logging to unlock your personal cycle patterns.'}
        </Text>
        <Text fontSize={11.5} fontWeight="500" color={Colors.textSecondary} lineHeight={17}>
          {insight?.context || historyLabel}
        </Text>
      </Stack>
    </Stack>
  )
}
