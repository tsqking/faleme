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

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const r = await fetch(url, { signal })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`)
  return r.json() as Promise<T>
}

const getErrorMsg = (e: unknown): string =>
  e instanceof Error ? e.message : 'Failed to fetch data'

export function useLotteryData(page: number, pageSize: number = 15, period: number = 30): LotteryData {
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [frequency, setFrequency] = useState<FrequencyResponse | null>(null)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [hotCold, setHotCold] = useState<HotColdResponse | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const load = async () => {
      setError(null)
      try {
        const [f, t] = await Promise.all([
          fetchJson<FrequencyResponse>('/api/stats/frequency', signal),
          fetchJson<TrendResponse>('/api/stats/trend', signal),
        ])
        if (signal.aborted) return
        setFrequency(f)
        setTrend(t)
      } catch (e) {
        if (signal.aborted) return
        setFailed(true)
        setError(getErrorMsg(e))
      }
    }
    load()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const load = async () => {
      setError(null)
      try {
        const h = await fetchJson<HistoryResponse>(`/api/history?page=${page}&page_size=${pageSize}`, signal)
        if (signal.aborted) return
        setHistory(h)
      } catch (e) {
        if (signal.aborted) return
        setFailed(true)
        setError(getErrorMsg(e))
      }
    }
    load()
    return () => controller.abort()
  }, [page, pageSize])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const load = async () => {
      setError(null)
      try {
        const hc = await fetchJson<HotColdResponse>(`/api/stats/hot-cold?period=${period}`, signal)
        if (signal.aborted) return
        setHotCold(hc)
      } catch (e) {
        if (signal.aborted) return
        setFailed(true)
        setError(getErrorMsg(e))
      }
    }
    load()
    return () => controller.abort()
  }, [period])

  const loading = !failed && (history === null || frequency === null || trend === null || hotCold === null)

  return { history, frequency, trend, hotCold, loading, error }
}
