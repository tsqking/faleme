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

export function useLotteryData(page: number, pageSize: number = 15, period: number = 30): LotteryData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [frequency, setFrequency] = useState<FrequencyResponse | null>(null)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [hotCold, setHotCold] = useState<HotColdResponse | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [prevPeriod, setPrevPeriod] = useState(period)

  useEffect(() => {
    const fetchData = async () => {
      if (!initialLoad) {
        if (period !== prevPeriod) {
          try {
            const hc = await fetch(`/api/stats/hot-cold?period=${period}`).then<HotColdResponse>(r => r.json())
            setHotCold(hc)
            setPrevPeriod(period)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch data')
          }
        } else {
          try {
            const h = await fetch(`/api/history?page=${page}&page_size=${pageSize}`).then<HistoryResponse>(r => r.json())
            setHistory(h)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch data')
          }
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [h, f, t, hc] = await Promise.all([
          fetch(`/api/history?page=${page}&page_size=${pageSize}`).then<HistoryResponse>(r => r.json()),
          fetch('/api/stats/frequency').then<FrequencyResponse>(r => r.json()),
          fetch('/api/stats/trend').then<TrendResponse>(r => r.json()),
          fetch(`/api/stats/hot-cold?period=${period}`).then<HotColdResponse>(r => r.json()),
        ])
        setHistory(h)
        setFrequency(f)
        setTrend(t)
        setHotCold(hc)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    fetchData()
  }, [page, pageSize, period])

  return { history, frequency, trend, hotCold, loading, error }
}
