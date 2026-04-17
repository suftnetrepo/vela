import React from 'react'
import { Stack, StyledScrollView, StyledPage, StyledHeader, theme } from 'fluent-styles'
import { router } from 'expo-router'
import { useColors } from '../../../src/hooks/useColors'
import { useSettings } from '../../../src/hooks/useSettings'
import { ThemePreview } from '../../../src/components/shared/ThemePreview'
import type { ThemeName } from '../../../src/constants/themes'
import { toastService } from 'fluent-styles'

export default function ThemeScreen() {
  const Colors   = useColors()
  const settings = useSettings()

  const handleSelect = async (name: ThemeName) => {
    if (name !== 'rose' && !settings.isPremium) {
      toastService.info('Premium theme', 'Unlock Premium to use this theme.')
      router.push('/(app)/(settings)/premium')
      return
    }
    await settings.setTheme(name)
    toastService.success('Theme changed', `${name.charAt(0).toUpperCase() + name.slice(1)} theme applied.`)
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.background}>
       <StyledPage.Header
        title="Theme"
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
        onBackPress={() => router.push("/(app)/settings")}
        backgroundColor={Colors.background}
        titleProps={{ fontWeight: "700", color: Colors.textPrimary, fontFamily: "PlusJakartaSans_700Bold" }}
      />
      <StyledScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ThemePreview onSelect={handleSelect} />
      </StyledScrollView>
    </StyledPage>
  )
}
