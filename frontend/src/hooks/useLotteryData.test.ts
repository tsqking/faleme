import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLotteryData } from './useLotteryData'
import type { HistoryResponse, FrequencyResponse, TrendResponse, HotColdResponse } from '../types'

const mockHistory: HistoryResponse = { total: 1, page: 1, page_size: 15, total_pages: 1, items: [] }
const mockFrequency: FrequencyResponse = { front: [], back: [] }
const mockTrend: TrendResponse = { items: [], total: 0 }
const mockHotCold: HotColdResponse = { period: 30, front: [], back: [] }

function jsonOk(data: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve(data) } as unknown as Response
}

function jsonError(status: number): Response {
  return { ok: false, status, statusText: 'Server Error', json: () => Promise.resolve({}) } as unknown as Response
}

function mockFetchByUrl(calls: Record<string, unknown>) {
  return vi.fn((url: RequestInfo | URL) => {
    const key = Object.keys(calls).find((prefix) => String(url).startsWith(prefix))
    if (!key) return Promise.reject(new Error(`unexpected url ${String(url)}`))
    return Promise.resolve(jsonOk(calls[key]))
  })
}

describe('useLotteryData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads all four datasets on mount and exposes loading state', async () => {
    const fetchMock = mockFetchByUrl({
      '/api/history': mockHistory,
      '/api/stats/frequency': mockFrequency,
      '/api/stats/trend': mockTrend,
      '/api/stats/hot-cold': mockHotCold,
    })
    vi.mocked(fetch).mockImplementation(fetchMock)

    const { result } = renderHook(() => useLotteryData(1, 15, 30))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.history).toEqual(mockHistory)
    expect(result.current.frequency).toEqual(mockFrequency)
    expect(result.current.trend).toEqual(mockTrend)
    expect(result.current.hotCold).toEqual(mockHotCold)
    expect(result.current.error).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('refetches only history when page changes', async () => {
    const fetchMock = mockFetchByUrl({
      '/api/history': mockHistory,
      '/api/stats/frequency': mockFrequency,
      '/api/stats/trend': mockTrend,
      '/api/stats/hot-cold': mockHotCold,
    })
    vi.mocked(fetch).mockImplementation(fetchMock)

    const { result, rerender } = renderHook(
      ({ page }) => useLotteryData(page, 15, 30),
      { initialProps: { page: 1 } },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender({ page: 2 })
    await waitFor(() => expect(result.current.history?.page).toBe(1))

    const historyCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/history'))
    const hotColdCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/stats/hot-cold'))
    const frequencyCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/stats/frequency'))
    const trendCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/stats/trend'))
    expect(historyCalls).toHaveLength(2)
    expect(historyCalls[1][0]).toContain('page=2')
    expect(hotColdCalls).toHaveLength(1)
    expect(frequencyCalls).toHaveLength(1)
    expect(trendCalls).toHaveLength(1)
  })

  it('refetches only hot-cold when period changes', async () => {
    const fetchMock = mockFetchByUrl({
      '/api/history': mockHistory,
      '/api/stats/frequency': mockFrequency,
      '/api/stats/trend': mockTrend,
      '/api/stats/hot-cold': mockHotCold,
    })
    vi.mocked(fetch).mockImplementation(fetchMock)

    const { result, rerender } = renderHook(
      ({ period }) => useLotteryData(1, 15, period),
      { initialProps: { period: 30 } },
    )

    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender({ period: 60 })
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).includes('period=60'))).toBe(true))

    const hotColdCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/stats/hot-cold'))
    const historyCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('/api/history'))
    expect(hotColdCalls).toHaveLength(2)
    expect(historyCalls).toHaveLength(1)
  })

  it('sets error and stops loading when a request fails', async () => {
    const fetchMock = vi.fn((url: RequestInfo | URL) => {
      const u = String(url)
      if (u.startsWith('/api/history')) return Promise.resolve(jsonError(500))
      if (u.startsWith('/api/stats/frequency')) return Promise.resolve(jsonOk(mockFrequency))
      if (u.startsWith('/api/stats/trend')) return Promise.resolve(jsonOk(mockTrend))
      if (u.startsWith('/api/stats/hot-cold')) return Promise.resolve(jsonOk(mockHotCold))
      return Promise.reject(new Error(`unexpected url ${u}`))
    })
    vi.mocked(fetch).mockImplementation(fetchMock)

    const { result } = renderHook(() => useLotteryData(1, 15, 30))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('HTTP 500 Server Error')
    expect(result.current.history).toBeNull()
  })
})
