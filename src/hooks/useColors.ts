import { useSettingsStore } from '../stores/settings.store'
import { THEMES } from '../constants/themes'
import type { ThemeColors } from '../constants/themes'

export function useColors(): ThemeColors {
  const theme = useSettingsStore(s => s.theme)
  return THEMES[theme] ?? THEMES.rose
}
