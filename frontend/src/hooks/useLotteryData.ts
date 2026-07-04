import { useState, useEffect, useRef } from 'react'
import type { HistoryResponse, FrequencyResponse, TrendResponse, HotColdResponse } from '../types'

interface LotteryData {
  history: HistoryResponse | null
  frequency: FrequencyResponse | null
  trend: TrendResponse | null
  hotCold: HotColdResponse | null
  loading: boolean
  error: string | null
}

function parseJson<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export function useLotteryData(page: number, pageSize: number = 15, period: number = 30): LotteryData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [frequency, setFrequency] = useState<FrequencyResponse | null>(null)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [hotCold, setHotCold] = useState<HotColdResponse | null>(null)
  const initialLoad = useRef(true)
  const prevPage = useRef(page)
  const prevPeriod = useRef(period)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const getErrorMsg = (e: unknown): string =>
      e instanceof Error ? e.message : 'Failed to fetch data'

    const fetchData = async () => {
      if (!initialLoad.current) {
        if (period !== prevPeriod.current) {
          try {
            const hc = await fetch(`/api/stats/hot-cold?period=${period}`, { signal }).then<HotColdResponse>(r => parseJson(r))
            if (!signal.aborted) { setHotCold(hc); prevPeriod.current = period }
          } catch (e) {
            if (!signal.aborted) setError(getErrorMsg(e))
          }
        } else if (page !== prevPage.current) {
          try {
            const h = await fetch(`/api/history?page=${page}&page_size=${pageSize}`, { signal }).then<HistoryResponse>(r => parseJson(r))
            if (!signal.aborted) { setHistory(h); prevPage.current = page }
          } catch (e) {
            if (!signal.aborted) setError(getErrorMsg(e))
          }
        }
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [h, f, t, hc] = await Promise.all([
          fetch(`/api/history?page=${page}&page_size=${pageSize}`, { signal }).then<HistoryResponse>(r => parseJson(r)),
          fetch('/api/stats/frequency', { signal }).then<FrequencyResponse>(r => parseJson(r)),
          fetch('/api/stats/trend', { signal }).then<TrendResponse>(r => parseJson(r)),
          fetch(`/api/stats/hot-cold?period=${period}`, { signal }).then<HotColdResponse>(r => parseJson(r)),
        ])
        if (!signal.aborted) {
          setHistory(h)
          setFrequency(f)
          setTrend(t)
          setHotCold(hc)
          prevPage.current = page
          prevPeriod.current = period
          initialLoad.current = false
        }
      } catch (e) {
        if (!signal.aborted) setError(getErrorMsg(e))
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [page, pageSize, period])

  return { history, frequency, trend, hotCold, loading, error }
}
