import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ThemeContext, type ThemeMode, type ResolvedTheme } from './useTheme'

const STORAGE_KEY = 'theme-mode'
const MEDIA_DARK = '(prefers-color-scheme: dark)'
const VALID_MODES: readonly ThemeMode[] = ['light', 'dark', 'system']

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (VALID_MODES as readonly string[]).includes(stored)) {
      return stored as ThemeMode
    }
  } catch {
    // localStorage unavailable (e.g. private mode); fall back to system
  }
  return 'system'
}

function subscribeSystemTheme(callback: () => void): () => void {
  const mql = window.matchMedia(MEDIA_DARK)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSystemThemeSnapshot(): ResolvedTheme {
  return window.matchMedia(MEDIA_DARK).matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    (): ResolvedTheme => 'light',
  )
  const resolved: ResolvedTheme = mode === 'system' ? systemTheme : mode

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])

  const setMode = useCallback((m: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, m)
    } catch {
      // storage unavailable; keep in-memory state only
    }
    setModeState(m)
  }, [])

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
