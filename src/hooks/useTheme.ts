import { useEffect } from 'react'
import { useStore } from '@/store'
import type { Theme } from '@/types/ui'

const STORAGE_KEY = 'json-workspace-theme'

/**
 * Hook to read and toggle the active theme.
 * Writes to appSlice, localStorage, and the <html> class in one action.
 */
export function useTheme() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  // On mount: read persisted theme and apply it
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored)
      setTheme(stored)
    } else {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const resolved: Theme = prefersDark ? 'dark' : 'light'
      applyTheme(resolved)
      setTheme(resolved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  return { theme, toggle }
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
