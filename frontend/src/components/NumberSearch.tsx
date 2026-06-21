import { useState, useEffect } from 'react'
import styled from 'styled-components'
import type { CheckResult } from '../types'
import { SearchInput, SearchButton, SearchBalls, SearchBall } from '../styles/NumberSearchStyles'

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

const InputGroup = styled.div`
  flex: 0 0 50%;
  display: flex;
  gap: 8px;
  min-width: 200px;
`

const CompactResult = styled.span<{ $hit: boolean }>`
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.$hit ? '#e8f5e9' : '#fff3e0'};
  border: 1px solid ${p => p.$hit ? '#a5d6a7' : '#ffcc80'};
  white-space: nowrap;
`

const SearchError = styled.span`
  color: #e74c3c;
  font-size: 12px;
`

export function NumberSearch() {
  const [input, setInput] = useState('02 06 19 28 32 05 12')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

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
    <SearchRow>
      <InputGroup>
        <SearchInput
          placeholder="输入7个号码，空格分隔，如 02 06 19 28 32 05 12"
          value={input}
          onChange={e => { setInput(e.target.value); setResult(null); setError(null) }}
          onKeyDown={handleKeyDown}
        />
        <SearchButton onClick={handleSearch} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </SearchButton>
      </InputGroup>
      {parts.length > 0 && (
        <SearchBalls style={{ marginBottom: 0 }}>
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
      {!loading && result && (
        <CompactResult $hit={result.matched}>
          {result.matched
            ? `中过 ${result.total_matches} 次 — ${result.matches.map(m => m.season).join(', ')}`
            : '该号码从未中过一等奖'}
        </CompactResult>
      )}
    </SearchRow>
  )
}
