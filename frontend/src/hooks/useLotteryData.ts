import { useState, useEffect } from 'react'
import type { HistoryResponse, FrequencyResponse, TrendResponse, HotColdResponse } from '../types'

interface LotteryData {
  history: HistoryResponse | null
  frequency: FrequencyResponse | null
  trend: TrendResponse | null
  hotCold: HotColdResponse | null
  loading: boolean
  error: string | null
}

export function useLotteryData(page: number, pageSize: number = 15): LotteryData & { setPage: (p: number) => void; setPageSize: (s: number) => void } {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [frequency, setFrequency] = useState<FrequencyResponse | null>(null)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [hotCold, setHotCold] = useState<HotColdResponse | null>(null)
  const [currentPage, setPage] = useState(page)
  const [currentPageSize, setPageSize] = useState(pageSize)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const [h, f, t, hc] = await Promise.all([
          fetch(`/api/history?page=${currentPage}&page_size=${currentPageSize}`).then<HistoryResponse>(r => r.json()),
          fetch('/api/stats/frequency').then<FrequencyResponse>(r => r.json()),
          fetch('/api/stats/trend').then<TrendResponse>(r => r.json()),
          fetch('/api/stats/hot-cold?period=30').then<HotColdResponse>(r => r.json()),
        ])
        setHistory(h)
        setFrequency(f)
        setTrend(t)
        setHotCold(hc)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, currentPageSize])

  return { history, frequency, trend, hotCold, loading, error, setPage, setPageSize }
}
