import { useState, useEffect } from 'react'
import type { CheckResult } from '../types'
import { ChartSection } from '../styles/shared'
import {
  SearchInputRow, SearchInput, SearchButton, SearchBalls, SearchBall,
  SearchError, SearchResult, ResultTitle, ResultMatches, MatchItem,
} from '../styles/NumberSearchStyles'

export function NumberSearch() {
  const [input, setInput] = useState('02 06 19 28 32 05 12')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const r = await fetch(`/api/check?numbers=${encodeURIComponent(trimmed)}`)
      if (!r.ok) throw new Error('查询失败')
      const data: CheckResult = await r.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询出错')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const parts = input.trim().split(/\s+/).filter(Boolean)

  return (
    <ChartSection style={{ marginBottom: 24 }}>
      <h3>号码查询</h3>
      <SearchInputRow>
        <SearchInput
          placeholder="输入7个号码，空格分隔，如 02 06 19 28 32 05 12"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </SearchButton>
      </SearchInputRow>

      {parts.length > 0 && (
        <SearchBalls>
          {parts.slice(0, 5).map((n, i) => (
            <SearchBall key={i} $zone="front" $size={+n >= 25 ? 'big' : +n >= 15 ? 'mid' : 'small'}>
              {n.padStart(2, '0')}
            </SearchBall>
          ))}
          {parts.slice(5, 7).map((n, i) => (
            <SearchBall key={i} $zone="back">{n.padStart(2, '0')}</SearchBall>
          ))}
        </SearchBalls>
      )}

      {error && <SearchError>{error}</SearchError>}

      {searched && !loading && result && (
        <SearchResult $hit={result.matched}>
          {result.matched ? (
            <div>
              <ResultTitle>🎉 该号码曾经中过一等奖！</ResultTitle>
              <ResultMatches>
                共中奖 <strong>{result.total_matches}</strong> 次，分别为：
                {result.matches.map(m => (
                  <MatchItem key={m.season}>
                    第 <strong>{m.season}</strong> 期 — {m.number}
                  </MatchItem>
                ))}
              </ResultMatches>
            </div>
          ) : (
            <ResultTitle>😅 该号码从未中过一等奖，继续坚守！</ResultTitle>
          )}
        </SearchResult>
      )}
    </ChartSection>
  )
}
