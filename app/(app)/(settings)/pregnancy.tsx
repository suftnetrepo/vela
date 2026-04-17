import React from 'react'
import { Stack, StyledText, StyledScrollView, StyledPage, theme } from 'fluent-styles'
import { Text } from '@/components/text'
import { router } from 'expo-router'
import { useColors } from '../../../src/hooks/useColors'
import { PremiumGate } from '../../../src/components/shared/PremiumGate'
import { VelaIcon } from '../../../src/components/shared/VelaIcon'

export default function PregnancyScreen() {
  const Colors = useColors()

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
      <StyledPage.Header
        title="Pregnancy Mode"
        titleAlignment="left"
        marginHorizontal={16}
        shapeProps={{
          size: 48,
          backgroundColor: Colors.primaryFaint,
        }}
        backArrowProps={{
          color: Colors.textPrimary,
        }}
        showBackArrow
        onBackPress={() => router.push('/(app)/settings')}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: '700', color: Colors.textPrimary,       fontFamily: "PlusJakartaSans_700Bold", }}
        rightIcon={<></>}
      />

      <StyledScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <PremiumGate
          feature="Pregnancy Mode"
          description="Track pregnancy and postpartum health with specialized insights"
        >
          <Stack gap={20}>
            <Stack
              backgroundColor={Colors.surface}
              borderRadius={20}
              padding={24}
              alignItems="center"
              gap={12}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.05}
              shadowRadius={8}
              elevation={1}
            >
              <Stack
                width={60}
                height={60}
                borderRadius={30}
                backgroundColor={Colors.primaryFaint}
                alignItems="center"
                justifyContent="center"
              >
                <VelaIcon name="baby" size={32} color={Colors.primary} />
              </Stack>
              <Text fontSize={18} fontWeight="800" color={Colors.textPrimary} textAlign="center">
                Pregnancy Tracking
              </Text>
              <Text fontSize={13} color={Colors.textSecondary} textAlign="center" lineHeight={20}>
                Monitor your pregnancy journey with specialized health insights and tracking tools.
              </Text>
            </Stack>

            <Stack
              backgroundColor={Colors.surface}
              borderRadius={20}
              padding={16}
              gap={12}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.05}
              shadowRadius={8}
              elevation={1}
            >
              <Stack gap={8}>
                <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>
                  🤰 Coming Soon
                </Text>
                <Text fontSize={13} color={Colors.textSecondary} lineHeight={20}>
                  Pregnancy Mode features are currently being developed. Check back soon for updates on pregnancy tracking, due date calculation, and postpartum support.
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </PremiumGate>
      </StyledScrollView>
    </StyledPage>
  )
}
