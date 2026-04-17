import { styled, StyledText, StyledTextProps } from 'fluent-styles'

const resolveFontFamily = (weight?: string | number) => {
  const value = String(weight || '400')

  if (value === '800') return 'PlusJakartaSans_800ExtraBold'
  if (value === '700' || value === 'bold') return 'PlusJakartaSans_700Bold'
  if (value === '600') return 'PlusJakartaSans_600SemiBold'
  if (value === '500') return 'PlusJakartaSans_500Medium'
  if (value === '300') return 'PlusJakartaSans_300Light'
  return 'PlusJakartaSans_400Regular'
}

const Text = styled<StyledTextProps>(StyledText, {
  base: {
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  variants: {
    fontWeight: (selected: string) => {
      const weight = String(selected || '400')

      return {
        fontWeight: weight as any,
        fontFamily: resolveFontFamily(weight),
      }
    },
    fontFamily: (selected: string) => {
      if (!selected) return {}
      return { fontFamily: selected }
    },
  },
})

export { Text }