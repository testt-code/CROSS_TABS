import { ThemeProviderContext } from "@/context/ThemeContext"
import type { Theme } from "@/types"
import { useEffect, useState } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  /** External theme value for synced mode */
  syncedTheme?: Theme
  /** Callback when theme changes in synced mode */
  onThemeChange?: (theme: Theme) => void
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  syncedTheme,
  onThemeChange,
  ...props
}: ThemeProviderProps) {
  const [localTheme, setLocalTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const theme = syncedTheme ?? localTheme

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      if (onThemeChange) {
        onThemeChange(newTheme)
      } else {
        setLocalTheme(newTheme)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}