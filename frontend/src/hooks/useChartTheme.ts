import { useMemo } from 'react'
import { useTheme } from './useTheme'

/**
 * Shared chart colors derived from the resolved theme.
 * recharts renders SVG attributes, which cannot consume CSS `var()`,
 * so values are mirrored here rather than read from the DOM at runtime.
 */
export function useChartTheme() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  return useMemo(() => ({
    gridStroke: isDark ? '#2e2e40' : '#eee',
    tickFill: isDark ? '#a1a1aa' : '#666',
    tooltipStyle: {
      background: isDark ? '#1e1e2e' : '#fff',
      border: `1px solid ${isDark ? '#3a3a4f' : '#ddd'}`,
      color: isDark ? '#e4e4e7' : '#333',
      borderRadius: 6,
    },
  }), [isDark])
}
