import { createContext, useContext } from 'react'
import { darkPremium, getThemeById } from './themes'
import type { SlideTheme } from './themes'

export const SlideThemeContext = createContext<SlideTheme>(darkPremium)

export function useTheme(): SlideTheme {
  return useContext(SlideThemeContext)
}

export function SlideThemeProvider({
  themeId,
  children,
}: {
  themeId?: string | null
  children: React.ReactNode
}) {
  const theme = getThemeById(themeId ?? 'dark-premium')
  return (
    <SlideThemeContext.Provider value={theme}>
      {children}
    </SlideThemeContext.Provider>
  )
}
