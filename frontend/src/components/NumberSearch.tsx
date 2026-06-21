import { useState, useEffect } from 'react'
import type { CheckResult } from '../types'

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
    <div className="chart-section search-section">
      <h3>号码查询</h3>
      <div className="search-input-row">
        <input
          className="search-input"
          placeholder="输入7个号码，空格分隔，如 02 06 19 28 32 05 12"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? '查询中...' : '查询'}
        </button>
      </div>

      {parts.length > 0 && (
        <div className="search-balls">
          {parts.slice(0, 5).map((n, i) => (
            <span key={i} className={`search-ball front-ball ${+n >= 25 ? 'big' : +n >= 15 ? 'mid' : 'small'}`}>
              {n.padStart(2, '0')}
            </span>
          ))}
          {parts.slice(5, 7).map((n, i) => (
            <span key={i} className="search-ball back-ball">{n.padStart(2, '0')}</span>
          ))}
        </div>
      )}

      {error && <div className="search-error">{error}</div>}

      {searched && !loading && result && (
        <div className={`search-result ${result.matched ? 'hit' : 'miss'}`}>
          {result.matched ? (
            <div>
              <div className="result-title">🎉 该号码曾经中过一等奖！</div>
              <div className="result-matches">
                共中奖 <strong>{result.total_matches}</strong> 次，分别为：
                {result.matches.map(m => (
                  <div key={m.season} className="match-item">
                    第 <strong>{m.season}</strong> 期 — {m.number}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="result-title">😅 该号码从未中过一等奖，继续坚守！</div>
          )}
        </div>
      )}
    </div>
  )
}
